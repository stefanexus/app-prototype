import Box from '@mui/material/Box';
import { GRADIENTS, PALETTE } from '../theme';
import type { ReactNode } from 'react';

// ----------------------------------------------------------------------
// Mobile-first frame. Centres a max-width 430px column on larger screens
// and applies the dark navy → violet radial backdrop from the PRD.
//   - The frame is locked to exactly the viewport height (100dvh) so the
//     app never grows taller than the phone — only the inner content area
//     scrolls. This keeps the bottom navigation permanently pinned.
//   - children scroll inside the frame; the nav (if any) stays pinned.
// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
  /** Sticky bottom navigation element (rendered below the scroll area). */
  nav?: ReactNode;
  /** Remove default content padding (e.g. for full-bleed screens). */
  disablePadding?: boolean;
};

export default function MobileShell({ children, nav, disablePadding }: Props) {
  return (
    <Box
      sx={{
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: PALETTE.navy,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 430,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: GRADIENTS.screen,
          boxShadow: { sm: '0 0 60px rgba(0,0,0,0.5)' },
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            // minHeight:0 lets this flex child shrink below its content size so
            // overflowY actually scrolls here instead of stretching the frame.
            minHeight: 0,
            overflowY: 'auto',
            px: disablePadding ? 0 : 2.5,
            pt: disablePadding ? 0 : 'max(20px, env(safe-area-inset-top))',
            pb: disablePadding ? 0 : 3,
          }}
        >
          {children}
        </Box>
        {nav}
      </Box>
    </Box>
  );
}
