import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SplitSavvy | Simple Bill Tracking',
  description: 'Split bills and track payments with ease. Frictionless sharing for groups.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} antialiased`}>
      <body className="min-h-screen bg-background font-sans">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
