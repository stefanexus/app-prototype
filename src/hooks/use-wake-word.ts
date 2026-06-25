import { useEffect, useRef, useState } from 'react';

// ----------------------------------------------------------------------
// useWakeWord — listens on the mic (Web Speech API SpeechRecognition) for a
// spoken trigger word and fires onWake when it hears it. Used so the user can
// say the avatar's name ("Nova") to start a conversation, as an alternative to
// tapping the orb. The tap path always works; this is purely additive:
//   - Unsupported browser (Safari/Firefox) → supported:false, never fires.
//   - Mic permission denied → stops trying silently; tap still works.
// Recognition is continuous and auto-restarts (Chrome ends it periodically)
// for as long as `enabled` stays true — typically only while the orb is idle.
// ----------------------------------------------------------------------

// Minimal Web Speech API typings — these aren't in TypeScript's DOM lib.
interface SpeechRecognitionAlternativeLike {
  transcript: string;
}
interface SpeechRecognitionResultLike {
  readonly length: number;
  0: SpeechRecognitionAlternativeLike;
}
interface SpeechRecognitionResultListLike {
  readonly length: number;
  [index: number]: SpeechRecognitionResultLike;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: SpeechRecognitionResultListLike;
}
interface SpeechRecognitionErrorEventLike {
  error: string;
}
interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type UseWakeWordOptions = {
  /** Word/phrase to listen for (case-insensitive substring match). */
  phrase: string;
  /** Listen only while true (e.g. when the orb is idle). */
  enabled: boolean;
  /** Fired when the phrase is heard. */
  onWake: () => void;
};

export function useWakeWord({ phrase, enabled, onWake }: UseWakeWordOptions) {
  const [supported] = useState(() => getRecognitionCtor() != null);

  // Latest callback / enabled flag, read by long-lived recogniser handlers
  // without re-creating the recogniser on every change.
  const onWakeRef = useRef(onWake);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    onWakeRef.current = onWake;
    enabledRef.current = enabled;
  }, [onWake, enabled]);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const runningRef = useRef(false);

  // Build the recogniser once (phrase is effectively stable).
  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recRef.current = rec;

    const needle = phrase.trim().toLowerCase();
    let disposed = false;
    let permissionDenied = false;

    rec.onresult = (event) => {
      if (!needle || !enabledRef.current) return;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (transcript.includes(needle)) {
          onWakeRef.current();
          break;
        }
      }
    };

    rec.onerror = (event) => {
      // Mic blocked — stop auto-restarting so we don't loop on errors.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        permissionDenied = true;
      }
    };

    rec.onend = () => {
      runningRef.current = false;
      // Chrome ends recognition periodically; resume while still wanted.
      if (!disposed && !permissionDenied && enabledRef.current) {
        try {
          rec.start();
          runningRef.current = true;
        } catch {
          /* a later `enabled` toggle will retry */
        }
      }
    };

    if (enabledRef.current) {
      try {
        rec.start();
        runningRef.current = true;
      } catch {
        /* ignore — the enabled effect will retry */
      }
    }

    return () => {
      disposed = true;
      rec.onresult = null;
      rec.onend = null;
      rec.onerror = null;
      try {
        rec.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
      runningRef.current = false;
    };
  }, [phrase]);

  // Start / stop as the caller toggles `enabled`.
  useEffect(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (enabled && !runningRef.current) {
      try {
        rec.start();
        runningRef.current = true;
      } catch {
        /* already starting */
      }
    } else if (!enabled && runningRef.current) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
  }, [enabled]);

  return { supported };
}
