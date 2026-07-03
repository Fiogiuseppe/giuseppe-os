import { Syne, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display'
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono'
});

export const metadata = {
  title: 'Giuseppe OS',
  description: 'Personal operating system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
