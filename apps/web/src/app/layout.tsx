import type { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: 'Acme Platform',
  description: 'B2B SaaS platform for enterprise teams',
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 text-neutral-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
