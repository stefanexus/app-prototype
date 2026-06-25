# PRD: Avatar Engine — Expressive Face-on-Orb

> **Status:** **Complete.** Core component built (`src/components/avatar.tsx`); all six call sites migrated to `Avatar`; `avatar-orb.tsx` deleted; build + lint clean; manual QA walked on every screen. See *Implementation Status (as built)* below.
> **Scope:** Replace the placeholder gradient orb (`src/components/avatar-orb.tsx`) with a real, animated 2D character — an *expressive face-on-orb* — across the whole prototype.
> **Audience:** This document is written to be followed by multiple independent agents. It is self-contained: an agent should not need the originating chat. Where exact coordinates/values are given, treat them as the spec so independent agents converge on the same look.
> **Parent PRD:** `docs/PRD.md` (the overall Personal Avatar Assistant). This document refines the "Avatar Engine" module from that PRD and supersedes its avatar-rendering details.

---

## Implementation Status (as built)

> Records what currently exists in `src/components/avatar.tsx` against the spec below. **Done = Agent A** (core component). **Outstanding = Agent B** (call-site migration + orb removal).

### Done — `src/components/avatar.tsx`

**Module & interface**
- Default export `Avatar`; the pure `expressionForState(state)` mapping is **co-exported** from the same file (the testable seam), with an `eslint-disable react-refresh/only-export-components` header explaining the dual export.
- Prop contract matches the spec exactly: `{ size = 160, appearanceId = 'nova', state = 'idle' }`. No call-site-visible changes.
- Appearance lookup unchanged: `AVATAR_APPEARANCES.find(a => a.id === appearanceId) ?? AVATAR_APPEARANCES[0]`; uses `.gradient` for the head fill and `.accent` for ring/halo/feature tint.
- Renders a self-contained square `size × size` `Box`; halo overflows via negative inset.

**`expressionForState` (pure)** — returns `{ browY, browTilt, eyeOpen, gaze {x,y}, mouth, breathDuration, pulseScale[], showDots, showRing }`. Per-state values as built:
| State | browY | browTilt | eyeOpen | gaze | mouth | breathDuration | ring/dots |
|-------|-------|----------|---------|------|-------|----------------|-----------|
| `idle` | 0 | 0 | 1 | (0, 0) | closed | **4s** | — |
| `listening` | −2.5 | 0 | 1.12 | (0, 0) | closed | **1.4s** | ring |
| `thinking` | −1 | 1.4 | 1 | (0.35, −0.45) | closed | **1.1s** | dots |
| `speaking` | −0.5 | 0 | 1 | (0, 0) | talking | **0.9s** | — |

Per-state durations preserve parity with the original orb (0.9 / 1.4 / 1.1 / 4s). ✅

**Face geometry & colour** — SVG `viewBox="0 0 100 100"` overlay: eyes at `x=37/63, y=44` (rx 6.5 / ry 7.5 ≈ 13×15), `#F8FAFF` whites + `#0D0F1A` pupils (r 4.5, glide with gaze, blink via `scaleY 1→0.08`); brows as two rounded `line`s near `y=30+browY`; closed mouth `M40 64 Q50 71 60 64` at baseline ~66; no nose. Brows + mouth use `darkenTint(appearance.accent)` (mixed toward app navy). All SVG parts `aria-hidden`.

**Animations / behaviours**
- **Idle lively presence:** breathing (pulse keyframes over `breathDuration`); randomised blinks every 2.5–6s with ~25% double-blink; saccades (±0.4 gaze) every 3–7s; rare ±2° micro head-tilt every 10–20s. All randomness flows through one per-instance seeded RNG (Mulberry32) created in an effect and held in a ref — never called during render.
- **Procedural talk loop:** `TALK_SHAPES` (near-closed → small 'o' → mid → wide) cycled at varied 90–160ms with no repeated frame while `speaking` (full tier); settles to the soft smile otherwise; gentle vertical head-bob on speaking.
- **Listening:** expanding accent ring; **thinking:** floating "…" dots upper-right + subtle head wobble.
- **Size-adaptive:** `COMPACT_THRESHOLD = 72`. Compact (`< 72`) shows head + blinking eyes + static smile only (no brows / saccades / talk loop / thinking dots / halo); the listening accent ring still renders where cheap.
- **Reduced motion:** `useReducedMotion()` drops saccades, talk-loop, bob, tilt and blink loop; holds a static per-state expression (speaking → open mouth held; thinking dots static; halo static opacity).

