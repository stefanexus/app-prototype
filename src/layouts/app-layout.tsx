import { Outlet } from 'react-router';

import BottomNav from '../components/bottom-nav';
import MobileShell from '../components/mobile-shell';

// ----------------------------------------------------------------------
// Layout for the four main tabs. Wraps the routed page in the mobile
// frame and pins the bottom navigation. Tab pages render content only —
// they must NOT add their own MobileShell.
// ----------------------------------------------------------------------

export default function AppLayout() {
  return (
    <MobileShell nav={<BottomNav />}>
      <Outlet />
    </MobileShell>
  );
}
