import type {
  AvatarConfig,
  ConversationEntry,
  UserProfile,
} from '../types';

// ----------------------------------------------------------------------
// Mocked integration + sample data for the visual prototype.
// Mirrors the PRD "Mock Data Layer". No real device integrations.
// ----------------------------------------------------------------------

export interface FitnessData {
  steps: number;
  goalSteps: number;
  activeMinutes: number;
  lastWorkout: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  relationship: string;
  lastContactDays: number;
  avatarColor: string;
}

export const MOCK_FITNESS: FitnessData = {
  steps: 3240,
  goalSteps: 8000,
  activeMinutes: 22,
  lastWorkout: '3 days ago',
};

export const MOCK_CALENDAR: CalendarEvent[] = [
  { id: 'c1', title: 'Team standup', time: '10:30', icon: 'solar:users-group-rounded-bold-duotone', color: '#7C3AED' },
  { id: 'c2', title: 'Lunch with Maya', time: '13:00', icon: 'solar:cup-hot-bold-duotone', color: '#22D3EE' },
  { id: 'c3', title: 'Dentist appointment', time: '16:45', icon: 'solar:health-bold-duotone', color: '#EC4899' },
];

export const MOCK_CONTACTS: ContactInfo[] = [
  { id: 'p1', name: 'Mum', relationship: 'Family', lastContactDays: 10, avatarColor: '#EC4899' },
  { id: 'p2', name: 'Alex', relationship: 'Close friend', lastContactDays: 4, avatarColor: '#22D3EE' },
  { id: 'p3', name: 'Jordan', relationship: 'Colleague', lastContactDays: 1, avatarColor: '#F97316' },
];

// A sample conversation used to populate the History screen visually.
export const MOCK_CONVERSATION: ConversationEntry[] = [
  { id: 'm1', role: 'assistant', content: "Morning! You've only done 1,200 steps today — fancy a quick 10-minute walk to loosen up?", timestamp: dayOffset(0, 9, 2) },
  { id: 'm2', role: 'user', content: 'What should I have for dinner tonight?', timestamp: dayOffset(0, 18, 30) },
  { id: 'm3', role: 'assistant', content: "Since you're vegetarian and short on time, how about a chickpea & spinach curry with rice? Ready in about 25 minutes.", timestamp: dayOffset(0, 18, 30) },
  { id: 'm4', role: 'user', content: 'What movie should I watch tonight?', timestamp: dayOffset(0, 20, 15) },
  { id: 'm5', role: 'assistant', content: "You loved sci-fi thrillers last time — 'Arrival' fits your mood perfectly and it's a calm, thoughtful watch before bed.", timestamp: dayOffset(0, 20, 16) },
  { id: 'm6', role: 'user', content: "I've had a headache all afternoon, what should I take?", timestamp: dayOffset(1, 14, 5) },
  { id: 'm7', role: 'assistant', content: "For anything health-related like that, I'd recommend speaking to your doctor.", timestamp: dayOffset(1, 14, 5) },
];

// Sample nudges for the Home proactive card (Suggestion Engine preview).
export const MOCK_NUDGES = [
  { id: 'n1', category: 'social', icon: 'solar:phone-calling-rounded-bold-duotone', text: "You haven't called Mum in 10 days — want me to remind you tonight?" },
  { id: 'n2', category: 'fitness', icon: 'solar:running-2-bold-duotone', text: "You're at 3,240 steps. A short walk would get you closer to your goal." },
  { id: 'n3', category: 'mindfulness', icon: 'solar:meditation-bold-duotone', text: 'You have a 30-minute gap at 15:00 — perfect for a breather.' },
  { id: 'n4', category: 'nutrition', icon: 'solar:cup-hot-bold-duotone', text: "It's been a few hours since lunch — staying hydrated?" },
];

// ----------------------------------------------------------------------
// Default profile / avatar (used as a fallback before onboarding writes).
// ----------------------------------------------------------------------

export const DEFAULT_AVATAR: AvatarConfig = {
  name: 'Nova',
  gender: 'unspecified',
  appearanceId: 'nova',
  voiceId: 'samantha',
  personalityTone: 'friendly',
};

export const SAMPLE_PROFILE: UserProfile = {
  identity: { name: 'Sam', age: 29, location: 'London, UK', timezone: 'GMT+0' },
  health: {
    activityLevel: 'light',
    dietaryRestrictions: ['Vegetarian'],
    fitnessGoals: 'Move more during the workday and sleep better',
    wakeTime: '07:00',
    sleepTime: '23:30',
  },
  work: {
    jobType: 'Product Designer',
    workingHours: '09:00 - 17:30',
    stressLevel: 'medium',
    hobbyTags: ['Reading', 'Running', 'Photography', 'Cooking'],
    subscriptionTags: ['Netflix', 'Spotify', 'Notion', 'Gym membership'],
  },
};

// helper: produce a timestamp `daysAgo` days back at the given local h:m.
function dayOffset(daysAgo: number, hour: number, minute: number): number {
  const base = new Date(2026, 5, 24, hour, minute, 0); // 2026-06-24, fixed for prototype determinism
  base.setDate(base.getDate() - daysAgo);
  return base.getTime();
}
