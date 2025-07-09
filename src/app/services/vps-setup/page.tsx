import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// ISR configuration for service pages (static content, revalidate less frequently)
export const revalidate = 86400; // Revalidate every 24 hours

import { env } from '@/config/environment';

export const metadata: Metadata = {
  title: `Jasa Setup VPS WordPress | ${env.schema.business.name}`,
  description: 'Layanan konfigurasi VPS khusus WordPress. Optimalkan performa dan keamanan website dengan setup server yang tepat, cepat, dan aman.',
};

export default function VpsSetupPage() {
  return (
    <div className="relative bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-green-950 min-h-screen">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center bg-gray-50 dark:bg-neutral-900">
        <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6 leading-tight max-w-3xl mx-auto">
          Setup VPS Profesional &amp; Optimal
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
          Konfigurasi server VPS terbaik untuk website Anda. Performa maksimal, keamanan terjamin, dan support teknis siap membantu setiap saat.
        </p>
        <div className="w-full flex justify-center mb-8">
          {/* Simple VPS icon/illustration */}
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="80" height="30" rx="8" fill="#444" />
            <rect x="40" y="20" width="40" height="20" rx="6" fill="#888" />
            <circle cx="60" cy="45" r="6" fill="#fff" />
          </svg>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Optimasi Server',
              description: 'Setup server (LEMP/LAMP stack) yang dioptimalkan khusus untuk WordPress.',
              icon: '⚡'
            },
            {
              title: 'Keamanan Server',
              description: 'Konfigurasi firewall, anti-DDoS, dan hardening keamanan server tingkat tinggi.',
              icon: '🔒'
            },
            {
              title: 'Setup Cache',
              description: 'Konfigurasi Redis, Memcached, atau Varnish untuk performa maksimal.',
              icon: '🚀'
            },
            {
              title: 'Instalasi SSL Gratis',
              description: 'Pemasangan SSL/HTTPS Let\'s Encrypt dengan auto-renewal.',
              icon: '🔐'
            },
            {
              title: 'Optimasi Database',
              description: 'Tuning konfigurasi MariaDB/MySQL untuk performa terbaik.',
              icon: '📊'
            },
            {
              title: 'Setup Monitoring',
              description: 'Pemasangan sistem monitoring server dan notifikasi real-time.',
              icon: '📈'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-primary">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Server Stack */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <h2 className="text-3xl font-extrabold text-center mb-10 text-neutral-900 dark:text-white">
          Teknologi Server Terbaik
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Web Server',
              items: ['Nginx', 'Apache', 'OpenLiteSpeed'],
              icon: (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3v4M8 3v4" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Konfigurasi PHP',
              items: ['PHP-FPM', 'OPcache', 'Custom PHP.ini'],
              icon: (
                <span className="h-14 w-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Database',
              items: ['MariaDB', 'MySQL', 'Percona'],
              icon: (
                <span className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="7" rx="9" ry="3" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10c0 1.657 4.03 3 9 3s9-1.343 9-3V7" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Sistem Cache',
              items: ['Redis', 'Memcached', 'Varnish'],
              icon: (
                <span className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4l-2-2" />
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </svg>
                </span>
              )
            }
          ].map((stack, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border bg-white dark:bg-gray-900 shadow-sm flex flex-col items-center text-center"
            >
              {typeof stack.icon === 'string' ? (
                <div className="text-3xl mb-4">{stack.icon}</div>
              ) : (
                stack.icon
              )}
              <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">{stack.title}</h3>
              <ul className="space-y-3">
                {stack.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-2 justify-center">
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

      {/* Setup Process */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <h2 className="text-3xl font-extrabold text-center mb-12 text-neutral-900 dark:text-white">
          Tahapan Setup VPS
        </h2>
        <div className="space-y-8">
          {[
            {
              step: 1,
              title: 'Persiapan & Hardening',
              description: 'Konfigurasi awal, update OS, dan pengamanan dasar server.',
              icon: (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
              )
            },
            {
              step: 2,
              title: 'Instalasi Web Stack',
              description: 'Pemasangan web server (Nginx/OLS), PHP-FPM, dan database (MariaDB).',
              icon: (
                <span className="h-14 w-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 3v4M8 3v4" />
                  </svg>
                </span>
              )
            },
            {
              step: 3,
              title: 'Optimasi WordPress',
              description: 'Setup Nginx FastCGI/LSCache, object cache (Redis), dan konfigurasi khusus.',
              icon: (
                <span className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4l-2-2" />
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </svg>
                </span>
              )
            },
            {
              step: 4,
              title: 'Finalisasi Keamanan',
              description: 'Penerapan firewall (UFW), Fail2ban, dan instalasi SSL gratis.',
              icon: (
                <span className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
              )
            },
            {
              step: 5,
              title: 'Setup Monitoring & Backup',
              description: 'Konfigurasi sistem monitoring (Netdata) dan backup otomatis ke cloud.',
              icon: (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                  </svg>
                </span>
              )
            }
          ].map((step, index) => (
            <div 
              key={index}
              className="flex items-start space-x-6 p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border"
            >
              {typeof step.icon === 'string' ? (
                <div className="text-2xl flex-shrink-0">{step.icon}</div>
              ) : (
                step.icon
              )}
              <div>
                <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-3xl mb-20">
        <div className="text-center bg-primary/5 rounded-2xl p-8 md:p-12 shadow">
          <h2 className="text-3xl font-extrabold mb-4 text-neutral-900 dark:text-white">
            Siap Setup VPS WordPress?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Dapatkan performa terbaik untuk website WordPress Anda. Konsultasikan kebutuhan server Anda dengan tim ahli kami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Konsultasi Gratis
            </Link>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'your-number'}`} 
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