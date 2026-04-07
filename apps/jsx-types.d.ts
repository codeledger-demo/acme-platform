/**
 * Minimal JSX type declarations for the acme-platform demo apps.
 * These allow .tsx files to compile without installing @types/react.
 */
declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
