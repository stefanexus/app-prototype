import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import Avatar from "../../components/avatar";
import Iconify from "../../components/iconify";
import { GRADIENTS, PALETTE } from "../../theme";
import type { WakeWordStatus } from "../../hooks/use-wake-word";
import type { AvatarState } from "../../types";

// ----------------------------------------------------------------------
// Avatar presence — the hero of the Home screen. Tap the orb once (or say
// the wake word) and the avatar starts listening; tap again and it answers
// aloud. Below it, a compact "speech bubble" carries the avatar's voice — a
// proactive nudge before the first answer, a "Listening…" cue while listening,
// and the latest spoken reply once the avatar has answered.
//
// The bubble shows the first 3 lines by default; when the text is longer it
// becomes tap-to-expand and the full reply floats out as an overlay panel
// over the bottom group (HomeView dims that group while it's open).
// ----------------------------------------------------------------------

type Nudge = {
  id: string;
  category: string;
  icon: string;
  text: string;
};

type Props = {
  state: AvatarState;
  appearanceId: string;
  avatarName: string;
  nudge: Nudge;
  /** The line the avatar is speaking aloud (shown as a short caption). */
  spokenText: string;
  /** Wake word to advertise in the idle hint, when voice activation works. */
  wakeWord?: string;
  /** Current wake-word recogniser status, if supported. */
  wakeStatus?: WakeWordStatus;
  onToggle: () => void;
  /** Orb diameter — driven by viewport height so the screen always fits. */
  orbSize: number;
  /** Whether the speech bubble is expanded to its full height. */
  expanded: boolean;
  /** Toggle the expanded state of the speech bubble. */
  onToggleExpand: () => void;
};

const MotionBox = motion.create(Box);

// Collapsed bubbles show at most this many lines; the rest is revealed on tap.
const COLLAPSED_LINES = 3;

const CLAMP_SX = {
  display: "-webkit-box",
  WebkitLineClamp: COLLAPSED_LINES,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
} as const;

// Shared balloon surface (collapsed, in-flow version).
const BALLOON_SX = {
  position: "relative",
  p: 1.5,
  borderRadius: 2.5,
  bgcolor: PALETTE.surfaceHi,
  border: `1px solid ${PALETTE.border}`,
  background: GRADIENTS.brandSoft,
  backdropFilter: "blur(6px)",
} as const;

