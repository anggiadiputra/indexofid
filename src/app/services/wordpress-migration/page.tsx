import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

// ISR configuration for service pages (static content, revalidate less frequently)
export const revalidate = 86400; // Revalidate every 24 hours

import { env } from '@/config/environment';

export const metadata: Metadata = {
  title: `Jasa Migrasi WordPress Profesional | ${env.schema.organization.name}`,
  description: 'Layanan migrasi website WordPress yang aman, cepat, dan terpercaya. Pindahkan website WordPress tanpa downtime, kehilangan data, dan penurunan peringkat SEO.',
};

export default function WordPressMigrationPage() {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 min-h-screen">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 text-center bg-gray-50 dark:bg-neutral-900">
        <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6 leading-tight max-w-3xl mx-auto">
          Migrasi WordPress Aman &amp; Tanpa Ribet
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
          Pindahkan website WordPress Anda ke hosting baru dengan proses cepat, data aman, dan tanpa downtime. Tim profesional siap membantu setiap langkah migrasi!
        </p>
        <div className="w-full flex justify-center mb-8">
          {/* Simple migration icon/illustration */}
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="30" width="40" height="30" rx="6" fill="#444" />
            <rect x="70" y="30" width="40" height="30" rx="6" fill="#888" />
            <path d="M50 45h20" stroke="#fff" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <defs>
              <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <polygon points="0 0, 6 3, 0 6" fill="#fff" />
              </marker>
            </defs>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-neutral-900 dark:text-white">
            Kenapa Memilih Jasa Migrasi Kami?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tim ahli kami menggabungkan teknologi terbaik dengan layanan personal untuk memastikan proses migrasi website Anda berjalan mulus tanpa kendala.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: 'Zero Downtime',
              description: 'Website tetap online 100% selama proses migrasi, tanpa gangguan bisnis atau traffic.',
              icon: (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Backup & Keamanan Data',
              description: 'Backup berlapis dengan enkripsi untuk keamanan data file, database, dan konfigurasi.',
              icon: (
                <span className="h-14 w-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Proteksi SEO',
              description: 'Jaminan peringkat SEO terjaga, semua URL dan struktur konten tetap sama.',
              icon: (
                <span className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5 5 5M12 6v12" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Optimasi Performa',
              description: 'Peningkatan kecepatan loading dengan optimasi database dan server.',
              icon: (
                <span className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4l-2-2" />
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Keamanan Premium',
              description: 'Setup keamanan lengkap dengan SSL, firewall, dan monitoring.',
              icon: (
                <span className="h-14 w-14 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
              )
            },
            {
              title: 'Support Profesional',
              description: 'Tim support dedicated siap membantu via chat, email, dan WhatsApp.',
              icon: (
                <span className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2v-8a2 2 0 012-2h2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h-6a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2V5a2 2 0 00-2-2z" />
                  </svg>
                </span>
              )
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-2xl border bg-white dark:bg-gray-900 hover:shadow-xl transition-shadow flex flex-col items-center text-center"
            >
              {typeof feature.icon === 'string' ? (
                <div className="text-4xl mb-4">{feature.icon}</div>
              ) : (
                feature.icon
              )}
              <h3 className="text-xl font-bold mb-2 text-primary">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-4 max-w-5xl mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-neutral-900 dark:text-white">
          Proses Migrasi Website
        </h2>
        <div className="space-y-8">
          {[
            {
              step: 1,
              title: 'Analisis Website & Server',
              description: 'Pemeriksaan menyeluruh kondisi website, plugin, tema, dan kebutuhan server tujuan.',
              icon: (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
              )
            },
            {
              step: 2,
              title: 'Backup & Persiapan',
              description: 'Backup lengkap file dan database, serta persiapan server tujuan dengan spesifikasi optimal.',
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
              title: 'Proses Migrasi Aman',
              description: 'Transfer data dan konten dengan metode yang aman untuk menjaga integritas website.',
              icon: (
                <span className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17.657V21a1 1 0 01-1 1H8a1 1 0 01-1-1v-3.343M7 7l5-5 5 5M12 2v13" />
                  </svg>
                </span>
              )
            },
            {
              step: 4,
              title: 'Pengujian & Optimasi',
              description: 'Pengujian menyeluruh dan optimasi performa website di server baru.',
              icon: (
                <span className="h-14 w-14 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
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
              <div className="flex-grow">
                <div className="flex items-center mb-2">
                  <div className="text-sm font-medium text-primary bg-primary/10 rounded-full px-3 py-1 mr-3">
                    Langkah {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 max-w-7xl mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-neutral-900 dark:text-white">
          Paket Migrasi WordPress
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: 'Basic',
              price: 'Rp 499K',
              description: 'Untuk website sederhana atau blog personal',
              features: [
                'Migrasi 1 Website',
                'Backup Lengkap',
                'SSL Gratis',
                'Optimasi Dasar',
                'Support 7 Hari',
                'Garansi 100%'
              ],
              isPopular: false
            },
            {
              name: 'Professional',
              price: 'Rp 999K',
              description: 'Untuk website bisnis dengan traffic tinggi',
              features: [
                'Migrasi 1 Website',
                'Backup Lengkap',
                'SSL Premium',
                'Optimasi Lanjutan',
                'CDN Setup',
                'Support 30 Hari',
                'Garansi 100%',
                'Konsultasi Teknis'
              ],
              isPopular: true
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              description: 'Solusi khusus untuk multiple website/toko online',
              features: [
                'Migrasi Multiple Site',
                'Backup Real-time',
                'SSL Wildcard',
                'Optimasi Premium',
                'CDN Premium',
                'Support 90 Hari',
                'Garansi 100%',
                'Konsultasi Prioritas'
              ],
              isPopular: false
            }
          ].map((plan, index) => (
            <div 
              key={index}
              className={`
                relative rounded-2xl p-8 bg-white dark:bg-gray-900 border flex flex-col items-center text-center
                ${plan.isPopular ? 'border-primary shadow-xl scale-105' : 'border-border shadow-lg'}
              `}
            >
              {plan.name === 'Basic' && (
                <span className="h-14 w-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                  </svg>
                </span>
              )}
              {plan.name === 'Professional' && (
                <span className="h-14 w-14 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 17l-5 3 1-5.27L3 10.91l5.38-.49L12 5.5l3.62 4.92 5.38.49-4 3.82 1 5.27z" />
                  </svg>
                </span>
              )}
              {plan.name === 'Enterprise' && (
                <span className="h-14 w-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4l2.09 6.26L20 10.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 13.91l-5-3.64 5.91-.01z" />
                  </svg>
                </span>
              )}
              <div className="text-2xl font-bold mb-2">{plan.name}</div>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== 'Custom' && <span className="text-muted-foreground ml-2">/website</span>}
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  ${plan.isPopular 
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

      {/* FAQ Section */}
      <section className="container mx-auto px-4 max-w-7xl mb-20">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-neutral-900 dark:text-white">
          Pertanyaan Umum
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              question: 'Berapa lama proses migrasi WordPress?',
              answer: 'Waktu migrasi bervariasi tergantung ukuran website, biasanya antara 2-24 jam. Kami selalu mengutamakan keamanan dan ketelitian dalam proses migrasi.'
            },
            {
              question: 'Apakah website akan down saat migrasi?',
              answer: 'Tidak, kami menggunakan metode migrasi tanpa downtime. Website Anda akan tetap online selama proses migrasi berlangsung.'
            },
            {
              question: 'Bagaimana dengan SEO website?',
              answer: 'Kami menjamin tidak ada dampak negatif terhadap SEO. Semua URL, meta tag, dan struktur website akan tetap sama seperti sebelumnya.'
            },
            {
              question: 'Apakah ada garansi layanan?',
              answer: 'Ya, kami memberikan garansi 100% uang kembali jika terjadi masalah dalam proses migrasi yang tidak bisa kami selesaikan.'
            }
          ].map((faq, index) => (
            <div 
              key={index}
              className="rounded-xl border bg-white dark:bg-gray-900 p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 max-w-3xl mb-20">
        <div className="text-center bg-primary/5 rounded-2xl p-8 md:p-12 shadow">
          <h2 className="text-3xl font-extrabold mb-4 text-neutral-900 dark:text-white">
            Siap Pindahkan Website WordPress Anda?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Konsultasikan kebutuhan migrasi website Anda dengan tim ahli kami. Dapatkan penawaran khusus untuk migrasi multiple website.
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