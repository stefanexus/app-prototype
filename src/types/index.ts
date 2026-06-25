// ----------------------------------------------------------------------
// Shared domain types for the Personal Avatar Assistant prototype.
// These mirror the Profile Store described in the PRD.
// ----------------------------------------------------------------------

export type PersonalityTone = 'friendly' | 'professional' | 'playful';

export type Gender = 'female' | 'male' | 'nonbinary' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export type StressLevel = 'low' | 'medium' | 'high';

export interface AvatarConfig {
  name: string;
  gender: Gender;
  appearanceId: string; // references an AvatarAppearance.id
  voiceId: string; // references a VoiceOption.id
  personalityTone: PersonalityTone;
}

export interface IdentityProfile {
  name: string;
  age: number | '';
  location: string;
  timezone: string;
}

export interface HealthProfile {
  activityLevel: ActivityLevel;
  dietaryRestrictions: string[];
  fitnessGoals: string;
  wakeTime: string; // "07:00"
  sleepTime: string; // "23:00"
}

export interface WorkProfile {
  jobType: string;
  workingHours: string; // "09:00 - 17:00"
  stressLevel: StressLevel;
  hobbyTags: string[];
  subscriptionTags: string[];
}

export interface UserProfile {
  identity: IdentityProfile;
  health: HealthProfile;
  work: WorkProfile;
}

export interface ConversationEntry {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// A single thread in the History list. The prototype only ships a transcript
// for the first (most recent) conversation; the rest are visual placeholders
// flagged with `locked`, so only the unlocked one can be opened.
export interface ConversationSummary {
  id: string;
  title: string;
  preview: string; // snippet of the most recent message
  timestamp: number; // last activity, used for the relative-time label
  messageCount: number;
  icon: string; // iconify name representing the thread's topic
  accent: string; // hex tint for the icon tile
  locked?: boolean;
}

// ---- catalogue option shapes (used by onboarding & settings) ----

export interface AvatarAppearance {
  id: string;
  label: string;
  gradient: string; // CSS gradient for the placeholder orb
  accent: string;
}

export interface VoiceOption {
  id: string;
  label: string;
  description: string;
  // --- Web Speech API preview config ---
  lang: string; // BCP-47 tag used to match a system voice (e.g. 'en-US')
  systemVoiceNames: string[]; // preferred OS voice names, best match first
  pitch: number; // 0–2; keeps voices distinct when few are installed
  rate: number; // 0.1–10; speaking speed
  sample: string; // line spoken when the user previews this voice
}

export interface PersonalityOption {
  id: PersonalityTone;
  label: string;
  description: string;
  icon: string; // iconify name
}

// Avatar visual presence states (orb animation), per PRD Avatar Engine.
export type AvatarState = 'idle' | 'listening' | 'speaking' | 'thinking';
