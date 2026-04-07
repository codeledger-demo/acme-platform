/** Breakpoint widths in pixels. */
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/** Generate a min-width media query string for the given breakpoint. */
export function mediaUp(bp: BreakpointKey): string {
  return `@media (min-width: ${breakpoints[bp]}px)`;
}

/** Generate a max-width media query string for the given breakpoint. */
export function mediaDown(bp: BreakpointKey): string {
  return `@media (max-width: ${breakpoints[bp] - 1}px)`;
}

/** Generate a range media query between two breakpoints (inclusive of min, exclusive of max). */
export function mediaBetween(min: BreakpointKey, max: BreakpointKey): string {
  return `@media (min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`;
}
