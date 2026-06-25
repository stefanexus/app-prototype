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

// In the real app these come from window.speechSynthesis.getVoices().
// For the visual prototype we present a representative static list.
export const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'samantha', label: 'Samantha', description: 'Warm · English (US) · Female' },
  { id: 'daniel', label: 'Daniel', description: 'Calm · English (UK) · Male' },
  { id: 'aria', label: 'Aria', description: 'Bright · English (US) · Female' },
  { id: 'rishi', label: 'Rishi', description: 'Smooth · English (IN) · Male' },
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
