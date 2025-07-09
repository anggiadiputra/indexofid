# Environment Variable Setup Guide

## Overview

This Next.js headless WordPress application has been fully refactored to use environment variables for all configuration. This makes it easy to:

- **Rebrand** by changing a few environment variables
- **Migrate domains** without touching code
- **Deploy multiple instances** with different configurations
- **Support multiple environments** (dev, staging, production)

## Quick Setup

1. Copy the example environment file:
   ```bash
   cp env.local.example .env.local
   ```

2. Update the variables in `.env.local` with your actual values

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Core Environment Variables

### 🌐 Site Configuration
```bash
# Primary site settings
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description
NEXT_PUBLIC_SITE_LOGO_TEXT=YS
NEXT_PUBLIC_SITE_SLOGAN=Your catchy slogan
NEXT_PUBLIC_SITE_AUTHOR=Your Name

# Images and media
NEXT_PUBLIC_OG_IMAGE=/og-image.jpg
NEXT_PUBLIC_TWITTER_IMAGE=/twitter-image.jpg
NEXT_PUBLIC_SITE_LOGO=/logo.png
NEXT_PUBLIC_RSS_TITLE=Your Site RSS Feed

# Social media
NEXT_PUBLIC_TWITTER_HANDLE=your_handle
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/yourpage
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/youraccount
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/yourcompany

# Next.js image optimization domains
NEXT_PUBLIC_SITE_DOMAIN=www.yourdomain.com
NEXT_PUBLIC_SITE_DOMAIN_ALT=yourdomain.com

# Multilingual support (optional)
NEXT_PUBLIC_ALT_LANGUAGE_URL=https://yourdomain.com/en
```

### 🗄️ WordPress API Configuration
```bash
# Primary WordPress backend
WORDPRESS_API_URL=https://backend.yourdomain.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.yourdomain.com/wp-json/wp/v2

# Fallback API (when primary fails)
NEXT_PUBLIC_FALLBACK_API_URL=https://backup.yourdomain.com/wp-json/wp/v2

# WordPress backend domain for Next.js image optimization
NEXT_PUBLIC_WP_BACKEND_DOMAIN=backend.yourdomain.com
```

### 🏢 Organization Schema
```bash
# Organization details (for SEO and schema markup)
NEXT_PUBLIC_ORG_NAME=Your Organization Name
NEXT_PUBLIC_ORG_DESCRIPTION=Your organization description
NEXT_PUBLIC_ORG_PHONE=+1-234-567-8900
NEXT_PUBLIC_ORG_EMAIL=contact@yourdomain.com
NEXT_PUBLIC_ORG_ADDRESS=Your City, Your Country
NEXT_PUBLIC_ORG_HOURS=Monday - Friday: 09:00 - 17:00

# Schema.org policy URLs
NEXT_PUBLIC_EDITORIAL_POLICY_URL=/editorial-policy
NEXT_PUBLIC_ETHICS_POLICY_URL=/ethics-policy
NEXT_PUBLIC_DIVERSITY_POLICY_URL=/diversity-policy
NEXT_PUBLIC_ABOUT_URL=/about
```

### 📞 Contact & Services
```bash
# WhatsApp contact
NEXT_PUBLIC_WHATSAPP_NUMBER=1234567890

# Customer portal (optional)
NEXT_PUBLIC_CUSTOMER_LOGIN_URL=https://dashboard.yourdomain.com/login

# Services for schema markup
NEXT_PUBLIC_SERVICE_1=Your Service 1
NEXT_PUBLIC_SERVICE_2=Your Service 2
NEXT_PUBLIC_SERVICE_3=Your Service 3
NEXT_PUBLIC_SERVICE_4=Your Service 4
```

### 🌍 Localization
```bash
# Language and region settings
NEXT_PUBLIC_SITE_LANGUAGE=en-US
NEXT_PUBLIC_SITE_COUNTRY=United States
```

## Migration Scenarios

### 🔄 Domain Change
To change domain from `oldsite.com` to `newsite.com`:

1. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://newsite.com
   NEXT_PUBLIC_SITE_DOMAIN=www.newsite.com
   NEXT_PUBLIC_SITE_DOMAIN_ALT=newsite.com
   # Update other domain-specific URLs...
   ```

2. Update `next.config.js` if using different image domains

3. Restart development server

### 🏷️ Rebranding
To rebrand from "Old Brand" to "New Brand":

1. Update branding variables:
   ```bash
   NEXT_PUBLIC_SITE_NAME=New Brand
   NEXT_PUBLIC_ORG_NAME=New Brand Inc.
   NEXT_PUBLIC_SITE_LOGO_TEXT=NB
   NEXT_PUBLIC_SITE_SLOGAN=Your new slogan
   ```

2. Update social media URLs and service descriptions

3. Replace logo and image files

### 🌐 Multi-tenant Setup
For multiple sites using the same codebase:

1. Create environment files for each site:
   - `.env.local.site1`
   - `.env.local.site2`
   - `.env.local.site3`

2. Use deployment scripts to copy the appropriate file:
   ```bash
   cp .env.local.site1 .env.local && npm run build
   ```

## What Changed?

### ✅ Environmentalized Components
- **Layout metadata** (OpenGraph, Twitter, canonical URLs)
- **Homepage schema** (Organization, Website, Local Business)
- **Service pages** (titles, content)
- **Blog pages** (metadata, schema)
- **Navigation** (branding, links)
- **Social media** links and handles
- **Image domains** (Next.js optimization)

### 🔧 Configuration Files Updated
- `src/config/environment.ts` - Centralized configuration
- `src/app/layout.tsx` - Dynamic metadata
- `src/app/page.tsx` - Environment-based schema
- `next.config.js` - Dynamic image domains
- All service and blog pages

### 📂 Environment Templates
- `env.local.example` - Current site configuration
- `env.example` - Generic template for any site

## Testing

After updating environment variables:

1. **Check metadata**: View page source and verify OpenGraph/Twitter cards
2. **Test schema**: Use Google's Rich Results Test
3. **Verify images**: Ensure image optimization works with new domains
4. **Check links**: Verify all navigation and social media links
5. **Test search**: Ensure search functionality works with new branding

## Deployment

### Vercel
Add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all `NEXT_PUBLIC_*` variables
3. Redeploy

### Other Platforms
Ensure all environment variables are set in your hosting platform's environment configuration.

## Support

If you encounter issues after changing environment variables:
1. Clear Next.js cache: `rm -rf .next`
2. Restart development server
3. Check browser console for any remaining hardcoded references
4. Verify all required environment variables are set

---

**Note**: This setup provides 100% flexibility for domain changes, rebranding, and multi-tenant deployments without code modifications. 