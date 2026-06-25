import type {
  AvatarAppearance,
  PersonalityOption,
  VoiceOption,
} from '../types';

// ----------------------------------------------------------------------
// Static catalogues for onboarding & settings selection UIs.
// No real avatar art yet — appearances are represented as gradient orbs.
// ----------------------------------------------------------------------

export const AVATAR_APPEARANCES: AvatarAppearance[] = [
  { id: 'nova', label: 'Nova', gradient: 'radial-gradient(circle at 30% 30%, #A78BFA, #7C3AED 45%, #5B21B6)', accent: '#7C3AED' },
  { id: 'aura', label: 'Aura', gradient: 'radial-gradient(circle at 30% 30%, #67E8F9, #22D3EE 45%, #0E7490)', accent: '#22D3EE' },
  { id: 'ember', label: 'Ember', gradient: 'radial-gradient(circle at 30% 30%, #FDBA74, #F97316 45%, #C2410C)', accent: '#F97316' },
  { id: 'blossom', label: 'Blossom', gradient: 'radial-gradient(circle at 30% 30%, #F9A8D4, #EC4899 45%, #BE185D)', accent: '#EC4899' },
  { id: 'sage', label: 'Sage', gradient: 'radial-gradient(circle at 30% 30%, #6EE7B7, #10B981 45%, #047857)', accent: '#10B981' },
  { id: 'dusk', label: 'Dusk', gradient: 'radial-gradient(circle at 30% 30%, #818CF8, #4F46E5 45%, #3730A3)', accent: '#6366F1' },
];

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    id: 'friendly',
    label: 'Friendly & warm',
    description: 'Talks to you like a close, caring friend.',
    icon: 'solar:smile-circle-bold-duotone',
  },
  {
    id: 'professional',
    label: 'Professional & concise',
    description: 'Straight to the point, calm and efficient.',
    icon: 'solar:case-minimalistic-bold-duotone',
  },
  {
    id: 'playful',
    label: 'Playful & funny',
    description: 'Light-hearted, witty and full of energy.',
    icon: 'solar:confetti-bold-duotone',
  },
];

// These map to real system voices exposed by window.speechSynthesis.
// `systemVoiceNames` lists the closest matches per platform (best first);
// the preview hook falls back to language + pitch/rate so each option
// still sounds distinct on machines with a limited voice set.
export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'samantha',
    label: 'Samantha',
    description: 'Warm · English (US) · Female',
    lang: 'en-US',
    systemVoiceNames: ['Samantha', 'Microsoft Zira', 'Google US English', 'Allison'],
    pitch: 1.05,
    rate: 1,
    sample: "Hi there! I'm Samantha. I'm really glad we're getting to know each other.",
  },
  {
    id: 'daniel',
    label: 'Daniel',
    description: 'Calm · English (UK) · Male',
    lang: 'en-GB',
    systemVoiceNames: ['Daniel', 'Google UK English Male', 'Microsoft George', 'Arthur'],
    pitch: 0.9,
    rate: 0.95,
    sample: "Hello, I'm Daniel. Take a breath — I'm here to help, calmly and clearly.",
  },
  {
    id: 'aria',
    label: 'Aria',
    description: 'Bright · English (US) · Female',
    lang: 'en-US',
    // Aria is a Windows/Edge voice; on macOS we fall back to a real female
    // en-US voice (never a novelty one), kept bright via the higher pitch.
    systemVoiceNames: ['Aria', 'Microsoft Aria', 'Kathy', 'Victoria', 'Allison', 'Samantha'],
    pitch: 1.2,
    rate: 1.08,
    sample: "Hey! I'm Aria. Ready when you are — let's make today a great one!",
  },
  {
    id: 'rishi',
    label: 'Rishi',
    description: 'Smooth · English (IN) · Male',
    lang: 'en-IN',
    systemVoiceNames: ['Rishi', 'Microsoft Prabhat', 'Google हिन्दी', 'Google UK English Male'],
    pitch: 0.95,
    rate: 0.92,
    sample: "Hello, I'm Rishi. It's a real pleasure to meet you. Shall we begin?",
  },
];

// ---- option lists for questionnaire fields ----

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Dairy-free',
  'Nut allergy',
  'Halal',
  'Kosher',
  'Low-carb',
  'No restrictions',
];

export const HOBBY_OPTIONS = [
  'Reading',
  'Gaming',
  'Cooking',
  'Running',
  'Yoga',
  'Photography',
  'Music',
  'Hiking',
  'Painting',
  'Cycling',
  'Gardening',
  'Travel',
  'Writing',
  'Movies',
];

export const SUBSCRIPTION_OPTIONS = [
  'Netflix',
  'Spotify',
  'Disney+',
  'Amazon Prime',
  'YouTube Premium',
  'Apple iCloud',
  'HBO Max',
  'Hulu',
  'Audible',
  'Xbox Game Pass',
  'ChatGPT Plus',
  'Notion',
  'Gym membership',
  'Patreon',
];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Lightly active' },
  { value: 'moderate', label: 'Moderately active' },
  { value: 'active', label: 'Very active' },
] as const;

export const STRESS_LEVELS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'unspecified', label: 'Prefer not to say' },
] as const;
