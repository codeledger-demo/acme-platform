/**
 * Landing page -- immediately redirects to the dashboard.
 * In a real Next.js app this would use `redirect()` from `next/navigation`.
 */
export default function HomePage(): JSX.Element {
  return (
    <meta httpEquiv="refresh" content="0;url=/dashboard" />
  );
}
