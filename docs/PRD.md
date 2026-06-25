# PRD: Personal Avatar Assistant — Prototype

## Problem Statement

People lack a single, proactive personal assistant that knows them deeply — their habits, diet, hobbies, relationships, and schedule — and surfaces timely, personalised nudges without being asked. Existing assistants (Siri, Alexa, Google Assistant) are reactive and impersonal; they answer questions but never say "you haven't called your mother in 10 days" or "you've barely moved today, here's a quick workout." There is no product that combines a conversational AI brain, a human-feeling avatar presence, and a rich personal profile into a single mobile-first experience.

---

## Solution

A mobile-first web app featuring an animated 2D avatar that acts as a proactive personal assistant. On launch, the avatar greets the user and surfaces a random personalised nudge drawn from mocked lifestyle data (fitness, contacts, calendar). The user can speak to the avatar at any time; every question or request is processed by the Claude API, which has full context of the user's profile. The avatar speaks responses aloud via the Web Speech API. Onboarding collects a rich personal profile (diet, hobbies, work, routine) and lets the user fully customise their avatar (name, gender, appearance, voice, personality tone).

---

## User Stories

1. As a new user, I want to customise my avatar's name, gender, appearance, voice, and personality tone during onboarding, so that the assistant feels personal and mine.
2. As a new user, I want to complete an onboarding questionnaire covering my identity, health preferences, work situation, hobbies, and daily routine, so that the avatar can give me relevant advice from day one.
3. As a new user, I want the avatar setup screen to appear first in onboarding, so that I feel emotionally invested before sharing personal information.
4. As a user, I want the avatar to greet me when I open the app and immediately say something proactive and relevant, so that the experience feels alive rather than waiting for me to speak first.
5. As a user, I want the avatar to randomly surface nudges such as "you haven't called your mother in 10 days" or "you've only done 1,200 steps today — want a workout suggestion?", so that I get value without having to ask.
6. As a user, I want to tap a microphone button and speak naturally to the avatar, so that interaction feels conversational rather than typed.
7. As a user, I want the avatar's mouth/animation to move while it speaks, so that the experience feels like talking to a real presence.
8. As a user, I want to ask "what should I eat today?" and receive a personalised answer based on my dietary preferences, so that meal decisions feel effortless.
9. As a user, I want to ask "what movie should I watch tonight?" and receive a recommendation based on my taste profile, so that I spend less time browsing and more time enjoying.
10. As a user, I want to ask "what should I do in my spare time?" and get a suggestion tied to my hobbies and current energy level, so that downtime feels purposeful.
11. As a user, I want to ask work-related questions (e.g. "should I do deep work now?") and get a suggestion based on my schedule and working hours, so that I stay productive without overthinking.
12. As a user, I want the avatar to tell me "I recommend you call your doctor" rather than attempting a diagnosis when I describe symptoms, so that I receive responsible guidance.
13. As a user, I want the avatar to see my mocked fitness data (steps, activity) when giving movement or workout suggestions, so that advice feels contextually accurate.
14. As a user, I want the avatar to see my mocked calendar events when giving schedule-related advice, so that it doesn't recommend long tasks right before a meeting.
15. As a user, I want the avatar to see my mocked contacts/communication history when giving relationship nudges, so that suggestions like "call your mother" feel grounded.
16. As a user, I want to scroll through my full conversation history with the avatar, so that I can revisit past advice and recommendations.
17. As a user, I want to edit my personal profile (diet, hobbies, work, routine) after onboarding, so that the avatar stays accurate as my life changes.
18. As a user, I want to change my avatar's name, appearance, voice, and personality tone in Settings, so that I can update my preference at any time.
19. As a user, I want a bottom tab bar with Home, History, Profile, and Settings, so that navigation is thumb-reachable on mobile.
20. As a user, I want the app to remember my profile and conversation history across sessions, so that the avatar knows me when I return.
21. As a user, I want to clear all my stored data from Settings, so that I can reset the experience if needed.
22. As a user, I want the avatar to have a warm, human-feeling speaking voice, so that the interaction doesn't feel robotic.
23. As a user, I want to choose from multiple pre-built avatar appearances (6 options), so that I can find one that resonates with me.
24. As a user, I want to choose the avatar's personality tone (Friendly & warm / Professional & concise / Playful & funny), so that the assistant's style matches my preference.
25. As a user, I want a daily greeting summary from the avatar each morning, so that I start the day with a personalised briefing.
26. As a user, I want to see a visual "today at a glance" section on the home screen showing mocked steps and upcoming events, so that I have a quick daily overview.

---

## Implementation Decisions

### Modules

**1. Avatar Engine**
Encapsulates the 2D animated avatar: renders the correct appearance asset, triggers speaking/idle/listening animation states, and exposes a simple interface (`speak(text)`, `listen()`, `idle()`). Built with CSS animations or Lottie. The appearance is driven by a selected avatar ID from the user profile.

**2. Voice Service**
Wraps the browser Web Speech API for both directions:
- `SpeechRecognition` for STT (microphone input)
- `SpeechSynthesis` for TTS (avatar speech output)
Exposes `startListening(): Promise<string>` and `speak(text, voiceId): Promise<void>`. Handles browser compatibility and permission errors gracefully.

