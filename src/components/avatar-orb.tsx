import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { AVATAR_APPEARANCES } from '../_mock';
import type { AvatarState } from '../types';

// ----------------------------------------------------------------------
// Placeholder for the future 2D avatar. Renders an animated gradient orb
// that reacts to the four PRD presence states (idle/listening/speaking/
// thinking). Appearance is driven by the selected avatar appearanceId.
// ----------------------------------------------------------------------

type Props = {
  size?: number;
  appearanceId?: string;
  state?: AvatarState;
};

const MotionBox = motion.create(Box);

export default function AvatarOrb({
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

  // Per-state motion: gentle breathing when idle, faster pulse when active.
  const animate =
    state === 'speaking'
      ? { scale: [1, 1.06, 0.98, 1.04, 1] }
      : state === 'listening'
        ? { scale: [1, 1.04, 1] }
        : state === 'thinking'
          ? { scale: [1, 1.02, 1], rotate: [0, 2, -2, 0] }
          : { scale: [1, 1.03, 1] };

  const duration =
    state === 'speaking' ? 0.9 : state === 'listening' ? 1.4 : state === 'thinking' ? 1.1 : 4;

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
      {/* soft halo */}
      <MotionBox
        aria-hidden
        animate={{ opacity: state === 'idle' ? [0.35, 0.5, 0.35] : [0.5, 0.8, 0.5] }}
        transition={{ duration: duration * 1.3, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          inset: -size * 0.18,
          borderRadius: '50%',
          background: appearance.gradient,
          filter: `blur(${size * 0.18}px)`,
        }}
      />

      {/* listening ring */}
      {state === 'listening' && (
        <MotionBox
          aria-hidden
          animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          sx={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            border: `2px solid ${appearance.accent}`,
          }}
        />
      )}

      {/* core orb */}
      <MotionBox
        animate={animate}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: appearance.gradient,
          boxShadow: `0 20px 60px ${alpha(appearance.accent, 0.5)}, inset 0 -10px 30px ${alpha('#000', 0.35)}, inset 0 8px 20px ${alpha('#fff', 0.25)}`,
        }}
      >
        {/* glossy highlight */}
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
      </MotionBox>
    </Box>
  );
}
