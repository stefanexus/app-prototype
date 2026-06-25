/* eslint-disable react-refresh/only-export-components --
   This file intentionally co-exports the `Avatar` component and the pure
   `expressionForState` mapping: that function is the deliberate testable seam
   and single source of truth for the face, and the PRD requires both to live
   here. Fast Refresh is a non-concern for this prototype's avatar. */
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { motion, useReducedMotion, type Transition } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AVATAR_APPEARANCES } from '../_mock';
import type { AvatarState } from '../types';

// ----------------------------------------------------------------------
// Expressive face-on-orb. The luminous gradient head is ported from the
// original orb (CSS box + halo + gloss + inset shading); a full-size SVG
// overlay carries an androgynous face — blinking eyes, brows and a
// speech-driven mouth — that expresses the four PRD presence states.
//
// `expressionForState` is the pure, testable single source of truth for
// how each state looks; the render and every animation hook read from it.
// ----------------------------------------------------------------------

type Props = {
  size?: number;
  appearanceId?: string;
  state?: AvatarState;
};

// Below this diameter we drop to a simplified blinking face (no brows,
// saccades, talk loop or thinking dots) so thumbnails stay legible.
const COMPACT_THRESHOLD = 72;

// Fixed face colours (independent of appearance) — see PRD colour treatment.
const EYE_WHITE = '#F8FAFF';
const PUPIL = '#0D0F1A';

// ----------------------------------------------------------------------
// expressionForState — pure mapping state -> target facial values.
// The shape encodes the design decisions, not render internals.
// ----------------------------------------------------------------------

export type Expression = {
  /** Vertical brow offset in viewBox units (negative = raised). */
  browY: number;
  /** Lift the inner end of one brow for a quizzical "thinking" look. */
  browTilt: number;
  /** Eyelid openness, 0..1+ (multiplies the eye scaleY; >1 = widened). */
  eyeOpen: number;
  /** Resting pupil offset, normalized -1..1 (idle saccades add to this). */
  gaze: { x: number; y: number };
  /** 'talking' triggers the procedural mouth loop; otherwise a soft smile. */
  mouth: 'closed' | 'talking';
  /** Seconds for the breathing/pulse loop (parity with the original orb). */
  breathDuration: number;
  /** Head scale keyframes for this state. */
  pulseScale: number[];
  /** Show the floating "…" thinking dots. */
  showDots: boolean;
  /** Show the expanding accent ring. */
  showRing: boolean;
};

export function expressionForState(state: AvatarState): Expression {
  switch (state) {
    case 'listening':
      // Attentive: brows up, eyes widened, looking forward, accent ring.
      return {
        browY: -2.5,
        browTilt: 0,
        eyeOpen: 1.12,
        gaze: { x: 0, y: 0 },
        mouth: 'closed',
        breathDuration: 1.4,
        pulseScale: [1, 1.04, 1],
        showDots: false,
        showRing: true,
      };
    case 'thinking':
      // Pondering: one brow up, gaze drifts up-and-aside, dots float.
      return {
        browY: -1,
        browTilt: 1.4,
        eyeOpen: 1,
        gaze: { x: 0.35, y: -0.45 },
        mouth: 'closed',
        breathDuration: 1.1,
        pulseScale: [1, 1.02, 1],
        showDots: true,
        showRing: false,
      };
    case 'speaking':
      // Engaged: neutral brows, centred gaze, mouth running the talk loop.
      return {
        browY: -0.5,
        browTilt: 0,
        eyeOpen: 1,
        gaze: { x: 0, y: 0 },
        mouth: 'talking',
        breathDuration: 0.9,
        pulseScale: [1, 1.05, 0.99, 1.03, 1],
        showDots: false,
        showRing: false,
      };
    case 'idle':
    default:
      // Calm and neutral, slow breath.
      return {
        browY: 0,
        browTilt: 0,
        eyeOpen: 1,
        gaze: { x: 0, y: 0 },
        mouth: 'closed',
        breathDuration: 4,
        pulseScale: [1, 1.03, 1],
        showDots: false,
        showRing: false,
      };
  }
}

// ----------------------------------------------------------------------
// Local helpers (pure, dependency-free).
// ----------------------------------------------------------------------

