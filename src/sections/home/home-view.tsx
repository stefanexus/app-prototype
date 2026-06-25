import { useState } from 'react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { toast } from 'sonner';

import type { AvatarState } from '../../types';
import { DEFAULT_AVATAR, MOCK_NUDGES } from '../../_mock';

import HomePresence from './home-presence';
import HomeGlance from './home-glance';
import HomeQuickActions from './home-quick-actions';

// ----------------------------------------------------------------------
// Home dashboard (content only — AppLayout provides the MobileShell frame,
// padding and the bottom navigation). The screen is built to fit the phone
// height with NO scroll: the avatar hero centres in the flexible space and
// the question chips + "Today at a glance" pin just above the nav.
//   - The orb itself is the tap-to-talk mic (PRD stories 4-6).
//   - While listening, the bottom group dims so the talk feels focused.
// Mirrors PRD stories 4-7, 13-14, 25-26 and the Suggestion Engine preview.
// ----------------------------------------------------------------------

export default function HomeView() {
  const nudge = MOCK_NUDGES[0];

  // Visual-only listening state. Toggles the orb between idle/listening.
  const [listening, setListening] = useState(false);
  const orbState: AvatarState = listening ? 'listening' : 'idle';

  // Orb diameter flexes with viewport height so everything fits with no
  // scroll, even on short devices (the orb gives before anything clips).
  const tall = useMediaQuery('(min-height: 800px)');
  const short = useMediaQuery('(max-height: 680px)');
  const orbSize = short ? 104 : tall ? 140 : 124;

  const handleToggleListening = () => {
    setListening((prev) => {
      const next = !prev;
      if (next) {
        toast(`${DEFAULT_AVATAR.name} is listening…`, {
          description: 'Speak naturally — tap again to stop.',
        });
      } else {
        toast('Stopped listening.');
      }
      return next;
    });
  };

  const handleQuickAction = (label: string) => {
    toast(`"${label}"`, {
      description: `${DEFAULT_AVATAR.name} is thinking about that…`,
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* hero — tappable avatar (the mic) + the avatar's nudge. Grows to
          absorb spare height on tall phones, shrinks on short ones. */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <HomePresence
          state={orbState}
          appearanceId={DEFAULT_AVATAR.appearanceId}
          avatarName={DEFAULT_AVATAR.name}
          nudge={nudge}
          listening={listening}
          onToggle={handleToggleListening}
          orbSize={orbSize}
        />
      </Box>

      {/* bottom group — predefined questions + glance, pinned above the nav.
          Dimmed + non-interactive while the avatar is listening. */}
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          pt: 1.5,
          opacity: listening ? 0.4 : 1,
          pointerEvents: listening ? 'none' : 'auto',
          transition: 'opacity 0.3s ease',
        }}
      >
        <HomeQuickActions onAction={handleQuickAction} />
        <HomeGlance />
      </Box>
    </Box>
  );
}
