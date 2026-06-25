import { motion } from 'framer-motion';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import Iconify from '../../components/iconify';
import { GRADIENTS, PALETTE } from '../../theme';
import type { ReplyExplanation, ReplyExplanationCard, ReplyPick } from '../../_mock';

// ----------------------------------------------------------------------
// Reply explanation cards. This replaces the old "Today at a glance" status
// tiles once the avatar has an answer, so the user can see why that answer was
// chosen and still scroll the whole stack above the fixed bottom navigation.
// ----------------------------------------------------------------------

type Props = {
  explanation?: ReplyExplanation | null;
};

const MotionBox = motion.create(Box);

function Badge({ card }: { card: ReplyExplanationCard }) {
  if (!card.badge) return null;

  const success = card.badgeTone === 'success';
  const danger = card.badgeTone === 'danger';
  const color = danger ? PALETTE.error : success ? PALETTE.success : PALETTE.warning;

  return (
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 999,
        bgcolor: alpha(color, danger ? 0.14 : 0.18),
        color,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {card.badge}
    </Box>
  );
}

function ExplanationCard({ card }: { card: ReplyExplanationCard }) {
  const progress = typeof card.progress === 'number' ? Math.min(100, Math.max(0, card.progress)) : null;

  return (
    <Card
      sx={{
        minHeight: 136,
        p: 1.5,
        borderRadius: 1,
        bgcolor: PALETTE.surfaceHi,
        border: `1px solid ${PALETTE.border}`,
        color: PALETTE.text,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.7,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
        <Iconify icon={card.icon} width={18} sx={{ color: PALETTE.violetLight }} />
        <Typography
          variant="caption"
          sx={{
            color: PALETTE.textSecondary,
            fontWeight: 800,
            lineHeight: 1.1,
            textTransform: 'uppercase',
            minWidth: 0,
          }}
        >
          {card.label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography
          variant="subtitle2"
          sx={{ color: PALETTE.text, fontWeight: 800, lineHeight: 1.12, minWidth: 0 }}
        >
          {card.title}
        </Typography>
        <Badge card={card} />
      </Box>

      {progress !== null && (
        <Box
          aria-hidden
          sx={{
            width: '100%',
            height: 7,
            borderRadius: 999,
            bgcolor: alpha('#FFFFFF', 0.08),
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 'inherit',
              bgcolor: PALETTE.error,
            }}
          />
        </Box>
      )}

      <Typography variant="body2" sx={{ color: PALETTE.textSecondary, lineHeight: 1.28 }}>
        {card.detail}
      </Typography>
    </Card>
  );
}

function PickCover({ pick }: { pick: ReplyPick }) {
  return (
    <Box
      sx={{
        width: 96,
        flexShrink: 0,
        aspectRatio: '0.72',
        borderRadius: 1,
        background: GRADIENTS.brand,
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.45,
        textAlign: 'center',
        px: 1,
      }}
    >
      <Iconify icon="solar:sun-2-bold-duotone" width={28} sx={{ color: PALETTE.warning }} />
      <Typography variant="caption" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
        {pick.coverTitle ?? pick.title}
      </Typography>
      <Typography variant="caption" sx={{ color: alpha('#FFFFFF', 0.66), fontSize: 11 }}>
        {pick.coverYear}
      </Typography>
    </Box>
  );
}

function TaskPickCard({ pick }: { pick: ReplyPick }) {
  return (
    <Card
      sx={{
        position: 'relative',
        p: 1.5,
        pb: 3.25,
        borderRadius: 1,
        bgcolor: PALETTE.surfaceHi,
        color: PALETTE.text,
        border: `2px solid ${PALETTE.error}`,
        overflow: 'visible',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          mb: 1.1,
          px: 1.25,
          py: 0.45,
          borderRadius: 999,
          bgcolor: alpha(PALETTE.error, 0.14),
          color: PALETTE.error,
          fontSize: 12,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {pick.eyebrow}
      </Box>

      <Typography variant="h6" sx={{ color: PALETTE.text, fontWeight: 900, lineHeight: 1.1 }}>
        {pick.title}
      </Typography>
      <Typography variant="body2" sx={{ color: PALETTE.textSecondary, lineHeight: 1.35, mt: 0.35 }}>
        {pick.meta}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: PALETTE.text, fontWeight: 600, lineHeight: 1.45, mt: 1.25 }}
      >
        {pick.description}
      </Typography>

      {pick.quote && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 1,
            bgcolor: alpha('#FFFFFF', 0.04),
            border: `1px solid ${alpha('#FFFFFF', 0.12)}`,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: PALETTE.text, fontWeight: 900, lineHeight: 1.15 }}>
            {pick.quote.sender}
          </Typography>
          <Typography variant="caption" sx={{ color: PALETTE.textSecondary, display: 'block', mt: 0.2 }}>
            {pick.quote.subject}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: PALETTE.text,
              lineHeight: 1.45,
              mt: 1,
              pl: 1.25,
              borderLeft: `2px solid ${alpha(PALETTE.textSecondary, 0.45)}`,
            }}
          >
            {pick.quote.body}
          </Typography>
        </Box>
      )}

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: -16,
          transform: 'translateX(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: PALETTE.surface,
          color: PALETTE.textSecondary,
          border: `1px solid ${PALETTE.border}`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
        }}
      >
        <Iconify icon="solar:alt-arrow-down-linear" width={22} />
      </Box>
    </Card>
  );
}

function PickCard({ pick }: { pick: ReplyPick }) {
  if (pick.variant === 'task') {
    return <TaskPickCard pick={pick} />;
  }

  return (
    <Card
      sx={{
        position: 'relative',
        p: 1.5,
        pb: 3.25,
        borderRadius: 1,
        bgcolor: PALETTE.surfaceHi,
        color: PALETTE.text,
        border: `2px solid ${PALETTE.violetLight}`,
        overflow: 'visible',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <PickCover pick={pick} />

        <Box sx={{ minWidth: 0, pt: 0.3 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              mb: 0.9,
              px: 1.25,
              py: 0.45,
              borderRadius: 999,
              bgcolor: alpha(PALETTE.violetLight, 0.18),
              color: PALETTE.violetLight,
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {pick.eyebrow}
          </Box>

          <Typography variant="h6" sx={{ color: PALETTE.text, fontWeight: 900, lineHeight: 1.1 }}>
            {pick.title}
          </Typography>
          <Typography variant="body2" sx={{ color: PALETTE.textSecondary, lineHeight: 1.35, mt: 0.25 }}>
            {pick.meta}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: PALETTE.text, fontWeight: 600, lineHeight: 1.45, mt: 1.25 }}
          >
            {pick.description}
          </Typography>
        </Box>
      </Box>

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          left: '50%',
          bottom: -16,
          transform: 'translateX(-50%)',
          width: 38,
          height: 38,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: PALETTE.surface,
          color: PALETTE.textSecondary,
          border: `1px solid ${PALETTE.border}`,
          boxShadow: '0 6px 16px rgba(0,0,0,0.16)',
        }}
      >
        <Iconify icon="solar:alt-arrow-down-linear" width={22} />
      </Box>
    </Card>
  );
}

export default function HomeGlance({ explanation }: Props) {
  if (!explanation) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.25,
        }}
      >
        {explanation.cards.map((card) => (
          <ExplanationCard key={card.id} card={card} />
        ))}
      </Box>

      <PickCard pick={explanation.pick} />
    </MotionBox>
  );
}
