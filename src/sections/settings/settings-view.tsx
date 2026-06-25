import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';

import Iconify from '../../components/iconify';
import { DEFAULT_AVATAR } from '../../_mock';
import { GRADIENTS, PALETTE } from '../../theme';
import type { PersonalityTone } from '../../types';
import AvatarCustomiserCard from './avatar-customiser-card';

// ----------------------------------------------------------------------
// Settings — avatar customisation (live preview), preference switches and
// a data-clearing flow. All state is local; nothing is persisted.
// ----------------------------------------------------------------------

const MotionBox = motion.create(Box);

type Preferences = {
  morningBriefing: boolean;
  proactiveNudges: boolean;
  speakAloud: boolean;
};

const PREF_ROWS: { key: keyof Preferences; label: string; description: string; icon: string }[] = [
  {
    key: 'morningBriefing',
    label: 'Daily morning briefing',
    description: 'A personalised summary each morning.',
    icon: 'solar:sun-bold-duotone',
  },
  {
    key: 'proactiveNudges',
    label: 'Proactive nudges',
    description: 'Timely suggestions without being asked.',
    icon: 'solar:bell-bing-bold-duotone',
  },
  {
    key: 'speakAloud',
    label: 'Speak responses aloud',
    description: 'Hear replies in your chosen voice.',
    icon: 'solar:volume-loud-bold-duotone',
  },
];

export default function SettingsView() {
  // avatar config (local, live-updates the preview orb)
  const [name, setName] = useState(DEFAULT_AVATAR.name);
  const [appearanceId, setAppearanceId] = useState(DEFAULT_AVATAR.appearanceId);
  const [personalityTone, setPersonalityTone] = useState<PersonalityTone>(
    DEFAULT_AVATAR.personalityTone
  );
  const [voiceId, setVoiceId] = useState(DEFAULT_AVATAR.voiceId);

  // preferences
  const [prefs, setPrefs] = useState<Preferences>({
    morningBriefing: true,
    proactiveNudges: true,
    speakAloud: false,
  });

  // clear-data dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  const togglePref = (key: keyof Preferences) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const handleClearData = () => {
    setConfirmOpen(false);
    toast.success('All data cleared.');
  };

  const cards: { id: string; node: ReactNode }[] = [
    {
      id: 'avatar',
      node: (
        <AvatarCustomiserCard
          name={name}
          onNameChange={setName}
          appearanceId={appearanceId}
          onAppearanceChange={setAppearanceId}
          personalityTone={personalityTone}
          onPersonalityChange={setPersonalityTone}
          voiceId={voiceId}
          onVoiceChange={setVoiceId}
        />
      ),
    },
    {
      id: 'prefs',
      node: (
        <Card sx={{ p: 2.5 }}>
          <SectionLabel icon="solar:settings-bold-duotone" label="Preferences" />
          <Stack divider={<Box sx={{ borderTop: `1px solid ${PALETTE.border}` }} />}>
            {PREF_ROWS.map((row) => (
              <Stack
                key={row.key}
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center', py: 1.25 }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'text.secondary',
                    bgcolor: alpha('#FFFFFF', 0.04),
                  }}
                >
                  <Iconify icon={row.icon} width={20} />
                </Box>
                <Stack sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {row.description}
                  </Typography>
                </Stack>
                <Switch
                  checked={prefs[row.key]}
                  onChange={() => togglePref(row.key)}
                  slotProps={{ input: { 'aria-label': row.label } }}
                />
              </Stack>
            ))}
          </Stack>
        </Card>
      ),
    },
    {
      id: 'data',
      node: (
        <Card sx={{ p: 2.5 }}>
          <SectionLabel icon="solar:database-bold-duotone" label="Data" />
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Reset your profile, avatar and conversation history.
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold-duotone" width={20} />}
            onClick={() => setConfirmOpen(true)}
          >
            Clear all data
          </Button>
        </Card>
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Settings
      </Typography>

      <Stack spacing={2}>
        {cards.map((card, i) => (
          <MotionBox
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            {card.node}
          </MotionBox>
        ))}
      </Stack>

      {/* about footer */}
      <Stack spacing={0.25} sx={{ alignItems: 'center', textAlign: 'center', pt: 2, pb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Personal Avatar Assistant
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Prototype v0.1
        </Typography>
      </Stack>

      {/* confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              border: `1px solid ${PALETTE.border}`,
              backgroundColor: PALETTE.surface,
              maxWidth: 360,
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Clear all data?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary' }}>
            This will permanently remove your profile, avatar configuration and
            conversation history. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
          <Button color="inherit" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleClearData}>
            Clear data
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function SectionLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.75,
          display: 'grid',
          placeItems: 'center',
          background: GRADIENTS.brandSoft,
          color: PALETTE.violetLight,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
    </Stack>
  );
}
