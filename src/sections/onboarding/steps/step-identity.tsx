import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';

import type { OnboardingFormValues } from '../form-schema';

// ----------------------------------------------------------------------

export default function StepIdentity() {
  const { control } = useFormContext<OnboardingFormValues>();

  return (
    <Stack spacing={2.5}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            label="Your name"
            placeholder="e.g. Alex"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="age"
        render={({ field }) => (
          <TextField
            value={field.value}
            onChange={(e) => {
              const v = e.target.value;
              field.onChange(v === '' ? '' : Number(v));
            }}
            onBlur={field.onBlur}
            name={field.name}
            inputRef={field.ref}
            fullWidth
            type="number"
            label="Age"
            placeholder="e.g. 29"
            slotProps={{ htmlInput: { min: 0, max: 120 } }}
          />
        )}
      />
    </Stack>
  );
}
