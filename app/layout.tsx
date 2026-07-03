import './globals.css';

export const metadata = {
  title: 'Giuseppe OS',
  description: 'Personal operating system'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
