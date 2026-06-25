import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import Avatar from '../../components/avatar';
import Iconify from '../../components/iconify';
import { DEFAULT_AVATAR, MOCK_CONVERSATION, MOCK_CONVERSATIONS } from '../../_mock';
import { GRADIENTS, PALETTE } from '../../theme';
import type { ConversationEntry, ConversationSummary } from '../../types';

// ----------------------------------------------------------------------
// History has two views:
//   1. A list of conversation threads. Only the first (unlocked) thread is
//      tappable; the rest are visual placeholders.
//   2. The opened thread — the mock transcript rendered as a chat, with
//      day-divider chips and a disabled input bar pinned to the bottom.
// ----------------------------------------------------------------------

const MotionStack = motion.create(Stack);

export default function HistoryView() {
  const [openId, setOpenId] = useState<string | null>(null);
  const openConversation = openId
    ? MOCK_CONVERSATIONS.find((c) => c.id === openId) ?? null
    : null;

  if (openConversation) {
    return (
      <ConversationThread
        conversation={openConversation}
        onBack={() => setOpenId(null)}
      />
    );
  }

  return <ConversationList onOpen={setOpenId} />;
}

// ----------------------------------------------------------------------
// View 1 — conversation list
// ----------------------------------------------------------------------

function ConversationList({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <Stack sx={{ minHeight: '100%' }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        Conversation history
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Everything {DEFAULT_AVATAR.name} has shared with you.
      </Typography>

      <Stack spacing={1.25}>
        {MOCK_CONVERSATIONS.map((conversation, i) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            index={i}
            onOpen={onOpen}
          />
        ))}
      </Stack>
    </Stack>
  );
}

function ConversationRow({
  conversation,
  index,
  onOpen,
}: {
  conversation: ConversationSummary;
  index: number;
  onOpen: (id: string) => void;
}) {
  const { id, title, preview, timestamp, messageCount, icon, accent, locked } =
    conversation;

  return (
    <MotionStack
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.4) }}
    >
      <ButtonBase
        disabled={locked}
        onClick={() => onOpen(id)}
        aria-label={locked ? `${title} (locked)` : `Open ${title}`}
        sx={{
          width: '100%',
          textAlign: 'left',
          borderRadius: 3,
          p: 1.5,
          bgcolor: PALETTE.surface,
          border: `1px solid ${PALETTE.border}`,
          transition: 'transform 0.15s ease, background-color 0.15s ease',
          // locked rows read as inert placeholders; the live one invites a tap
          opacity: locked ? 0.55 : 1,
          ...(!locked && {
            '&:hover': { bgcolor: PALETTE.surfaceHi },
            '&:active': { transform: 'scale(0.99)' },
          }),
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', width: '100%' }}
        >
          <Box
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              bgcolor: alpha(accent, 0.16),
              color: accent,
            }}
          >
            <Iconify icon={icon} width={24} />
          </Box>

          <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0 }} noWrap>
                {title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', flexShrink: 0, fontSize: '0.7rem' }}
              >
                {relativeDay(timestamp)}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {preview}
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
              {messageCount} messages
            </Typography>
          </Stack>

          <Iconify
            icon={locked ? 'solar:lock-keyhole-minimalistic-bold' : 'solar:alt-arrow-right-linear'}
            width={18}
            sx={{ color: 'text.secondary', flexShrink: 0 }}
          />
        </Stack>
      </ButtonBase>
    </MotionStack>
  );
}

// ----------------------------------------------------------------------
// View 2 — opened thread
// ----------------------------------------------------------------------

type Row =
  | { kind: 'divider'; key: string; label: string }
  | { kind: 'message'; key: string; entry: ConversationEntry };

function buildRows(entries: ConversationEntry[]): Row[] {
  const rows: Row[] = [];
  let lastDay = '';

  // sort oldest → newest so the thread reads top-to-bottom chronologically
  const ordered = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  ordered.forEach((entry) => {
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

function ConversationThread({
  conversation,
  onBack,
}: {
  conversation: ConversationSummary;
  onBack: () => void;
}) {
  const rows = useMemo(() => buildRows(MOCK_CONVERSATION), []);

  return (
    <Stack sx={{ minHeight: '100%' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mb: 2 }}
      >
        <IconButton
          onClick={onBack}
          aria-label="Back to conversations"
          sx={{
            color: 'text.primary',
            bgcolor: alpha('#FFFFFF', 0.04),
            '&:hover': { bgcolor: alpha('#FFFFFF', 0.08) },
          }}
        >
          <Iconify icon="solar:alt-arrow-left-linear" width={20} />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
            {conversation.title}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {conversation.messageCount} messages
          </Typography>
        </Box>
      </Stack>

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

function dividerLabel(timestamp: number): string {
  const d = dayjs(timestamp);
  const today = dayjs();
  if (d.isSame(today, 'day')) return 'Today';
  if (d.isSame(today.subtract(1, 'day'), 'day')) return 'Yesterday';
  return d.format('dddd, D MMMM');
}

function relativeDay(timestamp: number): string {
  const d = dayjs(timestamp);
  const now = dayjs();
  if (d.isSame(now, 'day')) return d.format('HH:mm');
  if (d.isSame(now.subtract(1, 'day'), 'day')) return 'Yesterday';
  if (d.isAfter(now.subtract(7, 'day'))) return d.format('ddd');
  return d.format('D MMM');
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
          <Avatar size={28} appearanceId={DEFAULT_AVATAR.appearanceId} state="idle" />
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
        // Sticky pins to the scroll container's content box, which sits 24px
        // (its pb:3) above the true bottom. Offsetting bottom by that amount
        // pushes the bar flush to the bottom so no message strip peeks below it.
        bottom: '-24px',
        mt: 2,
        // Bleed to the frame edges and lay an opaque navy base (fading in at
        // the top) so scrolling messages slide *under* the bar instead of
        // peeking around or through it.
        mx: -2.5,
        px: 2.5,
        pt: 3,
        pb: 2.5,
        background: `linear-gradient(to top, ${PALETTE.navy} 0%, ${PALETTE.navy} 62%, ${alpha(
          PALETTE.navy,
          0
        )} 100%)`,
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
          // opaque pill — the messages must not show through it
          bgcolor: PALETTE.surface,
          border: `1px solid ${PALETTE.border}`,
        }}
      >
        {/* Controls are dimmed to read as disabled, but the pill itself stays
            opaque so nothing behind it bleeds through. */}
        <Typography
          variant="body2"
          sx={{ flex: 1, color: 'text.secondary', userSelect: 'none', opacity: 0.7 }}
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
            opacity: 0.7,
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
            opacity: 0.7,
          }}
        >
          <Iconify icon="solar:arrow-up-bold" width={20} />
        </Box>
      </Stack>
    </Box>
  );
}
