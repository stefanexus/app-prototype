import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { alpha } from '@mui/material/styles';
import { Controller, useFormContext } from 'react-hook-form';

import { ACTIVITY_LEVELS, DIETARY_OPTIONS } from '../../../_mock';
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

export default function StepHealth() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <Stack spacing={3}>
      {/* activity level */}
      <Box>
        <SectionLabel>Activity level</SectionLabel>
        <Controller
          control={control}
          name="activityLevel"
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              value={field.value}
              onChange={(_, val) => val && field.onChange(val)}
              sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: `1px solid ${PALETTE.border}`, borderRadius: '14px !important' } }}
            >
              {ACTIVITY_LEVELS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ px: 2, py: 0.75 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {/* dietary restrictions */}
      <Box>
        <SectionLabel>Dietary restrictions</SectionLabel>
        <Controller
          control={control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {DIETARY_OPTIONS.map((opt) => {
                const selected = field.value.includes(opt);
                return (
                  <Chip
                    key={opt}
                    label={opt}
                    onClick={() =>
                      field.onChange(
                        selected
                          ? field.value.filter((v) => v !== opt)
                          : [...field.value, opt]
                      )
                    }
                    sx={{
                      cursor: 'pointer',
                      color: selected ? '#fff' : PALETTE.textSecondary,
                      border: `1px solid ${selected ? alpha(PALETTE.violet, 0.6) : PALETTE.border}`,
                      background: selected ? GRADIENTS.brandSoft : alpha('#fff', 0.02),
                      '&:hover': { background: selected ? GRADIENTS.brandSoft : alpha('#fff', 0.06) },
                    }}
                  />
                );
              })}
            </Box>
          )}
        />
      </Box>

      {/* fitness goals */}
      <Controller
        control={control}
        name="fitnessGoals"
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            multiline
            minRows={2}
            label="Fitness goals"
            placeholder="e.g. Run a 10k, build a daily stretch habit…"
          />
        )}
      />

      {/* wake / sleep times */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Controller
          control={control}
          name="wakeTime"
          render={({ field }) => (
            <TimePicker
              label="Wake time"
              value={field.value}
              onChange={field.onChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          )}
        />
        <Controller
          control={control}
          name="sleepTime"
          render={({ field }) => (
            <TimePicker
              label="Sleep time"
              value={field.value}
              onChange={field.onChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          )}
        />
      </Box>
    </Stack>
  );
}
