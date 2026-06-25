import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

import Iconify from '../../components/iconify';
import { PALETTE } from '../../theme';

// ----------------------------------------------------------------------
// Quick-action suggestion chips (PRD stories 8-11). Visual only — tapping
// surfaces a toast; in the real app these seed a Claude conversation.
// ----------------------------------------------------------------------

type Props = {
  onAction: (label: string) => void;
};

const QUICK_ACTIONS = [
  { label: 'What should I eat?', icon: 'solar:cup-hot-bold-duotone' },
  { label: 'What movie tonight?', icon: 'solar:clapperboard-play-bold-duotone' },
  { label: 'Plan my day', icon: 'solar:checklist-minimalistic-bold-duotone' },
];

const MotionBox = motion.create(Box);

export default function HomeQuickActions({ onAction }: Props) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
          // hide scrollbar on the chip row for a cleaner mobile feel
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Chip
            key={action.label}
            label={action.label}
            onClick={() => onAction(action.label)}
            icon={
              <Iconify
                icon={action.icon}
                width={18}
                sx={{ color: `${PALETTE.violetLight} !important` }}
              />
            }
            sx={{
              flexShrink: 0,
              py: 2,
              px: 0.5,
              borderRadius: 999,
              color: PALETTE.text,
              bgcolor: alpha('#FFFFFF', 0.04),
              border: `1px solid ${PALETTE.border}`,
              '&:hover': { bgcolor: alpha(PALETTE.violet, 0.16) },
            }}
          />
        ))}
      </Box>
    </MotionBox>
  );
}