### Done (Agent B — call-site migration & QA)
- **Call-site migration complete.** All six sites now `import Avatar from '.../components/avatar'` and render `<Avatar .../>` with identical props (`home-presence`, `welcome-view`, `step-avatar`, `avatar-customiser-card`, `profile-view`, `history-view`). One stale comment in `home-presence` that named `AvatarOrb` was updated to `Avatar`; no other call-site changes.
- **`src/components/avatar-orb.tsx` deleted.** Only `avatar.tsx` remains; no stale `AvatarOrb`/`avatar-orb` references in `src/`.
- **Build + lint clean.** `npm run build` (`tsc -b` + `vite build`) passes; `npm run lint` reports 0 errors (1 pre-existing, unrelated `react-hooks/incompatible-library` warning in `onboarding-view.tsx`).
- **Manual QA walked on every screen** (mobile viewport, no console errors): Welcome (190/idle — full face, Nova), Home (hero — tap toggles listening: widened eyes + raised brows + accent ring + "I'm listening…"), Settings customiser (80/speaking — talk loop confirmed cycling across frames; tinting Nova→Ember shifts head + brow/mouth tint), Onboarding (120 — live colour update Nova→Sage), Profile (56, compact — head + eyes + static smile, no brows), History (28, compact — clean legible thumbnails). All four state expressions confirmed (idle/listening/speaking visually; thinking via a temporary, reverted preview — floating "…" dots + up-aside gaze + tilted brow). Three appearances (Nova/Ember/Sage) verified on the face; all six swatches render via one shared tint path.
- **Note:** Home wires only `idle`/`listening` (pre-existing); `speaking`/`thinking` are not driven from Home, so the checklist's Home speaking/thinking items reflect component capability, exercised in the customiser rather than on Home. Unchanged — out of scope.

### Deviation note
- The luminous **head is a CSS `Box`** (gradient + `boxShadow` inset shading + blurred gloss highlight), ported from the orb — *not* the `<circle cx=50 cy=50 r=48>` described in the *Face geometry* section. Only the face (eyes/brows/mouth/dots) is SVG. This follows the "ported from the original orb" decision and is intended; the geometry section's circle is superseded on this point.

---

## Problem Statement

