/**
 * Minimal JSX namespace for the custom h/Fragment factory used in og.tsx.
 * This lets tsc compile the JSX without requiring React types.
 * Satori (@vercel/og) accepts any { type, props, children } node tree.
 */
declare namespace JSX {
  type Element = { type: string; props: Record<string, unknown>; key: string | null };
  interface IntrinsicElements {
    [elemName: string]: Record<string, unknown>;
  }
}
