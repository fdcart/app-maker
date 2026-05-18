import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EasyCodex',
  description: 'Lovable-style visual app builder for Codex-ready React projects.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
