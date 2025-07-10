import Link from 'next/link';
import { getAllPosts } from '@/lib/wordpress-api';
import { WordPressPost } from '@/types/wordpress';
import ClientsCarousel from '@/components/ClientsCarousel';
import { getHomepageData } from '@/lib/wordpress-api';
import { env } from '@/config/environment';

// PERFORMANCE OPTIMIZATION: Use ISR instead of force-dynamic
export const revalidate = 86400; // Revalidate every 24 hours

export default async function HomePage() {
  // Use parallel data fetching for optimal TTFB
  const { posts, popularPosts } = await getHomepageData();

  // Determine base URL for schema
  const baseUrl = env.site.url || env.wordpress.frontendDomain || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_DOMAIN || 'http://localhost:3000';
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash

  // Enhanced Organization Schema - Fully Configurable from Environment
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${cleanBaseUrl}/#organization`,
    "name": env.schema.business.name,
    "alternateName": env.schema.business.alternateName || env.schema.business.name,
    "url": cleanBaseUrl,
    "logo": {
      "@type": "ImageObject",
      "@id": `${cleanBaseUrl}${env.site.logo}`,
      "url": `${cleanBaseUrl}${env.site.logo}`,
      "caption": `${env.schema.business.name} Logo`
    },
    "image": `${cleanBaseUrl}${env.site.logo}`,
    "description": env.schema.business.description,
    "slogan": env.schema.business.slogan || env.site.slogan,
    "foundingDate": env.schema.business.foundingDate,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": env.schema.business.streetAddress,
      "addressLocality": env.schema.business.addressLocality,
      "addressRegion": env.schema.business.addressRegion,
      "postalCode": env.schema.business.postalCode,
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": env.schema.business.latitude,
      "longitude": env.schema.business.longitude
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "@id": `${cleanBaseUrl}/#contact`,
        "telephone": env.schema.business.phone,
        "email": env.schema.business.email,
        "contactType": "customer service",
        "availableLanguage": ["id", "en"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      }
    ],
    "sameAs": [env.schema.social.facebook, env.schema.social.twitter, env.schema.social.linkedin, env.schema.social.instagram, env.schema.social.youtube].filter(Boolean),
    "priceRange": "$$",
    "currenciesAccepted": "IDR",
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Services",
      "itemListElement": env.schema.services.primary.map((service, index) => {
        const serviceKey = `service${index + 1}` as keyof typeof env.schema.services.serviceDescriptions;
        return {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service || `Service ${index + 1}`,
            "description": env.schema.services.serviceDescriptions[serviceKey] || `Professional ${(service || 'business').toLowerCase()} services`
          }
        };
      })
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${cleanBaseUrl}/#website`,
    "name": `${env.schema.business.name} - ${env.site.description || env.schema.business.description}`,
    "url": cleanBaseUrl,
    "description": env.site.description || env.schema.business.description,
    "publisher": {
      "@id": `${cleanBaseUrl}/#organization`
    },
    "inLanguage": env.schema.locale.language,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${cleanBaseUrl}/blog?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const professionalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${cleanBaseUrl}/#service`,
    "name": env.schema.business.name,
    "url": cleanBaseUrl,
    "image": `${cleanBaseUrl}${env.site.logo}`,
    "description": env.schema.business.description,
    "provider": {
      "@id": `${cleanBaseUrl}/#organization`
    },
    "areaServed": {
      "@type": "Country",
      "name": env.schema.locale.country
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Services",
      "itemListElement": env.schema.services.primary.map((service, index) => {
        const serviceKey = `service${index + 1}` as keyof typeof env.schema.services.serviceDescriptions;
        return {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service || `Service ${index + 1}`,
            "description": env.schema.services.serviceDescriptions[serviceKey] || `Professional ${(service || 'business').toLowerCase()} services`
          }
        };
      })
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
          __html: JSON.stringify(professionalServiceSchema)
        }}
      />
      
      {/* Hero Section - What's Included */}
      <section className="relative overflow-hidden bg-gray-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                What&apos;s Included in 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> IndexOf.ID</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                IndexOf.ID adalah comprehensive platform teknologi yang mencakup semua yang Anda butuhkan untuk memulai proyek digital Anda. Apa yang termasuk dalam IndexOf.ID:
              </p>
              
              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">15+ Pre-built services</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">99+ Google Pagespeed Score</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Built with Next.js and TailwindCSS for easy and customizable styling</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Fully responsive on all devices</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">SEO-optimized for better search engine rankings</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Professional service dan free consultation untuk use-case Anda</span>
                </div>
              </div>
            </div>

            {/* Right Illustration */}
            <div className="relative">
              {/* Main Illustration Area */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700">
                {/* Workspace Illustration */}
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-400">Professional Digital Workspace</div>
                </div>

                {/* Feature Icons Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded">
                      <svg className="w-8 h-8 p-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300">User Management</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded">
                      <svg className="w-8 h-8 p-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-300">Analytics</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full ml-1"></div>
                        <div className="w-1 h-1 bg-white rounded-full ml-1"></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">Dashboard</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-orange-500 rounded">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white rounded-full"></div>
                        <div className="w-1 h-3 bg-white ml-1"></div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">Reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white dark:bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Discover the Key Features Of IndexOf.ID
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                IndexOf.ID adalah all-in-one web platform untuk building modern dan content-focused websites. 
                Platform kami menawarkan berbagai exciting features untuk developers dan website creators. 
                Beberapa key features adalah:
              </p>
              
              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Zero JS, by default: No Javascript runtime overhead to slow you down.</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Customizable Tailwind, MDX, and 100+ shortcode integrations to choose from.</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">18 pre-made: Support React, Preact, Svelte, Vue, Solid, Lit and more.</span>
                </div>
              </div>

              <Link
                href="/services"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Get Started Now
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Right Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance</h3>
                <p className="text-sm text-gray-600">Optimized for speed</p>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">User Friendly</h3>
                <p className="text-sm text-gray-600">Easy to use interface</p>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Build</h3>
                <p className="text-sm text-gray-600">Quick deployment</p>
              </div>
              
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality</h3>
                <p className="text-sm text-gray-600">Premium standards</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Reasons Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Icons Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-xl flex items-center justify-center">
                  <div className="text-white text-2xl font-bold">=</div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                The Top Reasons to Choose IndexOf.ID for Your Project
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Dengan IndexOf.ID, Anda dapat build modern dan content focused websites tanpa 
                sacrificing performance atau ease of use.
              </p>
              
              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Instantly load static sites for better user experience and SEO</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Intuitive syntax and support for popular frameworks make learning and using IndexOf.ID a breeze</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Use any front-end library or framework, or build custom components, for any project size</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-400 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Built on cutting-edge technology to keep your projects up-to-date with the latest web standards.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              What Users Are Saying About IndexOf.ID
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                             Don&apos;t just take our word for it - hear from some of our satisfied users! Check out some of 
               our testimonials below to see what others are saying about IndexOf.ID.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <blockquote className="text-gray-700 mb-4">
                &quot;IndexOf.ID sangat membantu dalam proses maintenance website kami. Tim yang professional dan response time yang cepat membuat kami sangat puas dengan layanannya.&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">AM</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Ahmad Maulana</div>
                  <div className="text-sm text-gray-500">CEO Startup</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <blockquote className="text-gray-700 mb-4">
                &quot;Proses migrasi website kami dari hosting lama ke VPS baru berjalan sangat smooth tanpa downtime. Recommended banget untuk yang butuh jasa migrasi website!&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold">SR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sari Rahayu</div>
                  <div className="text-sm text-gray-500">E-commerce Owner</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <blockquote className="text-gray-700 mb-4">
                &quot;Setelah website kami terkena malware, IndexOf.ID berhasil membersihkannya dengan sempurna dan memberikan proteksi keamanan yang lebih baik. Thank you!&quot;
              </blockquote>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold">BS</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Budi Santoso</div>
                  <div className="text-sm text-gray-500">Blogger Professional</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Carousel */}
      <ClientsCarousel />
    </>
  );
} 