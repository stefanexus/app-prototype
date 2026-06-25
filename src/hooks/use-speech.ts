import { useCallback, useEffect, useRef, useState } from 'react';

import { speak as speakRaw, cancelSpeech, isSpeechSupported } from '../lib/speech';

// ----------------------------------------------------------------------
// useSpeech — React wrapper around the speech helper. Exposes a live
// `speaking` flag (for driving the avatar's `speaking` state) and tears
// down any in-flight speech on unmount so navigating away stops the voice.
// ----------------------------------------------------------------------

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelSpeech();
    };
  }, []);

  const speak = useCallback(
    (
      text: string,
      voiceId?: string,
      opts?: { onStart?: () => void; onEnd?: () => void }
    ) => {
      speakRaw(text, {
        voiceId,
        onStart: () => {
          if (mounted.current) setSpeaking(true);
          opts?.onStart?.();
        },
        onEnd: () => {
          if (mounted.current) setSpeaking(false);
          opts?.onEnd?.();
        },
      });
    },
    []
  );

  const stop = useCallback(() => {
    cancelSpeech();
    if (mounted.current) setSpeaking(false);
  }, []);

  return { speaking, speak, stop, supported: isSpeechSupported() };
}
