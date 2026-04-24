import './styles.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '$1 Roast — fast AI landing page audit',
  description: 'Pay $1 USDT TRC20 and get one brutally useful AI landing-page roast by email.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
