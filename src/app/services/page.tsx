import type { Metadata } from 'next';
import Link from 'next/link';

// ISR configuration for services page (static content, revalidate less frequently)
export const revalidate = 86400; // Revalidate every 24 hours

<<<<<<< HEAD
import { env } from '@/config/environment';

=======
>>>>>>> 0ca9e724a4c4d34bd67c432b1b1a47d26e0fe278
export const metadata: Metadata = {
  title: `Layanan WordPress Profesional | ${env.schema.organization.name}`,
  description: 'Solusi lengkap untuk website WordPress Anda: Jasa Migrasi, Pembersihan Malware, Setup VPS, dan Pengelolaan VPS dengan dukungan teknis profesional.',
};

export default function ServicesPage() {
  const services = [
    {
      title: 'Jasa Migrasi WordPress',
      description: 'Layanan pemindahan website WordPress yang aman dan profesional. Kami jamin tidak ada data yang hilang dan peringkat SEO tetap terjaga.',
      icon: '🚀',
      href: '/services/wordpress-migration'
    },
    {
      title: 'Pembersihan Malware WordPress',
      description: 'Layanan pembersihan malware dan virus dari website WordPress Anda. Pulihkan keamanan website dan hindari blacklist Google.',
      icon: '🛡️',
      href: '/services/malware-removal'
    },
    {
      title: 'Jasa Setup VPS WordPress',
      description: 'Layanan konfigurasi VPS khusus WordPress. Optimalkan performa website dengan setup server yang tepat dan aman.',
      icon: '⚙️',
      href: '/services/vps-setup'
    },
    {
      title: 'Pengelolaan VPS WordPress',
      description: 'Layanan pengelolaan VPS WordPress dengan dukungan teknis 24 jam. Fokus pada bisnis, biarkan kami yang urus servernya.',
      icon: '🔧',
      href: '/services/managed-vps'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Solusi WordPress Terpercaya
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Percayakan website WordPress Anda kepada ahlinya. Kami menyediakan layanan lengkap 
          untuk memastikan website Anda berjalan optimal dan aman.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {services.map((service, index) => (
          <Link 
            key={index}
            href={service.href}
            className="group p-6 rounded-lg border bg-card hover:shadow-lg transition-all hover:border-primary"
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <div>
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h2>
                <p className="text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Why Choose Us */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
                      Kenapa Harus {env.schema.organization.name}?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Ahli WordPress Berpengalaman',
              description: 'Tim teknisi berpengalaman yang telah menangani ratusan website WordPress.',
              icon: '👨‍💻'
            },
            {
              title: 'Dukungan 24 Jam',
              description: 'Bantuan teknis tersedia 24 jam untuk menangani masalah website Anda.',
              icon: '⏰'
            },
            {
              title: 'Solusi Sesuai Kebutuhan',
              description: 'Layanan yang disesuaikan dengan kebutuhan dan anggaran Anda.',
              icon: '🎯'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border bg-card text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-primary/5 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold mb-4">
          Butuh Bantuan?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Konsultasikan masalah website WordPress Anda dengan tim ahli kami. 
          Dapatkan solusi terbaik sesuai kebutuhan Anda.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Konsultasi Gratis
          </Link>
          <a 
                          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'your-number'}`} 
            target="_blank"
            rel="noopener noreferrer" 
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-8 py-3 text-lg font-medium text-white shadow transition-colors hover:bg-green-700"
          >
            Chat WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
} 