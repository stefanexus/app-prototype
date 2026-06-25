import type {
  AvatarConfig,
  ConversationEntry,
  ConversationSummary,
  UserProfile,
} from "../types";

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
  lastWorkout: "3 days ago",
};

export const MOCK_CALENDAR: CalendarEvent[] = [
  {
    id: "c1",
    title: "Team standup",
    time: "10:30",
    icon: "solar:users-group-rounded-bold-duotone",
    color: "#7C3AED",
  },
  {
    id: "c2",
    title: "Lunch with Maya",
    time: "13:00",
    icon: "solar:cup-hot-bold-duotone",
    color: "#22D3EE",
  },
  {
    id: "c3",
    title: "Dentist appointment",
    time: "16:45",
    icon: "solar:health-bold-duotone",
    color: "#EC4899",
  },
];

export const MOCK_CONTACTS: ContactInfo[] = [
  {
    id: "p1",
    name: "Mum",
    relationship: "Family",
    lastContactDays: 10,
    avatarColor: "#EC4899",
  },
  {
    id: "p2",
    name: "Alex",
    relationship: "Close friend",
    lastContactDays: 4,
    avatarColor: "#22D3EE",
  },
  {
    id: "p3",
    name: "Jordan",
    relationship: "Colleague",
    lastContactDays: 1,
    avatarColor: "#F97316",
  },
];

// A sample conversation used to populate the History screen visually.
export const MOCK_CONVERSATION: ConversationEntry[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Morning! You've only done 1,200 steps today — fancy a quick 10-minute walk to loosen up?",
    timestamp: dayOffset(0, 9, 2),
  },
  {
    id: "m2",
    role: "user",
    content: "What should I have for dinner tonight?",
    timestamp: dayOffset(0, 18, 30),
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "Since you're vegetarian and short on time, how about a chickpea & spinach curry with rice? Ready in about 25 minutes.",
    timestamp: dayOffset(0, 18, 30),
  },
  {
    id: "m4",
    role: "user",
    content: "What movie should I watch tonight?",
    timestamp: dayOffset(0, 20, 15),
  },
  {
    id: "m5",
    role: "assistant",
    content:
      "You loved sci-fi thrillers last time — 'Arrival' fits your mood perfectly and it's a calm, thoughtful watch before bed.",
    timestamp: dayOffset(0, 20, 16),
  },
  {
    id: "m6",
    role: "user",
    content: "I've had a headache all afternoon, what should I take?",
    timestamp: dayOffset(1, 14, 5),
  },
  {
    id: "m7",
    role: "assistant",
    content:
      "For anything health-related like that, I'd recommend speaking to your doctor.",
    timestamp: dayOffset(1, 14, 5),
  },
];

// The most recent message in the sample transcript — drives the first card's
// preview line, timestamp and count so the list stays in sync with the thread.
const LATEST_ENTRY = MOCK_CONVERSATION.reduce((latest, entry) =>
  entry.timestamp > latest.timestamp ? entry : latest,
);

// Threads shown on the History list. Only the first is openable; the rest are
// placeholders (locked) to suggest a richer history without real transcripts.
export const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "conv-1",
    title: "Daily check-in",
    preview: LATEST_ENTRY.content,
    timestamp: LATEST_ENTRY.timestamp,
    messageCount: MOCK_CONVERSATION.length,
    icon: "solar:chat-round-line-bold-duotone",
    accent: "#7C3AED",
  },
  {
    id: "conv-2",
    title: "Weekend in the Peak District",
    preview:
      "I've found three dog-friendly trails near Edale — want the easy one?",
    timestamp: dayOffset(3, 19, 12),
    messageCount: 14,
    icon: "solar:map-point-wave-bold-duotone",
    accent: "#22D3EE",
    locked: true,
  },
  {
    id: "conv-3",
    title: "Strength training plan",
    preview: "Here's a 3-day split that fits around your 09:00 starts.",
    timestamp: dayOffset(5, 7, 40),
    messageCount: 9,
    icon: "solar:dumbbell-bold-duotone",
    accent: "#EC4899",
    locked: true,
  },
  {
    id: "conv-4",
    title: "Trimming subscriptions",
    preview: "You could save about £18/month by pausing two of these.",
    timestamp: dayOffset(8, 21, 5),
    messageCount: 11,
    icon: "solar:wallet-money-bold-duotone",
    accent: "#FBBF24",
    locked: true,
  },
];

