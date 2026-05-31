import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from '@/components/Providers';
import type { Viewport } from 'next';

export const metadata: Metadata = {
  title: 'VYBI — View Your Biome Intelligence',
  description: 'Know your body. Before it speaks.',
  manifest: '/manifest.json',
  applicationName: 'VYBI',
  appleWebApp: {
    capable: true,
    title: 'VYBI',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#1a0a2e',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
