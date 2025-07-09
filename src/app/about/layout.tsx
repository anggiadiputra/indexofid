import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tentang Kami - IndexOf.ID',
  description: 'Kenali tim profesional IndexOf.ID yang berpengalaman dalam maintenance WordPress, migrasi website, keamanan, dan setup VPS di Indonesia.',
  keywords: 'tentang indexof.id, tim profesional, maintenance wordpress indonesia, jasa website, teknologi indonesia',
  openGraph: {
    title: 'Tentang Kami - IndexOf.ID',
    description: 'Kenali tim profesional IndexOf.ID yang berpengalaman dalam maintenance WordPress, migrasi website, keamanan, dan setup VPS di Indonesia.',
    type: 'website',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 