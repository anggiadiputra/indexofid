import { Metadata } from 'next';
import Link from 'next/link';
import TagCloud from '@/components/TagCloud';
import LiveSearch from '@/components/LiveSearch';
import PopularPosts from '@/components/PopularPosts';
import { 
  generateWebPageSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema 
} from '@/lib/schema-generator';
import { env } from '@/config/environment';

export const metadata: Metadata = {
  title: `Semua Tag | ${env.schema.organization.name} Blog`,
  description: `Jelajahi semua tag dan topik artikel di blog ${env.schema.organization.name}. Temukan artikel berdasarkan kategori yang Anda minati.`,
  openGraph: {
    title: `Semua Tag | ${env.schema.organization.name} Blog`,
    description: `Jelajahi semua tag dan topik artikel di blog ${env.schema.organization.name}`,
    type: 'website',
    url: '/tags',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Semua Tag | ${env.schema.organization.name} Blog`,
    description: `Jelajahi semua tag dan topik artikel di blog ${env.schema.organization.name}`,
  },
  alternates: {
    canonical: '/tags',
  },
};

export default function TagsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": env.site.url
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": `${env.site.url}/blog`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Tag",
                "item": `${env.site.url}/tags`
              }
            ]
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `Semua Tag - ${env.schema.organization.name} Blog`,
            "description": `Jelajahi semua tag dan topik artikel di blog ${env.schema.organization.name}`,
            "url": `${env.site.url}/tags`,
            "inLanguage": env.schema.locale.language,
            "isPartOf": {
              "@type": "WebSite",
              "name": `${env.schema.organization.name} Blog`,
              "url": env.site.url
            }
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema())
        }}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <Link href="/blog" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                Blog
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 dark:text-gray-100 font-medium break-words">
              Tags
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 border border-orange-200 dark:border-gray-700 rounded-2xl p-8 mb-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                      Jelajahi Topik
                    </span>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Semua Tag Artikel
                  </h1>
                  
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Temukan artikel berdasarkan topik yang Anda minati. Setiap tag mengelompokkan artikel dengan tema serupa 
                    untuk memudahkan Anda menemukan konten yang relevan.
                  </p>
                </div>
              </div>
            </div>

            {/* Tag Cloud Sections */}
            <div className="space-y-12">
              {/* Most Popular Tags (Cloud Layout) */}
              <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Tag Terpopuler
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Tag dengan artikel terbanyak dan paling sering dibaca
                  </p>
                </div>
                
                <TagCloud 
                  maxTags={20}
                  showCount={true}
                  layout="cloud"
                  colorScheme="blue"
                  className=""
                />
              </section>

              {/* All Tags (Grid Layout) */}
              <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Semua Tag
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Daftar lengkap semua tag yang tersedia di blog kami
                  </p>
                </div>
                
                <TagCloud 
                  maxTags={100}
                  showCount={true}
                  layout="grid"
                  colorScheme="rainbow"
                  className=""
                />
              </section>

              {/* Featured Tags (List Layout) */}
              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Tag Pilihan
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Tag yang direkomendasikan untuk eksplorasi konten
                  </p>
                </div>
                
                <TagCloud 
                  maxTags={15}
                  showCount={true}
                  layout="list"
                  colorScheme="monochrome"
                  className=""
                />
              </section>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Tidak Menemukan Tag yang Dicari?
                </h3>
                <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                  Gunakan fitur pencarian untuk menemukan artikel spesifik atau jelajahi semua artikel di halaman blog utama.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/search"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Cari Artikel
                  </Link>
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    Semua Artikel
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
              {/* Search Box */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Cari Artikel</h3>
                <LiveSearch />
              </div>

              {/* Quick Navigation */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">Navigasi Cepat</h3>
                <div className="space-y-2">
                  <Link
                    href="/blog"
                    className="flex items-center gap-3 p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span>Semua Artikel</span>
                  </Link>
                  
                  <Link
                    href="/search"
                    className="flex items-center gap-3 p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Pencarian Lanjutan</span>
                  </Link>
                  
                  <Link
                    href="/"
                    className="flex items-center gap-3 p-2 text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Kembali ke Beranda</span>
                  </Link>
                </div>
              </div>

              {/* Popular Posts */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
                <PopularPosts 
                  maxResults={5}
                  showTrending={false}
                  layout="vertical"
                  showImages={true}
                  showExcerpt={false}
                  showDate={true}
                  className=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 