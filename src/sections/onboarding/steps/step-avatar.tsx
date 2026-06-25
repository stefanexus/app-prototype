import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { alpha } from '@mui/material/styles';
import { Controller, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import {
  AVATAR_APPEARANCES,
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  VOICE_OPTIONS,
} from '../../../_mock';
import Avatar from '../../../components/avatar';
import Iconify from '../../../components/iconify';
import { useVoicePreview } from '../../../hooks/use-voice-preview';
import { PALETTE, GRADIENTS } from '../../../theme';
import type { OnboardingFormValues } from '../form-schema';

// ----------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="overline"
      sx={{ color: PALETTE.textSecondary, letterSpacing: '0.08em', display: 'block', mb: 1 }}
    >
      {children}
    </Typography>
  );
}

export default function StepAvatar() {
  const { control } = useFormContext<OnboardingFormValues>();
  const { playingId, preview } = useVoicePreview();

  return (
    <Stack spacing={3.5}>
      {/* live preview */}
      <Controller
        control={control}
        name="appearanceId"
        render={({ field: appearanceField }) => (
          <Box sx={{ display: 'grid', placeItems: 'center', pt: 1 }}>
            <Avatar size={120} appearanceId={appearanceField.value} state="idle" />
          </Box>
        )}
      />

      {/* appearance swatches — first pick */}
      <Box>
        <SectionLabel>Appearance</SectionLabel>
        <Controller
          control={control}
          name="appearanceId"
          render={({ field }) => (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
              }}
            >
              {AVATAR_APPEARANCES.map((look) => {
                const selected = field.value === look.id;
                return (
                  <Box
                    key={look.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => field.onChange(look.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        field.onChange(look.id);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.75,
                      p: 1,
                      borderRadius: 3,
                      border: `1.5px solid ${selected ? look.accent : 'transparent'}`,
                      background: selected ? alpha(look.accent, 0.12) : 'transparent',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: '50%',
                        background: look.gradient,
                        boxShadow: selected
                          ? `0 0 0 3px ${alpha(look.accent, 0.35)}`
                          : 'none',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: selected ? PALETTE.text : PALETTE.textSecondary, fontWeight: 600 }}>
                      {look.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        />
      </Box>

      {/* avatar name */}
      <Controller
        control={control}
        name="avatarName"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            label="Avatar name"
            placeholder="e.g. Aura"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      {/* gender */}
      <Box>
        <SectionLabel>Gender</SectionLabel>
        <Controller
          control={control}
          name="gender"
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              value={field.value}
              onChange={(_, val) => val && field.onChange(val)}
              sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: `1px solid ${PALETTE.border}`, borderRadius: '14px !important' } }}
            >
              {GENDER_OPTIONS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ px: 2, py: 0.75 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {/* voice */}
      <Box>
        <SectionLabel>Voice</SectionLabel>
        <Controller
          control={control}
          name="voiceId"
          render={({ field }) => (
            <Stack spacing={1.25}>
              {VOICE_OPTIONS.map((voice) => {
                const selected = field.value === voice.id;
                return (
                  <Box
                    key={voice.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => field.onChange(voice.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        field.onChange(voice.id);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      border: `1.5px solid ${selected ? alpha(PALETTE.violet, 0.6) : PALETTE.border}`,
                      background: selected ? GRADIENTS.brandSoft : alpha('#fff', 0.02),
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Iconify
                      icon={selected ? 'solar:check-circle-bold' : 'solar:soundwave-bold-duotone'}
                      width={22}
                      sx={{ color: selected ? PALETTE.violetLight : PALETTE.textSecondary }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ color: PALETTE.text }}>
                        {voice.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: PALETTE.textSecondary }}>
                        {voice.description}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      variant={playingId === voice.id ? 'contained' : 'outlined'}
                      onClick={async (e) => {
                        e.stopPropagation();
                        const result = await preview(voice);
                        if (result === 'unsupported') {
                          toast("Voice preview isn't supported in this browser.");
                        }
                      }}
                      sx={{
                        flexShrink: 0,
                        py: 0.5,
                        px: 1.5,
                        color: playingId === voice.id ? '#fff' : PALETTE.text,
                        borderColor: PALETTE.border,
                      }}
                      startIcon={
                        <Iconify
                          icon={playingId === voice.id ? 'solar:stop-bold' : 'solar:play-bold'}
                          width={14}
                        />
                      }
                    >
                      {playingId === voice.id ? 'Playing' : 'Preview'}
                    </Button>
                  </Box>
                );
              })}
            </Stack>
          )}
        />
      </Box>

      {/* personality tone */}
      <Box>
        <SectionLabel>Personality tone</SectionLabel>
        <Controller
          control={control}
          name="personalityTone"
          render={({ field }) => (
            <Stack spacing={1.25}>
              {PERSONALITY_OPTIONS.map((tone) => {
                const selected = field.value === tone.id;
                return (
                  <Box
                    key={tone.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => field.onChange(tone.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        field.onChange(tone.id);
                      }
                    }}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      borderRadius: 3,
                      border: `1.5px solid ${selected ? alpha(PALETTE.violet, 0.6) : PALETTE.border}`,
                      background: selected ? GRADIENTS.brandSoft : alpha('#fff', 0.02),
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        background: selected ? GRADIENTS.brand : alpha('#fff', 0.06),
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={tone.icon} width={24} sx={{ color: '#fff' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" sx={{ color: PALETTE.text }}>
                        {tone.label}
                      </Typography>
                      <Typography variant="caption" sx={{ color: PALETTE.textSecondary }}>
                        {tone.description}
                      </Typography>
                    </Box>
                    {selected && (
                      <Iconify icon="solar:check-circle-bold" width={22} sx={{ color: PALETTE.violetLight }} />
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
        />
      </Box>
    </Stack>
  );
}