The prototype's avatar is currently a placeholder: an animated gradient **orb** with no face. The product's core promise (see `docs/PRD.md`) is a "human-feeling avatar presence" — a companion that greets you, talks to you, and feels *alive rather than waiting*. A faceless orb cannot express the four presence states convincingly (you can't tell "listening" from "thinking"), and it cannot show a mouth moving while it speaks. The avatar reads as an audio visualiser, not a personality.

## Solution

Replace the orb with an **expressive face-on-orb**: the glowing gradient head stays (brand continuity), but now carries a real face — blinking eyes, brows, and a mouth that moves while speaking. The face is drawn entirely in **SVG in-repo** and animated with **framer-motion** (already in the stack); no external art assets, no new dependencies. A single androgynous, friendly face is used everywhere; the selected appearance only tints its colour (exactly as today). The face expresses all four presence states (idle / listening / speaking / thinking) and stays clean from a 28px list thumbnail up to the ~190px+ home hero via size-adaptive detail.

The new component is a **drop-in replacement** for the existing one: it keeps the identical `{ size, appearanceId, state }` prop contract, so all six call sites work unchanged.

---

## User Stories

1. As a user, I want the avatar to have a **face with eyes and a mouth**, so that it feels like a presence I'm talking to rather than a glowing blob.
2. As a user, I want the avatar to **blink and glance around** while idle, so that it feels alive rather than frozen.
3. As a user, I want the avatar's **mouth to move while it's speaking**, so that the experience feels like talking to a real character (PRD story 7).
4. As a user, I want the avatar to look **attentive when it's listening** to me, so that I trust it heard me.
5. As a user, I want the avatar to look like it's **thinking** between my question and its answer, so that the wait feels intentional and responsive (PRD "thinking" state).
6. As a user, I want the avatar to look **calm and neutral when idle**, so that it isn't distracting when I'm not interacting.
7. As a user, I want the avatar's **colour to reflect the appearance I chose** (Nova / Aura / Ember / Blossom / Sage / Dusk), so that my customisation choice is visible.
8. As a user, I want the **same avatar identity everywhere** — home, onboarding, settings, profile, history, welcome — so that the assistant feels like one consistent character.
9. As a user, I want the avatar to **still read clearly when it's small** (a list thumbnail or a profile chip), so that the UI stays clean.
10. As a user, I want the avatar to be **legible and full of detail when it's large** (the home hero), so that the personality comes through.
11. As a user on the Home screen, I want **tapping the avatar to still start/stop listening** exactly as before, so that the interaction I learned doesn't change.
12. As a user who chose "speaking" preview in Settings, I want the avatar in the customiser to **demonstrate talking**, so that I can preview what I'm configuring.
13. As a user with **reduced-motion** enabled, I want the avatar to drop the busy animation (random glances, talk jitter) while staying recognisably a face, so that it respects my accessibility preference.
14. As a developer, I want the new avatar to **keep the exact `{ size, appearanceId, state }` interface**, so that I can swap it in without touching call sites.
15. As a developer, I want the speaking mouth to be **driven by a single `state` prop today and swappable for real TTS timing later**, so that wiring up Web Speech doesn't require redesigning the component.
16. As a developer, I want a **pure, testable mapping from state → facial expression**, so that the avatar's logic can be verified without rendering.

---

## Implementation Decisions

### Locked decisions (resolved during design grilling)

| # | Decision | Choice |
|---|----------|--------|
| 1 | **Intent** | Replace the orb with a *real animated character* everywhere (not a new "design-your-avatar" creator, not more presets). |
| 2 | **Medium** | Code-built **SVG + framer-motion**. No external assets, no new dependencies. Ships in one pass. |
| 3 | **Character form** | **Expressive face-on-orb**: keep the glowing gradient head; add blinking eyes, brows, and a speech-driven mouth. |
| 4 | **Identity mapping** | **One androgynous face**, colour-only per appearance. `gender` is stored in the profile but does **not** alter the face. |
| 5 | **Mouth-sync** | **Procedural talk loop** while `state === 'speaking'`; closed soft mouth otherwise. Swappable later for real TTS boundary events behind the same prop. |
| 6 | **Size scaling** | **Size-adaptive detail**: full face at large sizes; a simplified blinking face below the threshold. |
| 7 | **Replacement** | **In-place, same prop contract.** Rename component to `Avatar`; update the six imports; no other call-site changes. |
| 8 | **Idle liveliness** | **Lively presence**: randomised blinks, occasional eye saccades/glances, gentle breathing, rare micro head-tilt. (Not the look-at-tap reactive variant; not minimal.) |

### Module: `Avatar` (deep module)

The avatar is **one deep module** with a tiny, stable interface and all complexity hidden inside.

**Public interface (unchanged from today):**

```
Props:
  size?: number          // diameter in px. Default 160.
  appearanceId?: string  // references AVATAR_APPEARANCES[].id. Default 'nova'.
  state?: AvatarState     // 'idle' | 'listening' | 'speaking' | 'thinking'. Default 'idle'.
```

- `AvatarState` is the existing type in `src/types/index.ts` — **do not change it**.
- Defaults must match the current component: `size = 160`, `appearanceId = 'nova'`, `state = 'idle'`.
- Appearance lookup is unchanged: find `AVATAR_APPEARANCES.find(a => a.id === appearanceId) ?? AVATAR_APPEARANCES[0]`. Use its `.gradient` for the head fill and `.accent` for rings/glow, exactly as the orb does today.
- The component renders a square box of `size × size` (the halo may overflow via negative inset, as today). It must remain a self-contained visual with no external layout assumptions, because call sites wrap it (e.g. the Home tap-target).

**Naming / files:**
- New file: `src/components/avatar.tsx`, default export `Avatar`.
- Delete `src/components/avatar-orb.tsx`.
- Update the **six** import sites (see *Call-site migration*).

### Internal seam: `expressionForState` (the testable unit)

Extract a **pure function** mapping a state to target facial values. This is the one genuinely unit-testable seam and the single source of truth for "how each state looks". Animation hooks read from it.

Shape (illustrative — encodes the decision, not final code):

```
type Expression = {
  browY: number;        // vertical brow offset (− = raised)
  eyeOpen: number;      // 0..1 eyelid openness (scaleY of eye)
  gaze: { x: number; y: number }; // pupil offset, normalized −1..1
  mouth: 'closed' | 'talking'; // 'talking' triggers the talk loop
  breathDuration: number;       // seconds for the breathing scale loop
  pulseScale: [number, ...];    // head scale keyframes for this state
};

expressionForState('idle')      -> neutral brows, eyes open, centred gaze, mouth closed, slow breath (4s)
expressionForState('listening') -> brows raised, eyes widened, centred gaze forward, mouth closed, faster pulse (~1.4s) + accent ring
expressionForState('thinking')  -> one brow slightly raised, eyes open, gaze up-and-aside, mouth closed, slow pulse + subtle wobble, floating "…" dots
expressionForState('speaking')  -> neutral/engaged brows, eyes open, centred gaze, mouth 'talking', fast pulse (~0.9s) + subtle head bob
```

> Keep the **per-state durations from the existing orb** (`speaking 0.9s`, `listening 1.4s`, `thinking 1.1s`, `idle 4s`) so timing parity is preserved.

### Face geometry (normalized so independent agents converge)

Draw inside an SVG `viewBox="0 0 100 100"`, scaled to `size`. All coordinates below are in that 0–100 space.

- **Head:** circle `cx=50 cy=50 r=48`, filled with `appearance.gradient`. Keep the existing **inner shading** (inset dark bottom / light top) and **glossy highlight** (soft white ellipse, upper-left ~ `cx=36 cy=32`) so it still reads as a luminous orb.
- **Halo:** the existing blurred gradient behind the head (negative inset, blur ∝ size). Keep it; opacity breathes per state as today.
- **Eyes:** two eyes centred near `y=44`, at `x=37` and `x=63`. Each eye = an off-white shape (`#F8FAFF`, eye width ~13, height ~15 when open) with a **dark pupil** (deep-navy tint, e.g. the app bg `#0D0F1A`, radius ~4.5). Pupils offset by `gaze`. Blink = animate eye `scaleY` 1 → 0.08 → 1.
- **Brows:** two short rounded strokes above the eyes (~ `y=30`), coloured a **darker tint of the accent** (mix accent toward near-black). Animate `y`/angle per `browY`.
- **Mouth:** centred `cx=50`, baseline ~ `y=66`, coloured the darker accent tint. Closed = a gentle upward smile curve. See *Procedural talk loop* for open shapes.
- **No nose** — keep the flat, friendly, minimal style.
- All decorative SVG elements carry `aria-hidden`. The interactive wrapping (Home tap-to-talk) lives in the call site and is **not** part of this component.

**Colour treatment:** the head fill is the appearance gradient; eye-whites are a fixed off-white; pupils a fixed dark navy; brows + mouth a darker tint of `appearance.accent`. The whole face thus visibly shifts colour with the chosen appearance while features stay legible.

### Procedural talk loop (speaking mouth)

While `state === 'speaking'` **and** the size is in the full-detail tier:
- Cycle the mouth shape through a small set on a **fast pseudo-random framer-motion loop**: `closed` → `small ('o')` → `mid` → `wide` and back, with short, slightly varied durations (~90–160ms per shape) so it reads as natural speech rather than a metronome.
- Shapes are distinct mouth paths/ellipses (e.g. small = tiny ellipse, mid = rounded ellipse, wide = taller open ellipse).
- When `state` leaves `'speaking'`, the mouth settles back to the **closed soft smile**.
- Add a **subtle head bob** (translateY ~0 ↔ −1.5 in viewBox units) on the speaking loop.

> **Future swap:** this loop is internal. When Web Speech TTS is wired up (deferred per parent PRD), real `boundary` events can drive the mouth shape instead, behind the same `state="speaking"` prop — no interface change.

### Idle "lively presence" behaviours

While `state === 'idle'` and in the full-detail tier:
- **Breathing:** head group scale 1 ↔ 1.03 over ~4s, looping (matches today's idle).
- **Blinking:** blink (eye `scaleY` → 0.08 → 1 over ~120ms) at **randomised intervals** in ~2.5–6s, with an occasional double-blink. Randomness must be driven by a stable per-instance seed/state, not by re-render.
- **Saccades:** every ~3–7s, move the pupils to a small random `gaze` offset (within ±0.4 of centre), hold briefly, then return. Eyes glance around, never wander far.
- **Micro head-tilt:** rarely (~every 10–20s) rotate the head ±2° and return.

These behaviours are **idle-only**; listening/thinking/speaking use their own expression and the steady blink may continue but saccades/tilt should pause.

### Size-adaptive detail

Define a threshold constant (`COMPACT_THRESHOLD = 72`).

- **Full tier (`size >= 72`):** everything above — brows, blinking eyes, gaze/saccades, mouth + talk loop, state expressions, thinking dots, head-bob, halo, highlight.
- **Compact tier (`size < 72`):** head + eyes (blink only) + a **static soft smile**. **No** brows, **no** saccades, **no** talk loop, **no** thinking dots. Halo subtle or omitted. This keeps the 28px (history) and 56px (profile) instances clean while still recognisably the same face. State still tints/rings where cheap (e.g. listening accent), but expression simplification takes priority over state nuance at small sizes.

### Reduced motion & accessibility

- Respect `prefers-reduced-motion: reduce`: drop random saccades, talk-loop jitter, head-bob, and head-tilt; keep a single calm state (static expression per state, optional very slow breath). The face must still correctly reflect `state` statically (e.g. speaking = open mouth held, listening = attentive brows).
- All drawn SVG parts are decorative → `aria-hidden`. No new ARIA roles are added by this component (the parent PRD lists a full a11y audit as out of scope).

### Call-site migration

Six files import the current component. Update the import to `Avatar` (from `../components/avatar` etc.) and the JSX tag name. **Props are identical — change nothing else.**

| Call site | Current size | State passed | Notes |
|-----------|-------------|--------------|-------|
| `src/sections/home/home-presence.tsx` | `orbSize` (viewport-driven, large) | live `state` | Hero. The tap-to-talk wrapper stays in this file untouched. Full tier. |
| `src/sections/welcome/welcome-view.tsx` | `190` | `idle` | `appearanceId="nova"` hardcoded. Full tier. |
| `src/sections/onboarding/steps/step-avatar.tsx` | `120` | `idle` | Driven by the form's selected appearance. Full tier. |
| `src/sections/settings/avatar-customiser-card.tsx` | `80` | `speaking` | Previews the talk loop. Full tier (just above threshold). |
| `src/sections/profile/profile-view.tsx` | `56` | `idle` | Compact tier. |
| `src/sections/history/history-view.tsx` | `28` | `idle` | Compact tier. |

---

## Testing / Verification Decisions

A good test verifies observable behaviour from the outside, not implementation details (render structure, internal state shape, animation internals).

**Current reality:** the prototype has **no test harness** (no vitest, no testing-library, no test files) and is visual-only. Verification for this work is therefore:

1. **Type-check / build:** `npm run build` (runs `tsc -b` then `vite build`) must pass clean. Also run `npx tsc --noEmit -p tsconfig.app.json` during iteration. Respect the MUI v9 / TS gotchas: no `<Stack>` (use `Box` flex), `slotProps` not `inputProps`, `motion.div` / `component={motion.div}` when MUI layout props are needed.
2. **Lint:** `npm run lint` clean.
3. **Manual QA checklist** (the acceptance gate for a visual prototype):
   - [ ] Home: avatar shows a face; idle blinks + glances; tapping still toggles listening; listening shows attentive brows + ring; the speaking state shows the mouth talking; thinking shows gaze-aside + "…" dots.
   - [ ] Settings customiser (size 80, `speaking`): mouth visibly talks; colour changes when a different appearance is selected.
   - [ ] Onboarding step-avatar (size 120): face updates colour live as the user picks an appearance.
   - [ ] Welcome (size 190, `idle`): full face, Nova colour, blinking.
   - [ ] Profile (56px) & History (28px): compact face is clean and legible, not cluttered; still recognisably the same character.
   - [ ] All six appearances tint the face correctly.
   - [ ] `prefers-reduced-motion` (toggle in OS/devtools): random motion stops; state still readable statically.

**Optional automated test (only if a harness is added):** `expressionForState(state)` is a pure function and is the right unit to test — assert each of the four states returns the expected mouth mode, gaze direction, and brow position. Adding the vitest harness itself is **out of scope** for this PRD unless explicitly requested.

---

## Out of Scope

- A "design-your-own-avatar" creator (custom hair/skin/accessories) — explicitly rejected; one fixed face.
- Per-appearance or per-gender facial variation — colour-only differentiation.
- Photorealistic / 3D / Lottie / Rive / image-sprite avatars — SVG only.
- Real TTS mouth-sync via Web Speech `boundary` events — deferred (parent PRD); the procedural loop stands in, swappable later.
- Wiring real microphone/`SpeechRecognition` to the listening state — the `state` prop is driven by existing/mock logic.
- Changing `AvatarState`, the appearance catalogue, or any call-site layout/behaviour beyond the import + tag swap.
- Adding a test harness (vitest/testing-library) — unless separately requested.
- A full WCAG accessibility audit (parent PRD out-of-scope).

---

## Further Notes

### Suggested work breakdown (for parallel agents)

The work is best done by **one agent** because it is a single component, but if split:

- **Agent A — core component & geometry:** create `src/components/avatar.tsx` with the SVG head, eyes, brows, mouth, halo, highlight, and the `expressionForState` pure mapping. Implement full-tier idle (breath/blink/saccade/tilt) + all four state expressions + the procedural talk loop + size-adaptive compact tier + reduced-motion handling. Delete `avatar-orb.tsx`.
- **Agent B — call-site migration & QA:** after Agent A lands, update the six imports/tags, run `npm run build` + `npm run lint`, and walk the manual QA checklist on every screen.

If a single agent does it all, do A then B in order. **Do not** leave both `avatar.tsx` and `avatar-orb.tsx` in the tree — the orb is fully removed.

### Design intent reminders
- The avatar should feel like **one warm, androgynous companion**, consistent across the app — not six different characters.
- Favour **restraint**: blinks and glances are subtle; the talk loop is lively but not manic; the face should never look frantic or uncanny.
- The glowing-orb heritage is a feature, not a thing to hide — the face sits *on* a luminous head; keep the halo, gloss, and gradient.

### Provenance
This PRD encodes decisions reached in a design grilling session: intent → medium → form → identity mapping → mouth-sync → size scaling → replacement strategy → idle liveliness. The eight locked decisions in the table above are the binding contract; the geometry/values are the recommended path to realise them consistently.
