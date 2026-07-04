import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Giuseppe OS',
  description: 'Your Operating Self.'
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
