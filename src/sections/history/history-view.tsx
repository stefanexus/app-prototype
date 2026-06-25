import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

import AvatarOrb from '../../components/avatar-orb';
import Iconify from '../../components/iconify';
import { DEFAULT_AVATAR, MOCK_CONVERSATION } from '../../_mock';
import { GRADIENTS, PALETTE } from '../../theme';
import type { ConversationEntry } from '../../types';

// ----------------------------------------------------------------------
// Conversation history — renders the mock transcript as a chat thread,
// inserting day-divider chips between messages that fall on different days.
// Visual only: the input bar at the bottom is disabled.
// ----------------------------------------------------------------------

const MotionStack = motion.create(Stack);

type Row =
  | { kind: 'divider'; key: string; label: string }
  | { kind: 'message'; key: string; entry: ConversationEntry };

function buildRows(entries: ConversationEntry[]): Row[] {
  const rows: Row[] = [];
  let lastDay = '';

  entries.forEach((entry) => {
    const day = dayjs(entry.timestamp).format('YYYY-MM-DD');
    if (day !== lastDay) {
      lastDay = day;
      rows.push({
        kind: 'divider',
        key: `divider-${day}`,
        label: dividerLabel(entry.timestamp),
      });
    }
    rows.push({ kind: 'message', key: entry.id, entry });
  });

  return rows;
}

function dividerLabel(timestamp: number): string {
  const d = dayjs(timestamp);
  const today = dayjs();
  if (d.isSame(today, 'day')) return 'Today';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('dddd, D MMMM');
}

export default function HistoryView() {
  const rows = useMemo(() => buildRows(MOCK_CONVERSATION), []);

  return (
    <Stack sx={{ minHeight: '100%' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Conversation history
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Everything {DEFAULT_AVATAR.name} has shared with you.
      </Typography>

      <Stack spacing={1.5} sx={{ flex: 1 }}>
        {rows.map((row, i) =>
          row.kind === 'divider' ? (
            <DayDivider key={row.key} label={row.label} />
          ) : (
            <MessageBubble key={row.key} entry={row.entry} index={i} />
          )
        )}
      </Stack>

      <DisabledInputBar />
    </Stack>
  );
}

// ----------------------------------------------------------------------

function DayDivider({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
      <Box
        sx={{
          px: 1.75,
          py: 0.5,
          borderRadius: 999,
          bgcolor: alpha('#FFFFFF', 0.05),
          border: `1px solid ${PALETTE.border}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.02em' }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

function MessageBubble({ entry, index }: { entry: ConversationEntry; index: number }) {
  const isUser = entry.role === 'user';
  const time = dayjs(entry.timestamp).format('HH:mm');

  return (
    <MotionStack
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'flex-end',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!isUser && (
        <Box sx={{ flexShrink: 0, mb: 0.25 }}>
          <AvatarOrb size={28} appearanceId={DEFAULT_AVATAR.appearanceId} state="idle" />
        </Box>
      )}

      <Stack
        spacing={0.5}
        sx={{ maxWidth: '78%', alignItems: isUser ? 'flex-end' : 'flex-start' }}
      >
        <Box
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: 2.5,
            ...(isUser
              ? {
                  background: GRADIENTS.brand,
                  color: '#FFFFFF',
                  borderBottomRightRadius: 6,
                  boxShadow: `0 6px 18px ${alpha(PALETTE.violet, 0.35)}`,
                }
              : {
                  bgcolor: PALETTE.surfaceHi,
                  border: `1px solid ${PALETTE.border}`,
                  color: 'text.primary',
                  borderBottomLeftRadius: 6,
                }),
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
            {entry.content}
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', px: 0.75, fontSize: '0.7rem' }}
        >
          {time}
        </Typography>
      </Stack>
    </MotionStack>
  );
}

// ----------------------------------------------------------------------

function DisabledInputBar() {
  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        mt: 3,
        pt: 1.5,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: 'center',
          p: 0.75,
          pl: 2,
          borderRadius: 999,
          bgcolor: PALETTE.surface,
          border: `1px solid ${PALETTE.border}`,
          opacity: 0.65,
        }}
      >
        <Typography
          variant="body2"
          sx={{ flex: 1, color: 'text.secondary', userSelect: 'none' }}
        >
          Message {DEFAULT_AVATAR.name}…
        </Typography>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha('#FFFFFF', 0.06),
            color: 'text.secondary',
          }}
        >
          <Iconify icon="solar:microphone-3-bold-duotone" width={20} />
        </Box>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            background: GRADIENTS.brand,
            color: '#FFFFFF',
          }}
        >
          <Iconify icon="solar:arrow-up-bold" width={20} />
        </Box>
      </Stack>
    </Box>
  );
}
