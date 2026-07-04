import { Libre_Baskerville } from 'next/font/google';
import { AppProviders } from './components/AppProviders';
import './globals.css';

const serif = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif'
});

export const metadata = {
  title: 'Giuseppe OS',
  description: 'Personal operating system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={serif.variable} suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
