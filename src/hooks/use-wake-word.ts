import { useCallback, useEffect, useRef, useState } from 'react';

// ----------------------------------------------------------------------
// useWakeWord - listens on the mic (Web Speech API SpeechRecognition) for a
// spoken trigger word and fires onWake when it hears it. Used so the user can
// say the avatar's name ("Nova") to start a conversation, as an alternative to
// tapping the orb. The tap path always works; this is purely additive:
//   - Unsupported browser (Safari/Firefox) -> supported:false, never fires.
//   - Mic permission denied -> blocked status; tap still works.
// Recognition is continuous and auto-restarts (Chrome ends it periodically)
// for as long as `enabled` stays true - typically only while the orb is idle.
// ----------------------------------------------------------------------

// Minimal Web Speech API typings - these are not in TypeScript's DOM lib.
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

export function transcriptContainsWakePhrase(
  transcript: string,
  phrase: string
): boolean {
  const needle = phrase.trim().toLowerCase();
  if (!needle) return false;
  return transcript.toLowerCase().includes(needle);
}

export type WakeWordStatus =
  | 'unsupported'
  | 'inactive'
  | 'needs-gesture'
  | 'starting'
  | 'listening'
  | 'blocked'
  | 'error';

type UseWakeWordOptions = {
  /** Word/phrase to listen for (case-insensitive substring match). */
  phrase: string;
  /** Listen only while true (e.g. when the orb is idle). */
  enabled: boolean;
  /** Fired when the phrase is heard. */
  onWake: () => void;
};

export function useWakeWord({ phrase, enabled, onWake }: UseWakeWordOptions) {
  const [initialSupport] = useState(() => getRecognitionCtor() != null);
  const [status, setStatus] = useState<WakeWordStatus>(
    initialSupport ? 'inactive' : 'unsupported'
  );

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
  const needsGestureRef = useRef(false);
  const permissionDeniedRef = useRef(false);
  const lastStartWasGestureRef = useRef(false);
  const wokeRef = useRef(false);

  const startRecognition = useCallback((fromGesture = false) => {
    const rec = recRef.current;
    if (!rec || !enabledRef.current || runningRef.current) return;
    if (fromGesture) needsGestureRef.current = false;
    lastStartWasGestureRef.current = fromGesture;

    if (permissionDeniedRef.current) {
      setStatus('blocked');
      return;
    }
    if (!fromGesture && needsGestureRef.current) {
      setStatus('needs-gesture');
      return;
    }

    try {
      setStatus('starting');
      rec.start();
      runningRef.current = true;
      setStatus('listening');
    } catch {
      // Chrome can throw if start() races an already-starting recogniser.
      if (!runningRef.current) setStatus('error');
    }
  }, []);

  // Build the recogniser once per phrase.
  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    recRef.current = rec;

    let disposed = false;
    permissionDeniedRef.current = false;
    wokeRef.current = false;

    rec.onresult = (event) => {
      if (!enabledRef.current || wokeRef.current) return;
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (transcriptContainsWakePhrase(transcript, phrase)) {
          wokeRef.current = true;
          onWakeRef.current();
          try {
            rec.stop();
          } catch {
            /* ignore */
          }
          break;
        }
      }
    };

    rec.onerror = (event) => {
      if (disposed || event.error === 'aborted') return;

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        runningRef.current = false;
        if (lastStartWasGestureRef.current) {
          permissionDeniedRef.current = true;
          needsGestureRef.current = false;
          setStatus('blocked');
        } else {
          // Some browsers reject SpeechRecognition.start() until it follows a
          // real user gesture. Keep the wake word available and retry then.
          needsGestureRef.current = true;
          setStatus('needs-gesture');
        }
        return;
      }

      if (event.error !== 'no-speech') {
        runningRef.current = false;
        setStatus('error');
      }
    };

    rec.onend = () => {
      runningRef.current = false;
      if (disposed) return;

      if (!enabledRef.current || wokeRef.current) {
        setStatus('inactive');
        return;
      }
      if (permissionDeniedRef.current) {
        setStatus('blocked');
        return;
      }

      // Chrome ends recognition periodically; resume while still wanted.
      startRecognition(false);
    };

    const startTimer = window.setTimeout(() => startRecognition(false), 0);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
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
  }, [phrase, startRecognition]);

  // A real browser gesture gives SpeechRecognition a reliable permission path.
  useEffect(() => {
    if (!initialSupport) return;

    const handleGesture = () => startRecognition(true);
    document.addEventListener('pointerdown', handleGesture, true);
    document.addEventListener('keydown', handleGesture, true);

    return () => {
      document.removeEventListener('pointerdown', handleGesture, true);
      document.removeEventListener('keydown', handleGesture, true);
    };
  }, [initialSupport, startRecognition]);

  // Start / stop as the caller toggles `enabled`.
  useEffect(() => {
    const rec = recRef.current;
    if (!rec) return;

    if (enabled) {
      wokeRef.current = false;
      const startTimer = window.setTimeout(() => startRecognition(false), 0);
      return () => window.clearTimeout(startTimer);
    }

    if (runningRef.current) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    const stopTimer = window.setTimeout(() => setStatus('inactive'), 0);
    return () => window.clearTimeout(stopTimer);
  }, [enabled, startRecognition]);

  return {
    supported: initialSupport,
    status,
    listening: status === 'starting' || status === 'listening',
    blocked: status === 'blocked',
    arm: () => startRecognition(true),
  };
}
