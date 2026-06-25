import { useCallback, useEffect, useRef, useState } from 'react';

import type { VoiceOption } from '../types';
import { VOICE_OPTIONS } from '../_mock';
import { speak, cancelSpeech, isTtsSupported, prefetchSpeech } from '../lib/speech';

// ----------------------------------------------------------------------
// Speaks a short sample line for a chosen voice using the SHARED speech
// engine (src/lib/speech.ts): Puter cloud TTS first, with the browser's
// Web Speech API as an automatic fallback. This means a previewed sample
// sounds exactly like the avatar will when it actually speaks — pick a
// voice here and that's what you'll hear on the Home screen.
// ----------------------------------------------------------------------

type PreviewResult = 'spoken' | 'unsupported';

export function useVoicePreview() {
  // id of the voice currently playing (for "playing" UI), or null.
  const [playingId, setPlayingId] = useState<string | null>(null);
  // Mirrors playingId synchronously so async callbacks can ignore stale ones.
  const currentId = useRef<string | null>(null);

  const stop = useCallback(() => {
    cancelSpeech();
    currentId.current = null;
    setPlayingId(null);
  }, []);

  const preview = useCallback(
    async (option: VoiceOption): Promise<PreviewResult> => {
      if (!isTtsSupported()) return 'unsupported';

      // Clicking the voice that's already playing toggles it off.
      if (currentId.current === option.id) {
        stop();
        return 'spoken';
      }

      // Mark it playing immediately for responsive UI; speak() stops any
      // other in-flight sample itself, and onEnd clears the flag when done.
      currentId.current = option.id;
      setPlayingId(option.id);
      speak(option.sample, {
        voiceId: option.id,
        onEnd: () => {
          // Ignore if another voice has since taken over.
          if (currentId.current === option.id) {
            currentId.current = null;
            setPlayingId(null);
          }
        },
      });
      return 'spoken';
    },
    [stop]
  );

  // Warm every voice sample in the background as soon as the picker opens, so
  // the first Preview click plays instantly instead of waiting ~2s on Grok.
  useEffect(() => {
    VOICE_OPTIONS.forEach((v) => prefetchSpeech(v.sample, v.id));
  }, []);

  // Stop narration when the consuming screen unmounts.
  useEffect(() => () => cancelSpeech(), []);

  return { playingId, preview, stop };
}
