import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router';

import { NAV_TABS } from '../routes/paths';
import Iconify from './iconify';

// ----------------------------------------------------------------------
// Thumb-reachable bottom tab bar: Home · History · Profile · Settings.
// ----------------------------------------------------------------------

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const current = NAV_TABS.find((t) => pathname.startsWith(t.value))?.value ?? false;

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        bgcolor: (t) => alpha(t.palette.background.default, 0.85),
        backdropFilter: 'blur(16px)',
      }}
    >
      <BottomNavigation
        value={current}
        onChange={(_, value) => navigate(value)}
        sx={{
          bgcolor: 'transparent',
          height: 68,
          '& .MuiBottomNavigationAction-root': { color: 'text.secondary', minWidth: 0 },
          '& .Mui-selected': { color: 'primary.light' },
          '& .MuiBottomNavigationAction-label': { fontSize: 11, mt: 0.5 },
        }}
      >
        {NAV_TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={<Iconify icon={tab.icon} width={24} />}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
