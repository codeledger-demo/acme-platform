/** Font family stacks. */
export const fontFamily = {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  serif: "'Merriweather', Georgia, 'Times New Roman', serif",
} as const;

/** Font size scale. */
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const;

/** Font weight scale. */
export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Line height scale. */
export const lineHeight = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

/** Aggregated typography tokens. */
export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const;

export type Typography = typeof typography;
