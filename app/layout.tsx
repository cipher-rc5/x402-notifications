import { Analytics } from '@vercel/analytics/next';
import { type Metadata } from 'next';
import type React from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono } from 'next/font/google';
import Navigation from './navigation';

// Initialize fonts
const geistSans = V0_Font_Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });

const geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'x402 Notification System',
  description: 'Next-gen notifications with blockchain payments and MCP integration',
  generator: 'cipher',
  icons: {
    icon: [{ url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' }, {
      url: '/icon-dark-32x32.png',
      media: '(prefers-color-scheme: dark)'
    }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
          <Navigation />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
