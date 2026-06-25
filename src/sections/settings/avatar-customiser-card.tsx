import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';

import Avatar from '../../components/avatar';
import Iconify from '../../components/iconify';
import {
  AVATAR_APPEARANCES,
  PERSONALITY_OPTIONS,
  VOICE_OPTIONS,
} from '../../_mock';
import { GRADIENTS, PALETTE } from '../../theme';
import type { PersonalityTone } from '../../types';

// ----------------------------------------------------------------------
// Avatar customisation: live-preview orb + name field + appearance,
// personality and voice selectors. All state lives in the parent view.
// ----------------------------------------------------------------------

type Props = {
  name: string;
  onNameChange: (name: string) => void;
  appearanceId: string;
  onAppearanceChange: (id: string) => void;
  personalityTone: PersonalityTone;
  onPersonalityChange: (tone: PersonalityTone) => void;
  voiceId: string;
  onVoiceChange: (id: string) => void;
};

export default function AvatarCustomiserCard({
  name,
  onNameChange,
  appearanceId,
  onAppearanceChange,
  personalityTone,
  onPersonalityChange,
  voiceId,
  onVoiceChange,
}: Props) {
  return (
    <Card sx={{ p: 2.5 }}>
      <SectionLabel icon="solar:magic-stick-3-bold-duotone" label="Your avatar" />

      {/* live preview */}
      <Stack spacing={2} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Avatar size={80} appearanceId={appearanceId} state="speaking" />
        <TextField
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Avatar name"
          size="small"
          slotProps={{ htmlInput: { style: { textAlign: 'center', fontWeight: 600 } } }}
          sx={{ maxWidth: 220 }}
        />
      </Stack>

      {/* appearance swatches */}
      <FieldLabel>Appearance</FieldLabel>
      <Stack
        direction="row"
        spacing={1.25}
        useFlexGap
        sx={{ flexWrap: 'wrap', mb: 2.5 }}
      >
        {AVATAR_APPEARANCES.map((a) => {
          const selected = a.id === appearanceId;
          return (
            <Box
              key={a.id}
              role="button"
              aria-label={a.label}
              onClick={() => onAppearanceChange(a.id)}
              sx={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                cursor: 'pointer',
                background: a.gradient,
                transition: 'transform .15s ease, box-shadow .15s ease',
                outline: selected ? `2px solid ${a.accent}` : '2px solid transparent',
                outlineOffset: 3,
                boxShadow: selected ? `0 0 0 1px ${alpha('#000', 0.3)}` : 'none',
                transform: selected ? 'scale(1.06)' : 'none',
                '&:hover': { transform: 'scale(1.06)' },
              }}
            />
          );
        })}
      </Stack>

      {/* personality tone */}
      <FieldLabel>Personality</FieldLabel>
      <Stack spacing={1} sx={{ mb: 2.5 }}>
        {PERSONALITY_OPTIONS.map((p) => {
          const selected = p.id === personalityTone;
          return (
            <Stack
              key={p.id}
              role="button"
              direction="row"
              spacing={1.5}
              onClick={() => onPersonalityChange(p.id)}
              sx={{
                alignItems: 'center',
                p: 1.25,
                borderRadius: 2,
                cursor: 'pointer',
                border: `1px solid ${selected ? alpha(PALETTE.violet, 0.6) : PALETTE.border}`,
                background: selected ? GRADIENTS.brandSoft : 'transparent',
                transition: 'background .15s ease, border-color .15s ease',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  color: selected ? PALETTE.violetLight : 'text.secondary',
                  bgcolor: alpha('#FFFFFF', 0.04),
                }}
              >
                <Iconify icon={p.icon} width={20} />
              </Box>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {p.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {p.description}
                </Typography>
              </Stack>
              {selected && (
                <Iconify
                  icon="solar:check-circle-bold"
                  width={20}
                  sx={{ color: PALETTE.violet }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>

      {/* voice */}
      <FieldLabel>Voice</FieldLabel>
      <Stack spacing={1}>
        {VOICE_OPTIONS.map((v) => {
          const selected = v.id === voiceId;
          return (
            <Stack
              key={v.id}
              role="button"
              direction="row"
              spacing={1.5}
              onClick={() => onVoiceChange(v.id)}
              sx={{
                alignItems: 'center',
                p: 1.25,
                borderRadius: 2,
                cursor: 'pointer',
                border: `1px solid ${selected ? alpha(PALETTE.violet, 0.6) : PALETTE.border}`,
                background: selected ? GRADIENTS.brandSoft : 'transparent',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  display: 'grid',
                  placeItems: 'center',
                  color: selected ? PALETTE.violetLight : 'text.secondary',
                  bgcolor: alpha('#FFFFFF', 0.04),
                }}
              >
                <Iconify icon="solar:soundwave-bold-duotone" width={20} />
              </Box>
              <Stack sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {v.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {v.description}
                </Typography>
              </Stack>
              <Box
                role="button"
                aria-label={`Preview ${v.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toast(`Playing a preview of ${v.label}…`);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  cursor: 'pointer',
                  color: PALETTE.violetLight,
                  border: `1px solid ${alpha(PALETTE.violet, 0.4)}`,
                  '&:hover': { bgcolor: alpha(PALETTE.violet, 0.12) },
                }}
              >
                <Iconify icon="solar:play-bold" width={14} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Preview
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Card>
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

function FieldLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: 'text.secondary', display: 'block', mb: 1, letterSpacing: '0.06em' }}
    >
      {children}
    </Typography>
  );
}
