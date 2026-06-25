import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';
import type { ReactNode } from 'react';

import Iconify from '../../components/iconify';
import { GRADIENTS, PALETTE } from '../../theme';

// ----------------------------------------------------------------------
// A themed profile section card: title + icon + a visual-only Edit pencil.
// ----------------------------------------------------------------------

type Props = {
  title: string;
  icon: string;
  children: ReactNode;
};

export default function ProfileSectionCard({ title, icon, children }: Props) {
  return (
    <Card sx={{ p: 2.25 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
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
            {title}
          </Typography>
        </Stack>

        <IconButton
          size="small"
          aria-label={`Edit ${title}`}
          onClick={() => toast('Editing coming soon')}
          sx={{
            color: 'text.secondary',
            bgcolor: alpha('#FFFFFF', 0.04),
            '&:hover': { color: 'text.primary', bgcolor: alpha('#FFFFFF', 0.08) },
          }}
        >
          <Iconify icon="solar:pen-bold-duotone" width={18} />
        </IconButton>
      </Stack>

      <Stack divider={<Box sx={{ borderTop: `1px solid ${PALETTE.border}` }} />}>
        {children}
      </Stack>
    </Card>
  );
}
