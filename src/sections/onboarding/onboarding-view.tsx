import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';

import MobileShell from '../../components/mobile-shell';
import Iconify from '../../components/iconify';
import { updateAvatarConfig } from '../../hooks/use-avatar-config';
import { paths } from '../../routes/paths';
import { PALETTE, GRADIENTS } from '../../theme';
import {
  onboardingSchema,
  STEP_FIELDS,
  STEP_META,
  type OnboardingFormValues,
} from './form-schema';
import StepAvatar from './steps/step-avatar';
import StepIdentity from './steps/step-identity';
import StepHealth from './steps/step-health';
import StepWork from './steps/step-work';

// ----------------------------------------------------------------------

const TOTAL_STEPS = 4;

const defaultValues: OnboardingFormValues = {
  avatarName: '',
  gender: 'unspecified',
  appearanceId: 'nova',
  voiceId: 'samantha',
  personalityTone: 'friendly',
  name: '',
  age: '',
  activityLevel: 'moderate',
  dietaryRestrictions: [],
  fitnessGoals: '',
  wakeTime: null,
  sleepTime: null,
  jobType: '',
  workingHours: '',
  stressLevel: 'medium',
  hobbyTags: [],
  subscriptionTags: [],
};

const STEP_COMPONENTS = [StepAvatar, StepIdentity, StepHealth, StepWork];

export default function OnboardingView() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  // +1 forward, -1 back — drives the slide direction.
  const [direction, setDirection] = useState(1);

  const methods = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onChange',
    defaultValues,
  });

  const { trigger, getValues } = methods;
  const isLast = step === TOTAL_STEPS - 1;
  const avatarName = methods.watch('avatarName').trim();

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;

    if (isLast) {
      const values = getValues();
      updateAvatarConfig({
        name: values.avatarName.trim(),
        gender: values.gender,
        appearanceId: values.appearanceId,
        voiceId: values.voiceId,
        personalityTone: values.personalityTone,
      });
      navigate(paths.home);
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) {
      navigate(paths.welcome);
      return;
    }
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const StepComponent = STEP_COMPONENTS[step];
  const meta = STEP_META[step];
  const primaryLabel = isLast ? `Meet ${avatarName || 'your avatar'}` : 'Next';

  return (
    <MobileShell disablePadding>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: 2.5,
          pt: 'max(20px, env(safe-area-inset-top))',
        }}
      >
        {/* progress header */}
        <Box sx={{ flexShrink: 0, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  height: 5,
                  borderRadius: 999,
                  background: i <= step ? GRADIENTS.brand : alpha('#fff', 0.1),
                  transition: 'background 0.3s ease',
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ color: PALETTE.violetLight, fontWeight: 700, letterSpacing: '0.06em' }}>
            STEP {step + 1} OF {TOTAL_STEPS}
          </Typography>
          <Typography variant="h4" sx={{ color: PALETTE.text, mt: 0.5 }}>
            {meta.title}
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.textSecondary, mt: 0.25 }}>
            {meta.subtitle}
          </Typography>
        </Box>

        {/* animated step body */}
        <FormProvider {...methods}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              position: 'relative',
              // step content scrolls here when tall; x-slide stays clipped
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </Box>
        </FormProvider>

        {/* nav buttons — pinned flush to the bottom of the frame */}
        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            gap: 1.5,
            pt: 2,
            pb: 'max(16px, env(safe-area-inset-bottom))',
            background: `linear-gradient(to top, ${PALETTE.navy} 70%, transparent)`,
          }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={handleBack}
            startIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
            sx={{ color: PALETTE.text, borderColor: PALETTE.border, flexShrink: 0 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleNext}
            endIcon={!isLast && <Iconify icon="solar:arrow-right-linear" width={18} />}
            sx={{ flex: 1 }}
          >
            {primaryLabel}
          </Button>
        </Box>
      </Box>
    </MobileShell>
  );
}