/** Mix a hex colour toward the app navy for a legible brow/mouth tint. */
function darkenTint(hex: string, amount = 0.55): string {
  const m = hex.replace('#', '');
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Mix each channel toward app navy #0D0F1A.
  const mix = (channel: number, target: number) =>
    Math.round(channel + (target - channel) * amount);
  const to2 = (n: number) => n.toString(16).padStart(2, '0');
  return `#${to2(mix(r, 0x0d))}${to2(mix(g, 0x0f))}${to2(mix(b, 0x1a))}`;
}

// Seeded per-instance RNG (Mulberry32). All "lively presence" randomness
// (blink cadence, saccades, tilt timing, talk loop) flows through ONE stable
// generator seeded once per mount and held in a ref. It is created inside an
// effect (never during render) and only ever called from scheduled callbacks,
// so randomness drives behaviour without touching — or churning — the render.
function makeRand(seed: number): (min: number, max: number) => number {
  let s = seed >>> 0;
  return (min, max) => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return min + u * (max - min);
  };
}

// Mouth shapes for the procedural talk loop (centred cx=50, baseline ~66):
// near-closed -> small 'o' -> mid -> wide, cycled pseudo-randomly.
const TALK_SHAPES: { rx: number; ry: number }[] = [
  { rx: 4, ry: 0.6 }, // near-closed
  { rx: 3.5, ry: 2.4 }, // small 'o'
  { rx: 5, ry: 3.6 }, // mid
  { rx: 4.4, ry: 5.2 }, // wide / taller
];

// ----------------------------------------------------------------------
// Avatar
// ----------------------------------------------------------------------

