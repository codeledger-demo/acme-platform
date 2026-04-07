/** Base spacing unit in pixels. */
const BASE = 4;

/** Spacing scale (0-12) mapped to pixel values. */
export const scale = {
  0: '0px',
  1: `${BASE}px`,
  2: `${BASE * 2}px`,
  3: `${BASE * 3}px`,
  4: `${BASE * 4}px`,
  5: `${BASE * 5}px`,
  6: `${BASE * 6}px`,
  8: `${BASE * 8}px`,
  10: `${BASE * 10}px`,
  12: `${BASE * 12}px`,
} as const;

export type SpacingKey = keyof typeof scale;

/** Shorthand gap helper. */
export function gap(size: SpacingKey): string {
  return scale[size];
}

/** Shorthand padding helper — uniform or axis-specific. */
export function padding(y: SpacingKey, x?: SpacingKey): string {
  return x !== undefined ? `${scale[y]} ${scale[x]}` : scale[y];
}

/** Shorthand margin helper — uniform or axis-specific. */
export function margin(y: SpacingKey, x?: SpacingKey): string {
  return x !== undefined ? `${scale[y]} ${scale[x]}` : scale[y];
}

export const spacing = { scale, gap, padding, margin } as const;
