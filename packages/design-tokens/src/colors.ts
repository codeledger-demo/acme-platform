/** Brand color palette. */
export const brand = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#7C3AED',
  secondaryLight: '#A78BFA',
  secondaryDark: '#5B21B6',
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',
} as const;

/** Semantic feedback colors. */
export const semantic = {
  success: '#10B981',
  successLight: '#6EE7B7',
  successDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',
  info: '#3B82F6',
  infoLight: '#93C5FD',
  infoDark: '#2563EB',
} as const;

/** Neutral gray scale. */
export const neutral = {
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
} as const;

/** Surface / background colors. */
export const surface = {
  background: '#FFFFFF',
  backgroundAlt: '#FAFAFA',
  card: '#FFFFFF',
  cardHover: '#F9FAFB',
  elevated: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

/** Aggregated color tokens. */
export const colors = {
  brand,
  semantic,
  neutral,
  surface,
} as const;

export type Colors = typeof colors;
