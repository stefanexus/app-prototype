import { z } from 'zod';
import type { Dayjs } from 'dayjs';

// ----------------------------------------------------------------------
// Local-state form schema for the 4-step onboarding wizard.
// Prototype-grade validation: only the avatar name (step 1) and the
// identity name (step 2) are required; everything else is optional.
// Time fields are kept as dayjs values in local state (TimePicker).
// ----------------------------------------------------------------------

const dayjsField = z.custom<Dayjs | null>(
  (val) => val === null || (typeof val === 'object' && val !== null && 'isValid' in val),
  { message: 'Invalid time' }
);

export const onboardingSchema = z.object({
  // Step 1 — Avatar
  avatarName: z.string().trim().min(1, 'Give your avatar a name'),
  gender: z.enum(['female', 'male', 'nonbinary', 'unspecified']),
  appearanceId: z.string().min(1),
  voiceId: z.string().min(1),
  personalityTone: z.enum(['friendly', 'professional', 'playful']),

  // Step 2 — Identity
  name: z.string().trim().min(1, 'What should we call you?'),
  age: z.union([z.number().int().min(0).max(120), z.literal('')]),

  // Step 3 — Health & lifestyle
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active']),
  dietaryRestrictions: z.array(z.string()),
  fitnessGoals: z.string(),
  wakeTime: dayjsField,
  sleepTime: dayjsField,

  // Step 4 — Work & hobbies
  jobType: z.string(),
  workingHours: z.string(),
  stressLevel: z.enum(['low', 'medium', 'high']),
  hobbyTags: z.array(z.string()),
  subscriptionTags: z.array(z.string()),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// Fields validated per step — used to gate the "Next" button.
export const STEP_FIELDS: (keyof OnboardingFormValues)[][] = [
  ['avatarName', 'gender', 'appearanceId', 'voiceId', 'personalityTone'],
  ['name', 'age'],
  ['activityLevel', 'dietaryRestrictions', 'fitnessGoals', 'wakeTime', 'sleepTime'],
  ['jobType', 'workingHours', 'stressLevel', 'hobbyTags', 'subscriptionTags'],
];

export const STEP_META = [
  { title: 'Design your avatar', subtitle: 'Make it feel like yours.' },
  { title: 'About you', subtitle: 'The basics so we get you right.' },
  { title: 'Health & lifestyle', subtitle: 'Helps tailor daily nudges.' },
  { title: 'Work & hobbies', subtitle: 'What fills your days.' },
];
