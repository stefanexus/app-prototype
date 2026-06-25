import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { alpha } from '@mui/material/styles';
import { Controller, useFormContext } from 'react-hook-form';

import { HOBBY_OPTIONS, STRESS_LEVELS, SUBSCRIPTION_OPTIONS } from '../../../_mock';
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

export default function StepWork() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <Stack spacing={3}>
      <Controller
        control={control}
        name="jobType"
        render={({ field }) => (
          <TextField {...field} fullWidth label="Job type" placeholder="e.g. Software engineer" />
        )}
      />

      <Controller
        control={control}
        name="workingHours"
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label="Working hours"
            placeholder="e.g. 09:00 - 17:00"
          />
        )}
      />

      {/* stress level */}
      <Box>
        <SectionLabel>Typical stress level</SectionLabel>
        <Controller
          control={control}
          name="stressLevel"
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              value={field.value}
              onChange={(_, val) => val && field.onChange(val)}
              sx={{ flexWrap: 'wrap', gap: 1, '& .MuiToggleButtonGroup-grouped': { border: `1px solid ${PALETTE.border}`, borderRadius: '14px !important' } }}
            >
              {STRESS_LEVELS.map((opt) => (
                <ToggleButton key={opt.value} value={opt.value} sx={{ px: 2.5, py: 0.75 }}>
                  {opt.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        />
      </Box>

      {/* hobby tags */}
      <Box>
        <SectionLabel>Hobbies</SectionLabel>
        <Controller
          control={control}
          name="hobbyTags"
          render={({ field }) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {HOBBY_OPTIONS.map((opt) => {
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

      {/* subscription tags */}
      <Box>
        <SectionLabel>Subscriptions</SectionLabel>
        <Controller
          control={control}
          name="subscriptionTags"
          render={({ field }) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {SUBSCRIPTION_OPTIONS.map((opt) => {
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
    </Stack>
  );
}
