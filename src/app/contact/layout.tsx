import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hubungi Kami - IndexOf.ID',
  description: 'Konsultasi gratis dengan tim ahli IndexOf.ID untuk maintenance WordPress, migrasi website, keamanan, dan setup VPS. Respon cepat via WhatsApp.',
  keywords: 'kontak indexof.id, konsultasi gratis, whatsapp support, jasa wordpress indonesia, maintenance website',
  openGraph: {
    title: 'Hubungi Kami - IndexOf.ID',
    description: 'Konsultasi gratis dengan tim ahli IndexOf.ID untuk maintenance WordPress, migrasi website, keamanan, dan setup VPS. Respon cepat via WhatsApp.',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 