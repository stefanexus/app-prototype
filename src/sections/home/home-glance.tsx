import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';

import Iconify from '../../components/iconify';
import { GRADIENTS, PALETTE } from '../../theme';
import { MOCK_CALENDAR, MOCK_FITNESS } from '../../_mock';

// ----------------------------------------------------------------------
// "Today at a glance" — a compact, horizontally-scrolling row of tiles
// (steps, active minutes, upcoming events). Kept short on the vertical
// axis so the home screen fits within the phone height with the bottom
// nav visible. PRD stories 13-14, 26.
// ----------------------------------------------------------------------

// Shared compact tile. Fixed width so several peek into view and the row
// invites a horizontal swipe.
const TILE_SX = {
  flexShrink: 0,
  width: 132,
  p: 1.75,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  scrollSnapAlign: 'start',
} as const;

function StepsCard() {
  const { steps, goalSteps } = MOCK_FITNESS;
  const pct = Math.min(100, Math.round((steps / goalSteps) * 100));

  return (
    <Card sx={TILE_SX}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={44}
          thickness={4}
          sx={{ color: alpha('#FFFFFF', 0.08) }}
        />
        <CircularProgress
          variant="determinate"
          value={pct}
          size={44}
          thickness={4}
          sx={{
            color: PALETTE.violet,
            position: 'absolute',
            left: 0,
            '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
          }}
        />
        <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          <Iconify
            icon="solar:walking-bold-duotone"
            width={18}
            sx={{ color: PALETTE.violetLight }}
          />
        </Box>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {steps.toLocaleString()}
        </Typography>
        <Typography variant="caption" sx={{ color: PALETTE.textSecondary }}>
          of {goalSteps.toLocaleString()} steps
        </Typography>
      </Box>
    </Card>
  );
}

function ActiveMinutesCard() {
  const { activeMinutes } = MOCK_FITNESS;

  return (
    <Card sx={TILE_SX}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          background: GRADIENTS.brandSoft,
          border: `1px solid ${alpha(PALETTE.cyan, 0.3)}`,
        }}
      >
        <Iconify icon="solar:fire-bold-duotone" width={20} sx={{ color: PALETTE.cyan }} />
      </Box>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {activeMinutes}
          <Box
            component="span"
            sx={{ fontSize: '0.75rem', color: PALETTE.textSecondary, ml: 0.5 }}
          >
            min
          </Box>
        </Typography>
        <Typography variant="caption" sx={{ color: PALETTE.textSecondary }}>
          Active minutes
        </Typography>
      </Box>
    </Card>
  );
}

function EventCard({ event }: { event: (typeof MOCK_CALENDAR)[number] }) {
  return (
    <Card sx={TILE_SX}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha(event.color, 0.16),
        }}
      >
        <Iconify icon={event.icon} width={20} sx={{ color: event.color }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.25,
            color: PALETTE.text,
            // clamp to two lines so tiles stay a uniform height
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: PALETTE.textSecondary, fontVariantNumeric: 'tabular-nums' }}
        >
          {event.time}
        </Typography>
      </Box>
    </Card>
  );
}

const MotionBox = motion.create(Box);

export default function HomeGlance() {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
        Today at a glance
      </Typography>

      <MotionBox
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        sx={{
          display: 'flex',
          gap: 1.25,
          overflowX: 'auto',
          // bleed to the frame edges (parent content padding is 2.5) so the
          // last tile peeks off-screen, signalling the row is swipeable
          mx: -2.5,
          px: 2.5,
          pb: 0.5,
          scrollSnapType: 'x proximity',
          // scroll-padding must match the px inset (2.5 = 20px). Without it
          // scroll-snap aligns the first tile's 'start' to the frame edge,
          // eating the inset and clipping the first card on load.
          scrollPaddingInline: '20px',
          // hide scrollbar for a cleaner mobile feel
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <StepsCard />
        <ActiveMinutesCard />
        {MOCK_CALENDAR.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </MotionBox>
    </Box>
  );
}
