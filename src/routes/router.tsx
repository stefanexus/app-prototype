import { createBrowserRouter, Navigate } from 'react-router';

import AppLayout from '../layouts/app-layout';
import WelcomePage from '../pages/welcome';
import OnboardingPage from '../pages/onboarding';
import HomePage from '../pages/home';
import HistoryPage from '../pages/history';
import ProfilePage from '../pages/profile';
import SettingsPage from '../pages/settings';
import { paths } from './paths';

export const router = createBrowserRouter([
  { path: paths.welcome, element: <WelcomePage /> },
  { path: paths.onboarding, element: <OnboardingPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.history, element: <HistoryPage /> },
      { path: paths.profile, element: <ProfilePage /> },
      { path: paths.settings, element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to={paths.welcome} replace /> },
]);
