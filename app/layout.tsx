import type { Metadata, Viewport } from 'next';
import '@fontsource/press-start-2p/latin-400.css';
import '@fontsource/vt323/latin-400.css';
import './globals.css';
import { Providers } from '@/components/providers';
export const metadata: Metadata = {
  title: { default: 'RIVAL — Your daily habit race', template: '%s · RIVAL' },
  description: 'Build meaningful habits. Outwork your pixel rival. Every day is a new match.',
  applicationName: 'RIVAL',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/assets/icon.svg' },
  appleWebApp: { capable: true, title: 'RIVAL', statusBarStyle: 'default' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F2EA' },
    { media: '(prefers-color-scheme: dark)', color: '#14130E' },
  ],
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
