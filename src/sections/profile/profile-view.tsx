import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import Avatar from '../../components/avatar';
import {
  ACTIVITY_LEVELS,
  DEFAULT_AVATAR,
  SAMPLE_PROFILE,
  STRESS_LEVELS,
} from '../../_mock';
import { PALETTE } from '../../theme';
import ProfileSectionCard from './profile-section-card';

// ----------------------------------------------------------------------
// Your profile — read-only view of SAMPLE_PROFILE, grouped into themed
// cards. Editing is visual only (handled inside ProfileSectionCard).
// ----------------------------------------------------------------------

const MotionBox = motion.create(Box);

const activityLabel = (value: string) =>
  ACTIVITY_LEVELS.find((a) => a.value === value)?.label ?? value;

const stressLabel = (value: string) =>
  STRESS_LEVELS.find((s) => s.value === value)?.label ?? value;

export default function ProfileView() {
  const { identity, health, work } = SAMPLE_PROFILE;

  const sections = [
    {
      title: 'Identity',
      icon: 'solar:user-circle-bold-duotone',
      rows: (
        <>
          <Row label="Name" value={identity.name} />
          <Row label="Age" value={String(identity.age)} />
          <Row label="Location" value={identity.location} />
          <Row label="Timezone" value={identity.timezone} />
        </>
      ),
    },
    {
      title: 'Health & lifestyle',
      icon: 'solar:heart-pulse-bold-duotone',
      rows: (
        <>
          <Row label="Activity level" value={activityLabel(health.activityLevel)} />
          <Row
            label="Dietary"
            value={<ChipRow items={health.dietaryRestrictions} />}
          />
          <Row label="Fitness goals" value={health.fitnessGoals} />
          <Row label="Wake / sleep" value={`${health.wakeTime} – ${health.sleepTime}`} />
        </>
      ),
    },
    {
      title: 'Work & hobbies',
      icon: 'solar:case-round-bold-duotone',
      rows: (
        <>
          <Row label="Job" value={work.jobType} />
          <Row label="Working hours" value={work.workingHours} />
          <Row label="Stress level" value={stressLabel(work.stressLevel)} />
          <Row label="Hobbies" value={<ChipRow items={work.hobbyTags} />} />
          <Row label="Subscriptions" value={<ChipRow items={work.subscriptionTags} />} />
        </>
      ),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', pt: 1 }}>
        <Avatar size={56} appearanceId={DEFAULT_AVATAR.appearanceId} state="idle" />
        <Stack spacing={0.25}>
          <Typography variant="h5">{DEFAULT_AVATAR.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Your profile
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {sections.map((section, i) => (
          <MotionBox
            key={section.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <ProfileSectionCard title={section.title} icon={section.icon}>
              {section.rows}
            </ProfileSectionCard>
          </MotionBox>
        ))}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: 'flex-start', justifyContent: 'space-between', py: 1.25 }}
    >
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', flexShrink: 0, pt: 0.25 }}
      >
        {label}
      </Typography>
      <Box sx={{ textAlign: 'right' }}>
        {typeof value === 'string' ? (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

function ChipRow({ items }: { items: string[] }) {
  return (
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      sx={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}
    >
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          size="small"
          sx={{
            bgcolor: alpha(PALETTE.violet, 0.16),
            color: PALETTE.violetLight,
            border: `1px solid ${alpha(PALETTE.violet, 0.3)}`,
          }}
        />
      ))}
    </Stack>
  );
}