**3. Claude Service**
Manages all communication with the Claude API. On each call, builds a system prompt by injecting the full user profile (from localStorage) plus the mocked integration context (fitness, calendar, contacts). Enforces the ethical guardrail via the system prompt instruction: "If the user describes symptoms or asks for a medical diagnosis, respond only with: 'For anything health-related like that, I'd recommend speaking to your doctor.'" Maintains a rolling conversation history array capped at the last N exchanges.

**4. Profile Store**
All read/write operations to localStorage. Stores:
- `userProfile` — onboarding answers (identity, health, work, hobbies, routine)
- `avatarConfig` — name, gender, appearanceId, voiceId, personalityTone
- `conversationHistory` — array of `{ role, content, timestamp }` entries
Exposes typed getters/setters. This is the single source of truth for persistence.

**5. Mock Data Layer**
A static module that returns realistic fake data for integrations:
- Fitness: steps today, active minutes, last workout date
- Calendar: next 3 events with titles and times
- Contacts: last contact date per person (mother, close friends, colleagues)
Single function `getMockedContext(): string` returns a formatted string ready to inject into the Claude system prompt.

**6. Suggestion Engine**
A client-side module with a pool of 20+ proactive nudge templates across categories (movement, relationships, nutrition, entertainment, work, hobbies). On app load, picks one randomly, hydrates it with mock data and profile data, then triggers `AvatarEngine.speak()`. Nudge categories: fitness, social, food, entertainment, productivity, mindfulness.

**7. Onboarding Flow**
4-screen wizard using React state (no router needed for onboarding):
- Screen 1: Avatar setup (name, gender, appearance, voice, personality tone)
- Screen 2: Identity (name, age, location/timezone)
- Screen 3: Health & lifestyle (activity level, dietary restrictions, fitness goals, wake/sleep times)
- Screen 4: Work & hobbies (job type, hours, stress level, hobby tags)
Writes to Profile Store on completion, sets `onboardingComplete: true`.

**8. Navigation Shell**
Bottom tab bar with 4 tabs: Home, History, Profile, Settings. Uses React Router or simple state-based tab switching. Persists active tab in component state only (not URL for prototype).

### Architectural Decisions

- **Everything through Claude**: All user questions — food, movies, hobbies, work, relationships — are sent to the Claude API. The mock data layer feeds context into the system prompt rather than driving UI logic directly. Claude reasons over it.
- **localStorage only**: No backend. All persistence via the Profile Store module. PWA is a stretch goal after core is complete.
- **Ethical guardrail in system prompt**: The single rule "diagnoses → call your doctor" is enforced via the Claude system prompt, not UI-level filtering. This keeps the logic in one place.
- **Personality tone in system prompt**: The chosen tone (Friendly / Professional / Playful) is injected as a direct instruction into the system prompt, e.g. "Respond in a warm, friendly tone as if talking to a close friend."
- **Visual design**: Deep navy background `#0D0F1A`, electric violet accent `#7C3AED`, gradient dark-to-color aesthetic. Mobile-first with `max-width: 430px` centered layout. Tailwind CSS recommended for utility-first mobile styling.

---

## Testing Decisions

A good test verifies observable behaviour from the outside — what goes in, what comes out — without asserting on internal implementation details like function names, state shape, or render structure.

### Modules to test

**Claude Service** — highest priority. Test that:
- The system prompt correctly includes user profile data
- The system prompt correctly includes mock context data
- Medical diagnosis queries trigger the guardrail response
- Conversation history is correctly appended and capped

**Profile Store** — test that:
- Reading from an empty store returns sensible defaults
- Writing and reading back a profile returns the correct data
- `clearAll()` removes all keys

**Mock Data Layer** — test that:
- `getMockedContext()` returns a non-empty string
- The output contains expected keywords (steps, calendar, contacts)

**Suggestion Engine** — test that:
- A suggestion is always returned (pool never empty)
- The returned suggestion is a non-empty string
- Multiple calls return varied results over N iterations

**Voice Service** — integration test only (browser API): mock `SpeechSynthesis` and `SpeechRecognition` in jsdom to verify correct method calls and state transitions.

---

## Out of Scope

- Real device integrations: Google Fit, Apple Health, Google Calendar, Apple Calendar, phone call logs, SMS messages, real contacts API
- User authentication, accounts, or cloud sync
- Push notifications / background nudges
- PWA manifest and service worker (stretch goal)
- Multiple user profiles
- Multi-language / localisation
- Accessibility audit (WCAG compliance)
- ElevenLabs or OpenAI TTS (Web Speech API only for prototype)
- Backend of any kind

---

## Further Notes

- **Demo script**: The strongest demo flow is — open app (avatar greets + random nudge) → speak "what should I have for dinner?" → avatar responds → speak "what movie should I watch tonight?" → avatar responds → navigate to Profile to show stored data → navigate to Settings to show avatar customisation. This covers all major features in under 3 minutes.
- **PWA stretch goal**: Once core is complete, adding a `manifest.json` and a minimal service worker for offline caching of the shell is a half-day task. Prioritise only after the finish line is met.
- **Voice selection UX**: On first launch, the Voice Service should enumerate available browser voices and present them in the onboarding avatar setup screen. Label each voice with its name and a "Preview" button so the user can hear it before choosing.
- **Animation states**: The Avatar Engine needs at minimum three states — `idle` (subtle breathing/blinking loop), `listening` (microphone active indicator), `speaking` (mouth movement synced to TTS `boundary` events from SpeechSynthesis). A fourth `thinking` state (spinner or pulse) between STT end and TTS start improves perceived responsiveness.
