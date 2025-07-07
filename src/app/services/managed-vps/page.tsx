import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// ISR configuration for service pages (static content, revalidate less frequently)
export const revalidate = 86400; // Revalidate every 24 hours

export const metadata: Metadata = {
  title: 'Jasa Kelola (Manage) VPS WordPress | JasaKami.ID',
  description: 'Layanan pengelolaan VPS WordPress profesional. Fokus pada bisnis Anda, biarkan kami yang mengelola server, keamanan, dan performa.',
};

export default function ManagedVpsPage() {
  return (
    <div className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-purple-950 min-h-screen">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center bg-gray-50 dark:bg-neutral-900">
        <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6 leading-tight max-w-3xl mx-auto">
          Kelola VPS Tanpa Khawatir, Fokus pada Bisnis Anda
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
          Layanan manajemen VPS 24/7: monitoring, update, backup, dan keamanan server. Tim ahli siap menjaga server Anda tetap optimal setiap saat.
        </p>
        <div className="w-full flex justify-center mb-8">
          {/* Simple managed VPS icon/illustration */}
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="60" height="30" rx="8" fill="#444" />
            <rect x="50" y="20" width="20" height="20" rx="6" fill="#888" />
            <rect x="40" y="50" width="40" height="10" rx="4" fill="#888" />
            <circle cx="60" cy="45" r="6" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Monitoring 24 Jam',
              description: 'Pemantauan server real-time dengan penanganan masalah proaktif.',
              icon: '👀'
            },
            {
              title: 'Optimasi Performa',
              description: 'Peningkatan performa server berkala untuk kecepatan website maksimal.',
              icon: '⚡'
            },
            {
              title: 'Pengelolaan Keamanan',
              description: 'Manajemen firewall, update patch keamanan, dan scan malware rutin.',
              icon: '🔒'
            },
            {
              title: 'Manajemen Backup',
              description: 'Backup otomatis harian/mingguan dan sistem pemulihan data yang cepat.',
              icon: '💾'
            },
            {
              title: 'Update Berkala',
              description: 'Pembaruan OS, panel, dan software server secara teratur dan aman.',
              icon: '🔄'
            },
            {
              title: 'Bantuan Teknis Prioritas',
              description: 'Dukungan teknis prioritas 24/7 via tiket, email, dan WhatsApp.',
              icon: '🎯'
            }
          ].map((service, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-primary">{service.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Management Features */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-neutral-900 dark:text-white">
          Fitur Pengelolaan Server
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Monitoring Proaktif',
              items: [
                'Pemantauan Resource Server',
                'Pengecekan Status Layanan',
                'Metrik Performa',
                'Notifikasi Alert 24/7'
              ]
            },
            {
              title: 'Manajemen Keamanan',
              items: [
                'Konfigurasi Firewall',
                'Update Patch Keamanan',
                'Pemindaian Malware Rutin',
                'Proteksi DDoS & Brute Force'
              ]
            },
            {
              title: 'Sistem Backup Terkelola',
              items: [
                'Backup Harian Otomatis',
                'Penyimpanan Backup Terpisah',
                'Pemulihan Cepat',
                'Recovery Point Fleksibel'
              ]
            },
            {
              title: 'Manajemen Performa',
              items: [
                'Load Balancing',
                'Optimasi Cache (Redis/Varnish)',
                'Tuning Database (MariaDB/MySQL)',
                'Skalabilitas Resource'
              ]
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm"
            >
              <h3 className="text-xl font-bold mb-4 text-primary">{feature.title}</h3>
              <ul className="space-y-3">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Service Levels */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-neutral-900 dark:text-white">
          Paket Layanan
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Paket Dasar',
              features: [
                'Monitoring Server',
                'Keamanan Dasar',
                'Backup Mingguan',
                'Email Support',
                'Laporan Bulanan'
              ],
              isPopular: false
            },
            {
              title: 'Paket Bisnis',
              features: [
                'Monitoring 24 Jam',
                'Keamanan Lanjutan',
                'Backup Harian',
                'Prioritas Support',
                'Laporan Mingguan',
                'Optimasi Performa',
                'Setup CDN'
              ],
              isPopular: true
            },
            {
              title: 'Paket Enterprise',
              features: [
                'Monitoring Kustom',
                'Keamanan Enterprise',
                'Backup Real-time',
                'Dedicated Support',
                'Laporan Kustom',
                'Load Balancing',
                'High Availability'
              ],
              isPopular: false
            }
          ].map((package_, index) => (
            <div 
              key={index}
              className={`
                relative p-6 rounded-2xl border bg-white dark:bg-gray-900 
                ${package_.isPopular ? 'border-primary shadow-xl scale-105' : 'shadow-lg'}
              `}
            >
              {package_.isPopular && (
                <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                  Terpopuler
                </div>
              )}
              <h3 className="text-2xl font-bold mb-4">{package_.title}</h3>
              <ul className="space-y-3 mb-8">
                {package_.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link 
                href="/contact" 
                className={`
                  inline-flex w-full items-center justify-center rounded-lg px-6 py-3 text-base font-semibold shadow transition-colors
                  ${package_.isPopular 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                  }
                `}
              >
                Pilih Paket
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-3xl mb-20">
        <div className="text-center bg-primary/5 rounded-2xl p-8 md:p-12 shadow">
          <h2 className="text-3xl font-extrabold mb-4 text-neutral-900 dark:text-white">
            Ingin Server Dikelola Profesional?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Serahkan pengelolaan server kepada ahlinya. Konsultasikan kebutuhan server Anda dengan tim kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Konsultasi Gratis
            </Link>
            <a 
              href="https://wa.me/your-number" 
              target="_blank"
              rel="noopener noreferrer" 
              className="inline-flex items-center justify-center rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white shadow transition-colors hover:bg-green-700"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
} 