export default function HomePresence({
  state,
  appearanceId,
  avatarName,
  nudge,
  spokenText,
  wakeWord,
  wakeStatus,
  onToggle,
  orbSize,
  expanded,
  onToggleExpand,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  const handleExpandKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggleExpand();
      }
    },
    [onToggleExpand],
  );

  const listening = state === "listening";
  const thinking = state === "thinking";
  const speaking = state === "speaking";
  const hasSpokenText = spokenText.trim().length > 0;
  const showingReply = thinking || speaking || (hasSpokenText && !listening);
  // Engaged in any way (listening, thinking or speaking): zoom in + pulse.
  const active = listening || thinking || speaking;
  const wakeReady =
    !!wakeWord && (wakeStatus === "listening" || wakeStatus === "starting");
  const wakeNeedsGesture = !!wakeWord && wakeStatus === "needs-gesture";
  const wakeBlocked = !!wakeWord && wakeStatus === "blocked";

  // Whether the collapsed caption is actually clipped (more than 3 lines) —
  // only then is the bubble worth expanding. Measured from the clamped node.
  const textRef = useRef<HTMLElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [overflowing, setOverflowing] = useState(false);

  const measure = useCallback(() => {
    const el = textRef.current;
    setOverflowing(!!el && el.scrollHeight - el.clientHeight > 1);
  }, []);

  // Attach to the clamped caption and re-measure on any size change — this
  // catches viewport resizes and, crucially, the web-font swap, which reflows
  // the text (the fallback font wraps wider, so measuring before it loads can
  // leave a stale "expandable" flag on a line that actually fits).
  const setTextRef = useCallback(
    (node: HTMLElement | null) => {
      roRef.current?.disconnect();
      roRef.current = null;
      textRef.current = node;
      if (!node) {
        setOverflowing(false);
        return;
      }
      measure();
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(() => measure());
        ro.observe(node);
        roRef.current = ro;
      }
    },
    [measure],
  );

  // Re-measure when the caption content changes…
  useLayoutEffect(() => {
    measure();
  }, [measure, state, spokenText, nudge.text, orbSize, expanded]);

  // …and once web fonts finish loading, then clean up the observer on unmount.
  useEffect(() => {
    document.fonts?.ready.then(() => measure()).catch(() => {});
    return () => roRef.current?.disconnect();
  }, [measure]);

  // Control hint under the orb — one line per state.
  const hint = speaking
    ? {
        icon: "solar:soundwave-bold-duotone",
        color: PALETTE.cyan,
        text: "Tap to stop",
      }
    : thinking
      ? {
          icon: "solar:soundwave-bold-duotone",
          color: PALETTE.violetLight,
          text: "Thinking…",
        }
      : listening
        ? {
            icon: "solar:microphone-bold-duotone",
            color: PALETTE.cyan,
            text: "Listening… tap to reply",
          }
        : {
            icon: "solar:play-bold",
            color: PALETTE.textSecondary,
            text: wakeReady
              ? `Tap to talk - or say "${wakeWord}"`
              : wakeNeedsGesture
                ? `Tap to enable "${wakeWord}"`
                : wakeBlocked
                  ? "Mic blocked - tap to talk"
                  : "Tap to talk",
          };

  const ariaLabel = speaking
    ? `Stop ${avatarName} speaking`
    : listening
      ? `${avatarName} is listening - tap to reply`
      : `Tap to talk to ${avatarName}`;

  // Which bubble variant is showing (drives the enter/exit transition).
  const bubbleKey = showingReply ? "reply" : listening ? "listening" : "nudge";

  // The collapsed bubble is only interactive once there is hidden text to show.
  const canExpand = overflowing || expanded;
  const inFlowInteractive = overflowing && !expanded;

  // Body of the bubble for the current state. `clamp` drives the collapsed
  // 3-line cap and attaches the measuring ref; the expanded overlay passes
  // false to show the whole thing.
  const renderBody = (clamp: boolean) => {
    if (showingReply) {
      return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Iconify
            icon="solar:soundwave-bold-duotone"
            width={20}
            sx={{ color: PALETTE.violetLight, flexShrink: 0, mt: "2px" }}
          />
          <Typography
            ref={clamp ? setTextRef : undefined}
            variant="body2"
            sx={{
              color: PALETTE.text,
              fontWeight: 600,
              lineHeight: 1.4,
              ...(clamp ? CLAMP_SX : {}),
            }}
          >
            {thinking ? "Thinking…" : spokenText}
          </Typography>
        </Box>
      );
    }
    if (listening) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Iconify
            icon="solar:microphone-bold-duotone"
            width={20}
            sx={{ color: PALETTE.cyan, flexShrink: 0 }}
          />
          <Typography
            variant="body2"
            sx={{ color: PALETTE.text, fontWeight: 600, lineHeight: 1.4 }}
          >
            Listening…
          </Typography>
        </Box>
      );
    }
    return (
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(PALETTE.violet, 0.18),
          }}
        >
          <Iconify
            icon={nudge.icon}
            width={16}
            sx={{ color: PALETTE.violetLight }}
          />
        </Box>
        <Typography
          ref={clamp ? setTextRef : undefined}
          variant="body2"
          sx={{
            color: PALETTE.text,
            lineHeight: 1.4,
            ...(clamp ? CLAMP_SX : {}),
          }}
        >
          {nudge.text}
        </Typography>
      </Box>
    );
  };

  // Little round chevron in the bubble — the expand cue.
  const renderChevron = (up: boolean, centerY = false) => (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        top: centerY ? "50%" : 10,
        right: 10,
        transform: centerY ? "translateY(-50%)" : undefined,
        width: 22,
        height: 22,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: alpha(PALETTE.violet, 0.18),
      }}
    >
      <Iconify
        icon={up ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"}
        width={14}
        sx={{ color: PALETTE.violetLight }}
      />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.75,
        width: "100%",
      }}
    >
      {/* The avatar is the tap-to-talk control. A gentle pulse while it's
          engaged; idle breathing lives in Avatar. */}
      <MotionBox
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        whileTap={{ scale: 0.94 }}
        animate={{ scale: active ? [1.3, 1.4, 1.3] : 1 }}
        transition={
          active
            ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3, ease: "easeOut" }
        }
        sx={{
          cursor: "pointer",
          outline: "none",
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
        }}
      >
        <Avatar size={orbSize} appearanceId={appearanceId} state={state} />
      </MotionBox>

      {/* control hint */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <Iconify icon={hint.icon} width={16} sx={{ color: hint.color }} />
        <Typography
          variant="body2"
          sx={{ color: PALETTE.textSecondary, fontWeight: 600 }}
        >
          {hint.text}
        </Typography>
      </Box>

      {/* compact speech bubble — the avatar's voice */}
      <Box sx={{ width: "100%", position: "relative" }}>
        {/* little tail pointing up to the orb */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: -6,
            left: "50%",
            transform: "translateX(-50%) rotate(45deg)",
            width: 12,
            height: 12,
            bgcolor: PALETTE.surfaceHi,
            borderLeft: `1px solid ${PALETTE.border}`,
            borderTop: `1px solid ${PALETTE.border}`,
          }}
        />

        {/* collapsed bubble — always in flow, so it reserves the layout height
            and the orb never jumps when the overlay opens. */}
        <Box
          role={inFlowInteractive ? "button" : undefined}
          tabIndex={inFlowInteractive ? 0 : undefined}
          aria-expanded={inFlowInteractive ? false : undefined}
          aria-label={inFlowInteractive ? "Show full message" : undefined}
          onClick={inFlowInteractive ? onToggleExpand : undefined}
          onKeyDown={inFlowInteractive ? handleExpandKey : undefined}
          sx={{
            ...BALLOON_SX,
            cursor: inFlowInteractive ? "pointer" : "default",
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={bubbleKey}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderBody(true)}
            </MotionBox>
          </AnimatePresence>

          {inFlowInteractive && renderChevron(false, true)}
        </Box>

        {/* expanded overlay — floats out over the bottom group (which HomeView
            dims) and grows downward to show the whole message. */}
        <AnimatePresence>
          {canExpand && expanded && (
            <MotionBox
              key="expanded"
              role="button"
              tabIndex={0}
              aria-expanded
              aria-label="Collapse message"
              onClick={onToggleExpand}
              onKeyDown={handleExpandKey}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              sx={{
                ...BALLOON_SX,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 20,
                cursor: "pointer",
                // opaque surface (gradient layered over solid) so the dimmed
                // content below never bleeds through the long caption
                background: `${GRADIENTS.brandSoft}, ${PALETTE.surfaceHi}`,
                boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
                maxHeight: "min(58vh, 420px)",
                overflowY: "auto",
              }}
            >
              {renderBody(false)}
              {renderChevron(true)}
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
