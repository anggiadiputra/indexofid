import type { Metadata } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import Script from 'next/script';
import Link from 'next/link';
import './globals.css';
import MobileMenu, { DesktopNavigation } from '@/components/navigation/MobileMenu';
import { ThemeProvider } from '@/components/ThemeProvider';
import MinionThemeToggle from '@/components/MinionThemeToggle';
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import { env } from '@/config/environment';

const sourceSans = Source_Sans_3({ 
  subsets: ['latin'],
  variable: '--font-source-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: `${env.site.name}${env.site.slogan ? ' - ' + env.site.slogan : ''}`,
  description: env.site.description,
  keywords: [
    'jasa maintenance wordpress',
    'migrasi wordpress',
    'remove malware wordpress', 
    'setup vps',
    'manage vps',
    'maintenance website',
    'wordpress indonesia',
    'jasa wordpress',
    'keamanan website',
    'optimasi wordpress'
  ],
  authors: [{ name: env.site.author || env.site.name }],
  creator: env.site.name,
  publisher: env.site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: env.site.url,
    siteName: env.site.name,
    title: `${env.site.name}${env.site.slogan ? ' - ' + env.site.slogan : ''}`,
    description: env.site.description,
    images: [
      {
        url: 'https://jasakami.id/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'JasaKami.ID - WordPress Maintenance Services',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${env.site.name}${env.site.slogan ? ' - ' + env.site.slogan : ''}`,
    description: env.site.description,
    creator: '@jasakami_id',
    images: ['https://jasakami.id/twitter-image.jpg'],
  },
  other: {
    slogan: env.site.slogan,
    'dns-prefetch': 'https://fonts.googleapis.com',
    'preconnect': 'https://fonts.gstatic.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://jasakami.id',
    types: {
      'application/rss+xml': [
        { url: '/feed.xml', title: 'JasaKami.ID RSS Feed' },
      ],
    },
    languages: {
      'id-ID': 'https://jasakami.id',
      'en-US': 'https://jasakami.id/en',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logoText = env.site.logoText || env.site.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const siteName = env.site.name;
  const siteNameFirst = siteName.split(' ')[0];

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${sourceSans.variable} font-sans antialiased min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-neutral-900">
            <div className="container mx-auto flex h-14 sm:h-16 lg:h-18 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
              {/* Logo - Left side */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-primary rounded-md">
                    <span className="text-primary-foreground font-bold text-xs sm:text-sm lg:text-base">{logoText}</span>
                  </div>
                  <span className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                    <span className="hidden sm:inline">{siteName}</span>
                    <span className="sm:hidden">{siteNameFirst}</span>
                  </span>
                </Link>
              </div>

              {/* Right side - Desktop Navigation, Theme Toggle and Mobile Menu */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
                {/* Desktop Navigation - Hidden on tablet and mobile */}
                <DesktopNavigation />

                {/* Theme toggle - Always visible but smaller on mobile */}
                <div className="flex items-center">
                  <MinionThemeToggle />
                </div>

                {/* Mobile Menu - Visible on mobile, hidden on medium screens and up */}
                <div className="md:hidden">
                  <MobileMenu />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>

          <footer className="border-t bg-gray-50 dark:bg-neutral-900 py-8 md:py-12 text-foreground dark:text-neutral-300">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Main Footer Content - 4 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                
                {/* Column 1: Company Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-md">
                      <span className="text-primary-foreground font-bold text-sm">{env.site.logoText || 'JK'}</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{env.schema.organization.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {env.schema.organization.description}
                  </p>
                  <div className="flex space-x-4">
                    {env.schema.social.facebook && (
                      <a 
                        href={env.schema.social.facebook}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {env.schema.social.twitter && (
                      <a 
                        href={env.schema.social.twitter}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="Twitter"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {env.schema.social.linkedin && (
                      <a 
                        href={env.schema.social.linkedin}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Column 2: Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Kontak Kami</h3>
                  <div className="space-y-3">
                    {env.schema.organization.email && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href={`mailto:${env.schema.organization.email}`} className="hover:text-primary transition-colors">
                          {env.schema.organization.email}
                        </a>
                      </div>
                    )}
                    {env.schema.organization.phone && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`tel:${env.schema.organization.phone.replace(/\s/g, '')}`} className="hover:text-primary transition-colors">
                          {env.schema.organization.phone}
                        </a>
                      </div>
                    )}
                    {env.schema.organization.address && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{env.schema.organization.address}</span>
                      </div>
                    )}
                    {env.schema.organization.hours && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{env.schema.organization.hours}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 3: Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Layanan Kami</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/jasa-migrasi-wordpress" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Jasa Migrasi WordPress
                      </Link>
                    </li>
                    <li>
                      <Link href="/jasa-remove-malware" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Jasa Remove Malware
                      </Link>
                    </li>
                    <li>
                      <Link href="/jasa-setup-vps" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Jasa Setup VPS
                      </Link>
                    </li>
                    <li>
                      <Link href="/jasa-manage-vps" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Jasa Manage VPS
                      </Link>
                    </li>
                    <li>
                      <Link href="/maintenance-wordpress" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Maintenance WordPress
                      </Link>
                    </li>
                    <li>
                      <Link href="/optimasi-wordpress" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        Optimasi WordPress
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Link Cepat */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Link Cepat</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Blog & Artikel
                      </Link>
                    </li>
                    <li>
                      <Link href="/tentang-kami" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Tentang Kami
                      </Link>
                    </li>
                    <li>
                      <Link href="/portofolio" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Portofolio
                      </Link>
                    </li>
                    <li>
                      <Link href="/testimoni" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Testimoni
                      </Link>
                    </li>
                    <li>
                      <Link href="/kontak" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Hubungi Kami
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        FAQ
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                  <p>© {new Date().getFullYear()} {env.site.name}</p>
                  <div className="flex items-center gap-1">
                    <span>Powered by</span>
                  <a
                    href="https://nextjs.org"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    Next.js
                  </a>
                    <span>&</span>
                  <a
                    href="https://wordpress.org"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    WordPress
                  </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Server Status: Online</span>
                  </div>
              </div>
              </div>
            </div>
          </footer>
        </div>
        </ThemeProvider>
        <AnalyticsWrapper />
      </body>
    </html>
  );
} 