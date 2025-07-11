const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
              {
          protocol: 'https',
          hostname: process.env.NEXT_PUBLIC_SITE_DOMAIN || 'www.example.com',
          pathname: '/wp-content/uploads/**',
        },
        {
          protocol: 'https',
          hostname: process.env.NEXT_PUBLIC_SITE_DOMAIN_ALT || 'example.com',
          pathname: '/wp-content/uploads/**',
        },
        {
          protocol: 'https',
          hostname: process.env.NEXT_PUBLIC_WP_BACKEND_DOMAIN || 'backend.example.com',
          pathname: '/wp-content/uploads/**',
        },
      {
        protocol: 'https',
        hostname: 'www.heyapakabar.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'heyapakabar.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/avatar/**',
      },
      {
        protocol: 'https',
        hostname: 'caraqu.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 's3.nevaobjects.id',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 's3.nevaobjects.id',
        pathname: '/imanges/**',
      },
      {
        protocol: 'https',
        hostname: 'beritahindu.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react']
  },

  transpilePackages: ['wp-block-to-html'],

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/post-sitemap.xml',
          destination: '/post-sitemap.xml',
        },
        {
          source: '/page-sitemap.xml',
          destination: '/page-sitemap.xml',
        },
        {
          source: '/category-sitemap.xml',
          destination: '/category-sitemap.xml',
        },
        {
          source: '/tag-sitemap.xml',
          destination: '/tag-sitemap.xml',
        },
      ],
    };
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/(sitemap.xml|post-sitemap.xml|page-sitemap.xml|category-sitemap.xml|tag-sitemap.xml)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=1800, s-maxage=1800'
          },
          {
            key: 'X-Robots-Tag',
            value: 'noindex'
          }
        ]
      },
      {
        source: '/sitemap.xsl',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/xsl; charset=utf-8'
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  compress: true,
  poweredByHeader: false,
  
  // Changed back to 'standalone' to support API routes
  output: 'standalone',
  
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'wp-block-to-html': require.resolve('wp-block-to-html')
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false
    };

    // Production optimizations
    if (!dev && !isServer) {
      // Optimize bundle splitting
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
          wordpress: {
            test: /[\\/]lib[\\/]wordpress-api/,
            name: 'wordpress-api',
            chunks: 'all',
            priority: 15,
          },
        },
      };

      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  }
};

module.exports = nextConfig; 