import { createTheme, type Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------
// Design tokens — derived from the PRD visual direction:
//   deep navy background #0D0F1A, electric violet accent #7C3AED,
//   gradient dark-to-color aesthetic, mobile-first.
// ----------------------------------------------------------------------

export const PALETTE = {
  navy: '#0D0F1A',
  surface: '#14182A',
  surfaceHi: '#1B2138',
  violet: '#7C3AED',
  violetLight: '#A78BFA',
  violetDark: '#5B21B6',
  cyan: '#22D3EE',
  pink: '#EC4899',
  text: '#F3F4F8',
  textSecondary: '#9AA0B5',
  border: 'rgba(255,255,255,0.08)',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
};

// A reusable brand gradient used across orb, CTAs and accents.
export const GRADIENTS = {
  brand: `linear-gradient(135deg, ${PALETTE.violet} 0%, ${PALETTE.pink} 100%)`,
  brandSoft: `linear-gradient(135deg, ${alpha(PALETTE.violet, 0.16)} 0%, ${alpha(
    PALETTE.pink,
    0.16
  )} 100%)`,
  orb: `radial-gradient(circle at 30% 30%, ${PALETTE.violetLight} 0%, ${PALETTE.violet} 45%, ${PALETTE.violetDark} 100%)`,
  screen: `radial-gradient(120% 80% at 50% -10%, ${alpha(
    PALETTE.violet,
    0.22
  )} 0%, ${PALETTE.navy} 55%)`,
};

export function createAppTheme(): Theme {
  return createTheme({
    cssVariables: true,
    palette: {
      mode: 'dark',
      primary: {
        main: PALETTE.violet,
        light: PALETTE.violetLight,
        dark: PALETTE.violetDark,
        contrastText: '#FFFFFF',
      },
      secondary: { main: PALETTE.cyan, contrastText: '#04121A' },
      background: { default: PALETTE.navy, paper: PALETTE.surface },
      text: { primary: PALETTE.text, secondary: PALETTE.textSecondary },
      divider: PALETTE.border,
      success: { main: PALETTE.success },
      warning: { main: PALETTE.warning },
      error: { main: PALETTE.error },
    },
    shape: { borderRadius: 14 },
    typography: {
      fontFamily: '"Inter Variable", system-ui, -apple-system, sans-serif',
      h1: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 700 },
      h6: { fontFamily: '"DM Sans Variable", sans-serif', fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: PALETTE.navy,
            // tiny scrollbar for the desktop preview frame
            '&::-webkit-scrollbar': { width: 6, height: 6 },
            '&::-webkit-scrollbar-thumb': {
              background: alpha('#FFFFFF', 0.12),
              borderRadius: 8,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 22, paddingBlock: 10 },
          sizeLarge: { paddingBlock: 13, fontSize: '1rem' },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: GRADIENTS.brand,
              boxShadow: `0 8px 24px ${alpha(PALETTE.violet, 0.4)}`,
              '&:hover': { background: GRADIENTS.brand, filter: 'brightness(1.06)' },
            },
          },
        ],
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: PALETTE.border },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundColor: PALETTE.surface,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: 18,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: alpha('#FFFFFF', 0.03),
            '& .MuiOutlinedInput-notchedOutline': { borderColor: PALETTE.border },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            borderColor: PALETTE.border,
            textTransform: 'none',
            color: PALETTE.textSecondary,
            '&.Mui-selected': {
              color: '#FFFFFF',
              background: GRADIENTS.brandSoft,
              borderColor: alpha(PALETTE.violet, 0.6),
              '&:hover': { background: GRADIENTS.brandSoft },
            },
          },
        },
      },
    },
  });
}
