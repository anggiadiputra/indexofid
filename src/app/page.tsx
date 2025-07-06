import Link from 'next/link';
import { getAllPosts } from '@/lib/wordpress-api';
import { WordPressPost } from '@/types/wordpress';
import ClientsCarousel from '@/components/ClientsCarousel';
import NewsletterSignup from '@/components/NewsletterSignup';
import { getHomepageData } from '@/lib/wordpress-api';

// Aggressive caching for homepage
export const revalidate = 300; // 5 minutes ISR

export default async function HomePage() {
  // Use parallel data fetching for optimal TTFB
  const { posts, popularPosts } = await getHomepageData();

  // Comprehensive Schema.org markup for WordPress Maintenance Services
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "JasaKami.ID - WordPress Maintenance Services",
    "alternateName": "JasaKami.ID",
    "url": "https://jasakami.id",
    "logo": "https://jasakami.id/logo.png",
    "description": "Spesialis layanan pemeliharaan WordPress profesional: migrasi aman, pembersihan malware, setup VPS, dan pengelolaan server untuk performa website yang optimal.",
    "foundingDate": "2020",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+62-812-3456-7890",
      "contactType": "customer service",
      "availableLanguage": ["Indonesian", "English"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
      "addressRegion": "Jakarta",
      "addressLocality": "Jakarta"
    },
    "sameAs": [
      "https://facebook.com/jasakami.id",
      "https://twitter.com/jasakami_id",
      "https://linkedin.com/company/jasakami-id"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "WordPress Maintenance Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Jasa Migrasi WordPress",
            "description": "Pindahkan website WordPress Anda dengan aman ke hosting baru. Zero downtime, data lengkap, dan konfigurasi otomatis dengan tim profesional.",
            "provider": {
              "@type": "Organization",
              "name": "JasaKami.ID"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Jasa Remove Malware",
            "description": "Pembersihan menyeluruh virus, malware, dan file berbahaya dari website WordPress Anda. Pulihkan keamanan dan kepercayaan pengunjung.",
            "provider": {
              "@type": "Organization",
              "name": "JasaKami.ID"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Jasa Setup VPS",
            "description": "Konfigurasi VPS profesional untuk performa maksimal. Instalasi server, security hardening, dan monitoring otomatis untuk website Anda.",
            "provider": {
              "@type": "Organization",
              "name": "JasaKami.ID"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Jasa Manage VPS",
            "description": "Pengelolaan VPS profesional 24/7. Maintenance, update keamanan, backup otomatis, dan monitoring real-time untuk stabilitas server Anda.",
            "provider": {
              "@type": "Organization",
              "name": "JasaKami.ID"
            }
          }
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "JasaKami.ID - WordPress Maintenance Services",
    "url": "https://jasakami.id",
    "description": "Spesialis layanan pemeliharaan WordPress profesional di Indonesia",
    "inLanguage": "id-ID",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://jasakami.id/blog?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "JasaKami.ID",
    "image": "https://jasakami.id/logo.png",
    "description": "Spesialis maintenance WordPress: migrasi, malware removal, VPS setup & management",
    "url": "https://jasakami.id",
    "telephone": "+62-812-3456-7890",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ID",
      "addressRegion": "Jakarta"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -6.2088,
      "longitude": 106.8456
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "serviceType": "WordPress Maintenance Services",
    "areaServed": {
      "@type": "Country",
      "name": "Indonesia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "WordPress Maintenance Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "WordPress Migration Service",
            "serviceType": "Website Migration"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Malware Removal Service",
            "serviceType": "Website Security"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "VPS Setup Service",
            "serviceType": "Server Configuration"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Managed VPS Service",
            "serviceType": "Server Management"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "100",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
      
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col justify-center items-center">
      {/* Redesigned Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white mb-6 leading-tight max-w-3xl mx-auto">
          Dapatkan Nama Domain Impianmu<br className="hidden md:inline" />
          Mulai Bisnis Online Lebih Mudah!
        </h1>
        <p className="text-lg md:text-xl text-gray-700 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
          Temukan dan beli domain terbaik untuk brand, bisnis, atau proyek pribadimu. Proses cepat, harga transparan, dan dukungan profesional siap membantu kamu online tanpa ribet!
        </p>
        <a
          href="#get-started"
          className="inline-flex items-center justify-center px-8 py-4 bg-white text-neutral-900 font-semibold rounded-lg shadow hover:bg-neutral-200 transition mb-10 text-lg"
        >
          Get Started For Free
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </a>
        {/* Monochrome Developer Illustration (SVG) */}
        <div className="w-full flex justify-center">
          <svg width="400" height="220" viewBox="0 0 400 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="200" cy="200" rx="180" ry="20" fill="#444" />
            <rect x="80" y="120" width="240" height="10" rx="5" fill="#888" />
            <rect x="110" y="80" width="60" height="40" rx="8" fill="#222" />
            <rect x="180" y="100" width="100" height="20" rx="6" fill="#222" />
            <rect x="120" y="120" width="40" height="40" rx="10" fill="#bbb" />
            <rect x="170" y="120" width="60" height="40" rx="10" fill="#bbb" />
            <rect x="240" y="120" width="60" height="40" rx="10" fill="#bbb" />
            <circle cx="150" cy="110" r="18" fill="#eee" />
            <rect x="140" y="128" width="20" height="30" rx="8" fill="#eee" />
            <rect x="145" y="158" width="10" height="20" rx="5" fill="#eee" />
            <rect x="155" y="158" width="10" height="20" rx="5" fill="#eee" />
            <rect x="130" y="148" width="10" height="20" rx="5" fill="#eee" />
            <rect x="160" y="148" width="10" height="20" rx="5" fill="#eee" />
            <rect x="200" y="130" width="40" height="10" rx="5" fill="#888" />
            <rect x="250" y="130" width="20" height="10" rx="5" fill="#888" />
            <rect x="270" y="130" width="20" height="10" rx="5" fill="#888" />
            <rect x="290" y="130" width="10" height="10" rx="5" fill="#888" />
            <circle cx="320" cy="60" r="6" fill="#888" />
            <rect x="320" y="70" width="8" height="20" rx="4" fill="#888" />
            <rect x="330" y="80" width="8" height="10" rx="4" fill="#888" />
            <rect x="340" y="90" width="8" height="10" rx="4" fill="#888" />
          </svg>
        </div>
      </section>
    </div>
    </>
  );
} 