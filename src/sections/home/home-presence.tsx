import { useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Avatar from '../../components/avatar';
import Iconify from '../../components/iconify';
import { GRADIENTS, PALETTE } from '../../theme';
import type { AvatarState } from '../../types';

// ----------------------------------------------------------------------
// Avatar presence — the hero of the Home screen. The orb itself IS the
// microphone: tap it to start/stop listening (PRD stories 4-6). Below it,
// a compact "speech bubble" carries the avatar's voice — a proactive
// nudge when idle, "I'm listening…" while active.
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
  listening: boolean;
  onToggle: () => void;
  /** Orb diameter — driven by viewport height so the screen always fits. */
  orbSize: number;
};

const MotionBox = motion.create(Box);

export default function HomePresence({
  state,
  appearanceId,
  avatarName,
  nudge,
  listening,
  onToggle,
  orbSize,
}: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.75,
        width: '100%',
      }}
    >
      {/* The avatar is the tap-to-talk control. It zooms in while
          listening; idle breathing + the listening ring live in Avatar. */}
      <MotionBox
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-label={listening ? 'Stop listening' : 'Tap to talk'}
        whileTap={{ scale: 0.94 }}
        animate={{ scale: listening ? 1.75 : 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        sx={{
          cursor: 'pointer',
          outline: 'none',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
        }}
      >
        <Avatar size={orbSize} appearanceId={appearanceId} state={state} />
      </MotionBox>

      {/* control hint */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Iconify
          icon="solar:microphone-3-bold-duotone"
          width={16}
          sx={{ color: listening ? PALETTE.cyan : PALETTE.textSecondary }}
        />
        <Typography variant="body2" sx={{ color: PALETTE.textSecondary, fontWeight: 600 }}>
          Tap to talk
        </Typography>
      </Box>

      {/* compact speech bubble — the avatar speaking */}
      <Box sx={{ width: '100%', position: 'relative' }}>
        {/* little tail pointing up to the orb */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -6,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 12,
            height: 12,
            bgcolor: PALETTE.surfaceHi,
            borderLeft: `1px solid ${PALETTE.border}`,
            borderTop: `1px solid ${PALETTE.border}`,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: PALETTE.surfaceHi,
            border: `1px solid ${PALETTE.border}`,
            background: GRADIENTS.brandSoft,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: PALETTE.violetLight,
              letterSpacing: '0.08em',
              display: 'block',
              lineHeight: 1.5,
            }}
          >
            {avatarName}
          </Typography>

          <AnimatePresence mode="wait">
            <MotionBox
              key={listening ? 'listening' : 'nudge'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {listening ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify
                    icon="solar:soundwave-bold-duotone"
                    width={20}
                    sx={{ color: PALETTE.cyan }}
                  />
                  <Typography variant="body2" sx={{ color: PALETTE.text, fontWeight: 600 }}>
                    I'm listening…
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: alpha(PALETTE.violet, 0.18),
                    }}
                  >
                    <Iconify icon={nudge.icon} width={16} sx={{ color: PALETTE.violetLight }} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: PALETTE.text,
                      lineHeight: 1.4,
                      // clamp so a long nudge can't blow the no-scroll budget
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {nudge.text}
                  </Typography>
                </Box>
              )}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
}
