import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/context/ThemeContext';
import { SessionProvider } from '@/context/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CalOohPay Web - On-Call Payment Calculator',
  description:
    'Automate out-of-hours on-call compensation calculation for engineering teams using PagerDuty schedules',
  keywords: ['PagerDuty', 'on-call', 'compensation', 'payment calculator', 'engineering'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
