// Centralised route paths for the prototype.
export const paths = {
  welcome: '/',
  onboarding: '/onboarding',
  home: '/home',
  history: '/history',
  profile: '/profile',
  settings: '/settings',
} as const;

// Tabs shown in the bottom navigation shell.
export const NAV_TABS = [
  { value: paths.home, label: 'Home', icon: 'solar:home-angle-2-bold-duotone' },
  { value: paths.history, label: 'History', icon: 'solar:chat-round-line-bold-duotone' },
  { value: paths.profile, label: 'Profile', icon: 'solar:user-rounded-bold-duotone' },
  { value: paths.settings, label: 'Settings', icon: 'solar:settings-bold-duotone' },
] as const;