// ----------------------------------------------------------------------
// Scripted avatar replies — the prototype fakes the LLM with these fixed
// answers. The Home orb plays them IN ORDER on each ask (then loops); the
// quick-action chips jump straight to the matching one via `chip`.
// ----------------------------------------------------------------------

export interface ScriptedReply {
  id: string;
  /** Quick-action chip label that also triggers this reply, if any. */
  chip?: string;
  /** The full line the avatar speaks aloud (shown as a short caption). */
  text: string;
  /** Explanation cards shown under the reply on the Home screen. */
  explanation?: ReplyExplanation;
}

export interface ReplyExplanationCard {
  id: string;
  icon: string;
  label: string;
  title: string;
  detail: string;
  badge?: string;
  badgeTone?: "neutral" | "success" | "danger";
  progress?: number;
}

export interface ReplyPick {
  variant?: "media" | "task";
  eyebrow: string;
  title: string;
  meta: string;
  description: string;
  coverTitle?: string;
  coverYear?: string;
  quote?: {
    sender: string;
    subject: string;
    body: string;
  };
}

export interface ReplyExplanation {
  cards: ReplyExplanationCard[];
  pick: ReplyPick;
}

export const SCRIPTED_REPLIES: ScriptedReply[] = [
  {
    id: "movie",
    chip: "What movie tonight?",
    text: "Hey, I noticed today was a lot - your heart rate's been up and your calendar was packed wall to wall. Your playlist tonight is giving me Phoebe Bridgers and Bon Iver, so I know you're in that reflective headspace, but I don't think you want anything too heavy. You've got about 90 minutes before you really should be winding down — you have a 9am tomorrow and you're already behind on sleep this week. So here's what I'm thinking: Palm Springs. It's on Hulu, it's 90 minutes exactly, and if you loved Groundhog Day and About Time, this is going to feel like it was made for you. It's funny, it's a little bittersweet, and it asks absolutely nothing of you after the day you've had. Last time I sent you something intense on a night like this, you came back with two stars and 'not the vibe' — I learned my lesson. Trust me on this one.",
    explanation: {
      cards: [
        {
          id: "mood",
          icon: "solar:heart-pulse-bold-duotone",
          label: "Mood & stress",
          title: "Elevated stress",
          badge: "high",
          badgeTone: "neutral",
          detail: "Resting HR up 12% - 9 calendar events today",
        },
        {
          id: "music",
          icon: "solar:music-note-2-bold-duotone",
          label: "Music today",
          title: "Mellow & introspective",
          detail: "Phoebe Bridgers, boygenius, Bon Iver",
        },
        {
          id: "sleep",
          icon: "solar:moon-sleep-bold-duotone",
          label: "Sleep debt",
          title: "62% of weekly goal",
          detail: "9am meeting tomorrow",
          progress: 62,
        },
        {
          id: "time",
          icon: "solar:clock-circle-bold-duotone",
          label: "Time window",
          title: "~2 hrs available",
          detail: "Ideal bedtime: 10:30pm",
        },
        {
          id: "history",
          icon: "solar:tv-bold-duotone",
          label: "Watch history",
          title: "Comedies + sci-fi loops",
          detail: "Loved: Groundhog Day, About Time",
        },
        {
          id: "feedback",
          icon: "solar:like-bold-duotone",
          label: "Past feedback",
          title: "Liked light & witty",
          badge: "5+",
          badgeTone: "success",
          detail: "Disliked heavy dramas on hard days",
        },
      ],
      pick: {
        eyebrow: "Tonight's pick",
        title: "Palm Springs",
        meta: "2020 - 90 min - Comedy / Romance / Sci-fi - Hulu",
        description:
          "Two strangers get stuck in an infinite time loop at a desert wedding. Sharp, funny, and quietly moving - without ever asking too much of you.",
        coverTitle: "Palm Springs",
        coverYear: "2020",
      },
    },
  },
  {
    id: "work",
    chip: "Plan my day",
    text: "Before you dive in, I had a quick look at your day. Sarah sent you an email at 7:52am — before 8 — asking for the Q3 results report by tomorrow at 5pm. Leadership moved the quarterly review up to Friday, so that deadline is real. Here's the thing though: you have meetings at 11, 2, and 4 today, which means your actual free time is a lot narrower than it sounds. You're a morning person — your best focus window is right now, and it closes in less than two hours. Everything else on your plate — the Slack mentions, the design review feedback — none of it is on fire. Park it. I've already put together a draft outline for the report and pulled your Q2 submission so you can match the format Sarah already approved. You can either let me draft the whole thing and you refine it, or we can work through it section by section together. Either way, the clock's ticking — let's start with the executive summary and go from there.",
    explanation: {
      cards: [
        {
          id: "time-of-day",
          icon: "solar:clock-circle-bold-duotone",
          label: "Time of day",
          title: "9:04 AM",
          badge: "peak hours",
          badgeTone: "success",
          detail: "You're a morning person - deep work window is now",
        },
        {
          id: "calendar",
          icon: "solar:calendar-date-bold-duotone",
          label: "Calendar today",
          title: "3 meetings",
          detail: "11am standup - 2pm 1:1 - 4pm team sync - Free until 11",
        },
        {
          id: "inbox",
          icon: "solar:inbox-bold-duotone",
          label: "Inbox signal",
          title: "Urgent email",
          badge: "boss",
          badgeTone: "danger",
          detail: "Sent 7:52am - Q3 report - due tomorrow 5pm",
        },
        {
          id: "slack",
          icon: "solar:chat-round-dots-bold-duotone",
          label: "Slack / Teams",
          title: "2 mentions",
          detail: "Design review feedback (low urgency) - 1 FYI thread",
        },
        {
          id: "todo",
          icon: "solar:clipboard-list-bold-duotone",
          label: "To-do list",
          title: "6 open tasks",
          detail: "Q3 report flagged - 2 overdue items - 3 this week",
        },
        {
          id: "patterns",
          icon: "solar:chart-2-bold-duotone",
          label: "Work patterns",
          title: "Best focus: 8-11am",
          detail: "Avg. deep work score 84 in morning vs 51 afternoon",
        },
      ],
      pick: {
        variant: "task",
        eyebrow: "Start right now",
        title: "Q3 results report",
        meta: "Due tomorrow 5:00 PM - Requested by Sarah (your manager) - Estimated 3-4 hrs",
        description:
          "A summary report of Q3 business results for leadership review. Sarah flagged this as high priority. You have the best focus window available right now - before your 11am standup.",
        quote: {
          sender: "Sarah M. - 7:52 AM",
          subject: "Re: Q3 Results Report - needed by tomorrow EOD",
          body: '"Hey, I know it is early notice but leadership has moved the quarterly review to Friday morning. I need the Q3 results summary on my desk by tomorrow at 5pm at the latest. Can you make that work?"',
        },
      },
    },
  },
];

