import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { PALETTE, GRADIENTS } from '../../theme';
import { paths } from '../../routes/paths';
import Iconify from '../../components/iconify';
import Avatar from '../../components/avatar';
import MobileShell from '../../components/mobile-shell';

// ----------------------------------------------------------------------
// First-launch welcome / intro screen. Emotionally invites the user in,
// shows the avatar presence + a few light feature highlights, and leads
// into onboarding. Visual only — local state / navigation, no persistence.
// ----------------------------------------------------------------------

const MotionBox = motion.create(Box);

const FEATURES = [
  {
    icon: 'solar:bolt-bold-duotone',
    title: 'Proactive nudges',
    caption: 'Gentle prompts before you even ask',
  },
  {
    icon: 'solar:microphone-3-bold-duotone',
    title: 'Talk naturally',
    caption: 'Just speak — no menus, no commands',
  },
  {
    icon: 'solar:calendar-mark-bold-duotone',
    title: 'Knows your day',
    caption: 'Your routine, habits and schedule',
  },
] as const;

// Shared entrance transition (subtle fade + slide-up).
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function WelcomeView() {
  const navigate = useNavigate();

  return (
    <MobileShell>
      <MotionBox
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12, delayChildren: 0.05 }}
        sx={{
          minHeight: '100%',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Wordmark + tagline */}
        <MotionBox variants={fadeUp} transition={{ duration: 0.5, ease: 'easeOut' }} sx={{ pt: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontSize: 34,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: GRADIENTS.brand,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Aura
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 1, mx: 'auto', color: 'text.secondary', maxWidth: 280, lineHeight: 1.5 }}
          >
            A personal assistant that truly knows you — your routine, your habits,
            your day.
          </Typography>
        </MotionBox>

        {/* Hero avatar presence */}
        <MotionBox
          variants={fadeUp}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 3,
          }}
        >
          <Avatar size={190} appearanceId="nova" state="idle" />
        </MotionBox>

        {/* Feature highlights */}
        <MotionBox
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          sx={{
            width: '100%',
            maxWidth: 360,
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
          }}
        >
          {FEATURES.map((feature) => (
            <Box
              key={feature.title}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.75,
                px: 2,
                py: 1.25,
                borderRadius: 3,
                textAlign: 'left',
                border: `1px solid ${PALETTE.border}`,
                background: alpha(PALETTE.surfaceHi, 0.5),
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  background: GRADIENTS.brandSoft,
                }}
              >
                <Iconify icon={feature.icon} width={22} sx={{ color: 'primary.light' }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {feature.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {feature.caption}
                </Typography>
              </Box>
            </Box>
          ))}
        </MotionBox>

        {/* Calls to action */}
        <MotionBox
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          sx={{
            width: '100%',
            pt: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Button
            fullWidth
            size="large"
            variant="contained"
            endIcon={<Iconify icon="solar:arrow-right-bold" width={20} />}
            onClick={() => navigate(paths.onboarding)}
            sx={{ maxWidth: 360 }}
          >
            Get started
          </Button>
          <Button
            variant="text"
            onClick={() => navigate(paths.home)}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Skip to demo
          </Button>
        </MotionBox>
      </MotionBox>
    </MobileShell>
  );
}
