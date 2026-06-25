// ----------------------------------------------------------------------
// Speech (text-to-speech) helper — OpenRouter "Grok Voice" TTS.
//
// speak() POSTs text to OpenRouter's /audio/speech endpoint and plays the
// returned MP3. The same onStart/onEnd lifecycle fires so the avatar's
// `speaking` state (mouth animation) keeps working unchanged. If the request
// fails (network / CORS / quota) it falls back to the browser's Web Speech
// voice so the avatar never goes silent.
//
// The key is read from VITE_OPENROUTER_API_KEY (.env.local). NOTE: Vite inlines
// this into the browser bundle, so it's only safe for a local prototype —
// move it behind a small proxy before any real deployment.
// ----------------------------------------------------------------------

const OPENROUTER_TTS_URL = 'https://openrouter.ai/api/v1/audio/speech';
const GROK_TTS_MODEL = 'x-ai/grok-voice-tts-1.0';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export type SpeakOptions = {
  /** Catalogue voice id (see VOICE_OPTIONS); falls back to a default voice. */
  voiceId?: string;
  /** Fired when audio actually starts — use to drive the speaking state. */
  onStart?: () => void;
  /** Fired when audio finishes OR errors, so callers can always reset. */
  onEnd?: () => void;
};

// Catalogue voice id -> Grok voice. Options: Eve, Ara, Rex, Sal, Leo.
const GROK_VOICE_BY_ID: Record<string, string> = {
  samantha: 'Eve', // warm female
  daniel: 'Rex', // male
  aria: 'Ara', // bright female
  rishi: 'Sal', // male
};
const DEFAULT_GROK_VOICE = 'Eve';

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** True if any TTS is available (cloud in a browser, or Web Speech). */
export function isTtsSupported(): boolean {
  return typeof window !== 'undefined';
}

// The audio element currently playing (for cancellation) + its object URL, and
// a token that invalidates in-flight requests: if speak()/cancel() runs again
// while a fetch is still pending, the stale result is discarded.
let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let speakToken = 0;

function stopAudio(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.onplay = null;
      currentAudio.onended = null;
      currentAudio.onerror = null;
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  const token = ++speakToken;
  stopAudio();

  const voice =
    (opts.voiceId && GROK_VOICE_BY_ID[opts.voiceId]) || DEFAULT_GROK_VOICE;

  if (!API_KEY) {
    console.warn('[tts] Missing VITE_OPENROUTER_API_KEY — using browser voice.');
    speakViaWebSpeech(text, opts);
    return;
  }

  fetch(OPENROUTER_TTS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROK_TTS_MODEL,
      input: text,
      voice,
      response_format: 'mp3',
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text().catch(() => '')}`);
      }
      return res.arrayBuffer();
    })
    .then((buffer) => {
      if (token !== speakToken) return; // superseded while fetching
      const url = URL.createObjectURL(new Blob([buffer], { type: 'audio/mpeg' }));
      const el = new Audio(url);
      currentAudio = el;
      currentUrl = url;
      el.onplay = () => opts.onStart?.();
      el.onended = () => {
        if (currentAudio === el) stopAudio();
        opts.onEnd?.();
      };
      el.onerror = () => {
        if (currentAudio === el) stopAudio();
        opts.onEnd?.();
      };
      el.play().catch(() => {
        if (currentAudio === el) stopAudio();
        opts.onEnd?.();
      });
    })
    .catch((err) => {
      if (token !== speakToken) return;
      console.error('[tts] OpenRouter request failed, using browser voice:', err);
      speakViaWebSpeech(text, opts);
    });
}

// Minimal browser-voice fallback so the avatar still speaks if the request
// fails. No voice matching — keep it simple.
function speakViaWebSpeech(text: string, opts: SpeakOptions): void {
  if (!isSpeechSupported()) {
    opts.onStart?.();
    opts.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.onstart = () => opts.onStart?.();
  utter.onend = () => opts.onEnd?.();
  utter.onerror = () => opts.onEnd?.();
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech(): void {
  speakToken++; // invalidate any in-flight request
  stopAudio();
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