// Sample nudges for the Home proactive card (Suggestion Engine preview).
export const MOCK_NUDGES = [
  {
    id: "n1",
    category: "social",
    icon: "solar:phone-calling-rounded-bold-duotone",
    text: "You haven't called Mum in 10 days — want me to remind you tonight?",
  },
  {
    id: "n2",
    category: "fitness",
    icon: "solar:running-2-bold-duotone",
    text: "You're at 3,240 steps. A short walk would get you closer to your goal.",
  },
  {
    id: "n3",
    category: "mindfulness",
    icon: "solar:meditation-bold-duotone",
    text: "You have a 30-minute gap at 15:00 — perfect for a breather.",
  },
  {
    id: "n4",
    category: "nutrition",
    icon: "solar:cup-hot-bold-duotone",
    text: "It's been a few hours since lunch — staying hydrated?",
  },
];

// ----------------------------------------------------------------------
// Default profile / avatar (used as a fallback before onboarding writes).
// ----------------------------------------------------------------------

export const DEFAULT_AVATAR: AvatarConfig = {
  name: "Aura",
  gender: "unspecified",
  appearanceId: "nova",
  voiceId: "samantha",
  personalityTone: "friendly",
};

export const SAMPLE_PROFILE: UserProfile = {
  identity: { name: "Sam", age: 29, location: "London, UK", timezone: "GMT+0" },
  health: {
    activityLevel: "light",
    dietaryRestrictions: ["Vegetarian"],
    fitnessGoals: "Move more during the workday and sleep better",
    wakeTime: "07:00",
    sleepTime: "23:30",
  },
  work: {
    jobType: "Product Designer",
    workingHours: "09:00 - 17:30",
    stressLevel: "medium",
    hobbyTags: ["Reading", "Running", "Photography", "Cooking"],
    subscriptionTags: ["Netflix", "Spotify", "Notion", "Gym membership"],
  },
};

// helper: produce a timestamp `daysAgo` days back at the given local h:m.
function dayOffset(daysAgo: number, hour: number, minute: number): number {
  const base = new Date(2026, 5, 24, hour, minute, 0); // 2026-06-24, fixed for prototype determinism
  base.setDate(base.getDate() - daysAgo);
  return base.getTime();
}
