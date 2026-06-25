import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { toast } from 'sonner';

import type { AvatarState } from '../../types';
import { MOCK_NUDGES, SCRIPTED_REPLIES } from '../../_mock';
import type { ReplyExplanation, ScriptedReply } from '../../_mock';
import { useAvatarConfig } from '../../hooks/use-avatar-config';
import { useSpeech } from '../../hooks/use-speech';
import { useWakeWord } from '../../hooks/use-wake-word';
import { prefetchSpeech, unlockAudio } from '../../lib/speech';

import HomePresence from './home-presence';
import HomeGlance from './home-glance';
import HomeQuickActions from './home-quick-actions';

// ----------------------------------------------------------------------
// Home dashboard (content only — AppLayout provides the MobileShell frame,
// padding and the bottom navigation). The screen scrolls when answer details
// are present while the bottom navigation remains pinned by the shell.
//
// Conversation flow (PRD stories 4-7): the orb is the tap-to-talk control.
//   idle ──tap / say avatar name──▶ listening ──tap──▶ (thinking) ──▶ speaking
// The avatar then "answers" with a scripted reply (the LLM is faked). Taps
// cycle through SCRIPTED_REPLIES in order; the quick-action chips jump
// straight to their matching reply. Tapping while it talks interrupts.
// ----------------------------------------------------------------------

export default function HomeView() {
  const { avatar } = useAvatarConfig();
  const avatarName = avatar.name.trim() || 'your avatar';
  const wakePhrase = avatar.name.trim();
  const nudge = MOCK_NUDGES[0];

  // `speaking` is owned by the speech engine (so the mouth animates with the
  // real audio). We track `listening`/`thinking` here; the avatar state is
  // derived from all three, with speaking taking precedence.
  const { speaking, speak, stop } = useSpeech();
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  // Whether the speech bubble is expanded to show the full reply.
  const [expanded, setExpanded] = useState(false);

  const orbState: AvatarState = speaking
    ? 'speaking'
    : thinking
      ? 'thinking'
      : listening
        ? 'listening'
        : 'idle';

  // Collapse the bubble whenever the conversation moves on (new reply, starts
  // listening, returns to idle) so the overlay never lingers over stale text.
  useEffect(() => {
    const timer = window.setTimeout(() => setExpanded(false), 0);
    return () => window.clearTimeout(timer);
  }, [orbState]);

  // Mirror the state for handlers that must read it without re-subscribing
  // (the wake-word callback lives in a long-lived recogniser).
  const stateRef = useRef(orbState);
  useEffect(() => {
    stateRef.current = orbState;
  }, [orbState]);

  // Which scripted reply the orb plays next (cycles through the list).
  const replyIndex = useRef(0);
  const [spokenText, setSpokenText] = useState('');
  const [replyExplanation, setReplyExplanation] = useState<ReplyExplanation | null>(null);

  // Warm the first sentence of each reply in the background so the first words
  // play instantly; speak() streams the rest sentence-by-sentence on demand, so
  // there's no need to generate every clip up front.
  useEffect(() => {
    SCRIPTED_REPLIES.forEach((r) =>
      prefetchSpeech(r.text, avatar.voiceId, { lead: true })
    );
  }, [avatar.voiceId]);

  // Voice activation: saying the avatar's name starts a conversation. Only
  // armed while idle; tapping the orb does the same thing without the mic.
  const {
    supported: wakeSupported,
    status: wakeStatus,
    arm: armWakeWord,
  } = useWakeWord({
    phrase: wakePhrase,
    enabled: orbState === 'idle' && wakePhrase.length > 0,
    onWake: () => {
      if (stateRef.current === 'idle') setListening(true);
    },
  });

  // Speak a scripted reply: brief "thinking" while the clip loads, then the
  // mouth runs with the audio. onEnd also covers errors so we never get stuck.
  const playReply = (reply: ScriptedReply) => {
    setSpokenText(reply.text);
    setReplyExplanation(reply.explanation ?? null);
    setListening(false);
    setThinking(true);
    speak(reply.text, avatar.voiceId, {
      onStart: () => setThinking(false),
      onEnd: () => setThinking(false),
    });
  };

  const handleTap = () => {
    armWakeWord();
    // Unlock audio on this gesture so the first reply isn't silent (browsers
    // only resume an AudioContext from inside a user gesture).
    unlockAudio();
    // Talking (or loading) → interrupt and reset to idle.
    if (speaking || thinking) {
      stop();
      setThinking(false);
      setListening(false);
      return;
    }
    // Listening → the user is "done"; answer with the next scripted reply.
    if (listening) {
      const reply = SCRIPTED_REPLIES[replyIndex.current % SCRIPTED_REPLIES.length];
      replyIndex.current += 1;
      playReply(reply);
      return;
    }
    // Idle → start listening.
    setListening(true);
  };

  const handleQuickAction = (label: string) => {
    unlockAudio(); // same gesture-unlock as the orb tap
    const reply = SCRIPTED_REPLIES.find((r) => r.chip === label);
    if (reply) {
      playReply(reply);
      return;
    }
    toast(`"${label}"`, {
      description: `${avatarName} is thinking about that…`,
    });
  };

  // Orb diameter flexes with viewport height so everything fits with no
  // scroll, even on short devices (the orb gives before anything clips).
  const tall = useMediaQuery('(min-height: 800px)');
  const short = useMediaQuery('(max-height: 680px)');
  const orbSize = short ? 104 : tall ? 140 : 124;

  // The bottom group is muted + non-interactive whenever the avatar is busy
  // (listening, thinking or speaking) so the conversation feels focused — and
  // also while the bubble is expanded over it, so the overlay reads cleanly.
  const busy = orbState !== 'idle';
  const dimmed = busy || expanded;
  const showReplyExplanation = !!replyExplanation && !listening && !thinking;

  return (
    <Box sx={{ minHeight: '100%', display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
      {/* hero — tappable avatar (the mic) + the avatar's nudge. Grows to
          absorb spare height on tall phones, shrinks on short ones. */}
      <Box
        sx={{
          flex: showReplyExplanation ? '0 0 auto' : '1 1 auto',
          minHeight: showReplyExplanation ? 'auto' : 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: showReplyExplanation ? 'flex-start' : 'center',
          pt: showReplyExplanation ? 1 : 0,
          // sit above the bottom group so the expanded bubble overlays it
          position: 'relative',
          zIndex: expanded ? 2 : 1,
        }}
      >
        <HomePresence
          state={orbState}
          appearanceId={avatar.appearanceId}
          avatarName={avatarName}
          nudge={nudge}
          spokenText={spokenText}
          wakeWord={wakeSupported && wakePhrase ? avatarName : undefined}
          wakeStatus={wakeStatus}
          onToggle={handleTap}
          orbSize={orbSize}
          expanded={expanded}
          onToggleExpand={() => setExpanded((v) => !v)}
        />
      </Box>

      {showReplyExplanation && <HomeGlance explanation={replyExplanation} />}

      {/* bottom group — predefined questions for the next prompt.
          Dimmed + non-interactive while the avatar is busy. */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 1.5,
          position: 'relative',
          zIndex: 1,
          opacity: dimmed ? 0.4 : 1,
          pointerEvents: dimmed ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
        }}
      >
        <HomeQuickActions onAction={handleQuickAction} />
      </Box>
    </Box>
  );
}