export default function Avatar({
  size = 160,
  appearanceId = 'nova',
  state = 'idle',
}: Props) {
  const appearance = useMemo(
    () =>
      AVATAR_APPEARANCES.find((a) => a.id === appearanceId) ??
      AVATAR_APPEARANCES[0],
    [appearanceId]
  );

  const reduceMotion = useReducedMotion();
  const compact = size < COMPACT_THRESHOLD;
  const expr = useMemo(() => expressionForState(state), [state]);
  const featureTint = useMemo(
    () => darkenTint(appearance.accent),
    [appearance.accent]
  );

  // Timer-driven animation values. Each is mutated ONLY from inside a
  // scheduled callback — never synchronously in an effect body — so when its
  // effect is inactive the value rests at its neutral default and the render
  // derivation below ignores it. This keeps effects free of the cascading-
  // render hazard while expressionForState stays the source of truth.
  const [blink, setBlink] = useState(1); // eyelid scaleY: 1 open, 0.08 shut
  const [saccade, setSaccade] = useState({ x: 0, y: 0 }); // idle glance offset
  const [mouthIdx, setMouthIdx] = useState(0); // active talk-loop shape index
  const [tilt, setTilt] = useState(0); // rare idle micro head-tilt, degrees

  const idleLive = !reduceMotion && !compact && state === 'idle';
  const talking = !compact && !reduceMotion && expr.mouth === 'talking';

  // Stable per-instance seeded RNG, seeded once inside an effect (so no impure
  // call happens during render) and held in a ref. `rand` delegates to it; the
  // effect runs before the animation effects below, so the ref is always set
  // by the time any scheduled callback fires. A tiny LCG fallback covers the
  // (never-hit) pre-seed window so the type stays non-null.
  const randRef = useRef<(min: number, max: number) => number>(() => 0);
  useEffect(() => {
    randRef.current = makeRand(((Math.random() * 0xffffffff) >>> 0) || 1);
  }, []);
  const rand = (min: number, max: number) => randRef.current(min, max);

  // --- Blink loop (both tiers): randomised intervals + occasional double. ---
  useEffect(() => {
    if (reduceMotion) return;
    let blinkTimer: ReturnType<typeof setTimeout>;
    let openTimer: ReturnType<typeof setTimeout>;
    let doubleTimer: ReturnType<typeof setTimeout>;

    const doBlink = (then?: () => void) => {
      setBlink(0.08);
      openTimer = setTimeout(() => {
        setBlink(1);
        then?.();
      }, 120);
    };

    const schedule = () => {
      blinkTimer = setTimeout(() => {
        if (rand(0, 1) < 0.25) {
          // Occasional double-blink for liveliness.
          doBlink(() => {
            doubleTimer = setTimeout(() => doBlink(), 170);
          });
        } else {
          doBlink();
        }
        schedule();
      }, rand(2500, 6000));
    };

    schedule();
    return () => {
      clearTimeout(blinkTimer);
      clearTimeout(openTimer);
      clearTimeout(doubleTimer);
    };
  }, [reduceMotion]);

  // --- Idle saccades: small random glances, then settle back to centre. ---
  useEffect(() => {
    if (!idleLive) return;
    let moveTimer: ReturnType<typeof setTimeout>;
    let returnTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      moveTimer = setTimeout(() => {
        setSaccade({ x: rand(-0.4, 0.4), y: rand(-0.4, 0.4) });
        returnTimer = setTimeout(
          () => setSaccade({ x: 0, y: 0 }),
          rand(500, 1100)
        );
        schedule();
      }, rand(3000, 7000));
    };

    schedule();
    return () => {
      clearTimeout(moveTimer);
      clearTimeout(returnTimer);
    };
  }, [idleLive]);

  // --- Rare idle micro head-tilt: ~every 10-20s rotate +-2deg, then return. ---
  useEffect(() => {
    if (!idleLive) return;
    let tiltTimer: ReturnType<typeof setTimeout>;
    let returnTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      tiltTimer = setTimeout(() => {
        setTilt(rand(0, 1) < 0.5 ? 2 : -2);
        returnTimer = setTimeout(() => setTilt(0), rand(1200, 2200));
        schedule();
      }, rand(10000, 20000));
    };

    schedule();
    return () => {
      clearTimeout(tiltTimer);
      clearTimeout(returnTimer);
    };
  }, [idleLive]);

  // --- Procedural talk loop: cycle mouth shapes at varied fast intervals. ---
  useEffect(() => {
    if (!talking) return;
    let frame: ReturnType<typeof setTimeout>;
    let prev = 0;
    const tick = () => {
      // Step to a DIFFERENT shape each frame (no repeated-shape stalls) at a
      // varied 160-280ms cadence, so it reads as calm speech, not a metronome.
      let next = Math.floor(rand(0, TALK_SHAPES.length)) % TALK_SHAPES.length;
      if (next === prev) next = (next + 1) % TALK_SHAPES.length;
      prev = next;
      setMouthIdx(next);
      frame = setTimeout(tick, rand(160, 280));
    };
    tick();
    return () => clearTimeout(frame);
  }, [talking]);

  // --- Head group motion: breathing/pulse + speaking bob + tilt/wobble. ---
  // Idle rotation is the rare, timer-driven micro head-tilt (`tilt`); thinking
  // adds a continuous subtle wobble; speaking adds a gentle vertical bob.
  const headAnimate = reduceMotion
    ? { scale: 1, y: 0, rotate: 0 }
    : {
        scale: expr.pulseScale,
        y: state === 'speaking' ? [0, -1.5, 0] : 0,
        rotate: state === 'thinking' ? [0, 1.5, -1.5, 0] : tilt,
      };

  const headTransition: Transition = {
    scale: {
      duration: expr.breathDuration,
      repeat: Infinity,
      ease: 'easeInOut',
    },
    y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
    rotate:
      state === 'thinking'
        ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
        : { duration: 1.1, ease: 'easeInOut' },
  };

  // Resolved animated values (expression resting values + live offsets).
  const eyeScaleY = (reduceMotion ? 1 : blink) * (compact ? 1 : expr.eyeOpen);
  const gazeX = expr.gaze.x + (idleLive ? saccade.x : 0);
  const gazeY = expr.gaze.y + (idleLive ? saccade.y : 0);
  const pupilDx = gazeX * 3;
  const pupilDy = gazeY * 3;

  // Geometry constants (viewBox 0..100).
  const eyeY = 44;
  const eyeRx = 6.5;
  const eyeRyBase = 7.5;
  const browY = 30 + expr.browY;
  const haloBlur = size * 0.18;

  const eyeTransition: Transition = { duration: 0.12, ease: 'easeOut' };
  const featureTransition: Transition = { duration: 0.45, ease: 'easeOut' };

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {/* Soft breathing halo (subtle/omitted in the compact tier). */}
      {!compact && (
        <motion.div
          aria-hidden
          animate={
            reduceMotion
              ? { opacity: 0.45 }
              : {
                  opacity:
                    state === 'idle' ? [0.35, 0.5, 0.35] : [0.5, 0.8, 0.5],
                }
          }
          transition={{
            duration: expr.breathDuration * 1.3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            inset: -size * 0.18,
            borderRadius: '50%',
            background: appearance.gradient,
            filter: `blur(${haloBlur}px)`,
          }}
        />
      )}

      {/* Expanding accent ring while listening. */}
      {expr.showRing && !reduceMotion && (
        <motion.div
          aria-hidden
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${appearance.accent}`,
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* Head + face move together as one breathing/bobbing group. */}
      <motion.div
        animate={headAnimate}
        transition={headTransition}
        style={{ position: 'relative', width: size, height: size }}
      >
        {/* Luminous head — ported from the orb (gradient + inset shading). */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: appearance.gradient,
            boxShadow: `0 20px 60px ${alpha(appearance.accent, 0.5)}, inset 0 -10px 30px ${alpha('#000', 0.35)}, inset 0 8px 20px ${alpha('#fff', 0.25)}`,
          }}
        >
          {/* Glossy upper-left highlight. */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: '14%',
              left: '20%',
              width: '34%',
              height: '24%',
              borderRadius: '50%',
              background: alpha('#fff', 0.45),
              filter: 'blur(6px)',
            }}
          />
        </Box>

        {/* Face overlay — viewBox maps the PRD coordinates onto the head. */}
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
        >
          {/* Eyes (pupils glide with gaze; whites blink via scaleY). */}
          {[37, 63].map((cx) => (
            <g key={cx}>
              <motion.ellipse
                cx={cx}
                cy={eyeY}
                rx={eyeRx}
                ry={eyeRyBase}
                fill={EYE_WHITE}
                animate={{ scaleY: eyeScaleY }}
                transition={eyeTransition}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
              <motion.circle
                r={4.5}
                fill={PUPIL}
                animate={{
                  cx: cx + pupilDx,
                  cy: eyeY + pupilDy,
                  scaleY: eyeScaleY,
                }}
                transition={eyeTransition}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            </g>
          ))}

          {/* Brows (full tier only) — darker accent tint. */}
          {!compact && (
            <>
              <motion.line
                x1={30}
                x2={44}
                stroke={featureTint}
                strokeWidth={2.6}
                strokeLinecap="round"
                animate={{ y1: browY + expr.browTilt, y2: browY - 1 }}
                transition={featureTransition}
              />
              <motion.line
                x1={56}
                x2={70}
                stroke={featureTint}
                strokeWidth={2.6}
                strokeLinecap="round"
                animate={{ y1: browY - 1, y2: browY }}
                transition={featureTransition}
              />
            </>
          )}

          {/* Mouth — talk-loop ellipse while speaking, soft smile otherwise. */}
          {talking ? (
            <motion.ellipse
              cx={50}
              cy={66}
              fill={featureTint}
              animate={{
                rx: TALK_SHAPES[mouthIdx].rx,
                ry: TALK_SHAPES[mouthIdx].ry,
              }}
              transition={{ duration: 0.13, ease: 'easeOut' }}
            />
          ) : !compact && reduceMotion && expr.mouth === 'talking' ? (
            // Reduced motion: hold an open mouth so "speaking" still reads.
            <ellipse cx={50} cy={66} rx={5} ry={3.6} fill={featureTint} />
          ) : (
            <path
              d="M40 64 Q50 71 60 64"
              fill="none"
              stroke={featureTint}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          )}

          {/* Floating "…" thinking dots (full tier only). Placed upper-right,
              echoing the up-and-aside thinking gaze like a thought bubble. */}
          {!compact && expr.showDots && (
            <g fill={featureTint}>
              {[64, 71, 78].map((dx, i) =>
                reduceMotion ? (
                  <circle key={dx} cx={dx} cy={22} r={2.2} opacity={0.7} />
                ) : (
                  <motion.circle
                    key={dx}
                    cx={dx}
                    cy={22}
                    r={2.2}
                    animate={{ opacity: [0.2, 1, 0.2], cy: [22, 19, 22] }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.18,
                    }}
                  />
                )
              )}
            </g>
          )}
        </svg>
      </motion.div>
    </Box>
  );
}
