# Environment Setup Guide

This guide explains how to configure environment variables for the IndexOf.ID headless WordPress project.

## Quick Start

1. Copy the environment template:
```bash
cp env.local.example .env.local
```

2. Edit `.env.local` with your specific configuration
3. Restart the development server: `npm run dev`

## Core Configuration Sections

### WordPress API Configuration

Configure your WordPress backend connection:

```env
# WordPress API endpoints
WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2

# Domain mapping for headless setup
NEXT_PUBLIC_WORDPRESS_BACKEND_URL=https://backend.indexof.id
NEXT_PUBLIC_FRONTEND_DOMAIN=https://www.indexof.id
```

### Site Configuration

Basic site information:

```env
NEXT_PUBLIC_SITE_NAME=IndexOf.ID
NEXT_PUBLIC_SITE_URL=https://www.indexof.id
NEXT_PUBLIC_SITE_DESCRIPTION=Platform teknologi terdepan untuk solusi domain, hosting, VPS, dan pengembangan website profesional di Indonesia
NEXT_PUBLIC_SITE_SLOGAN=Solusi Digital Terpercaya Indonesia
```

## Business Schema Configuration (RECOMMENDED)

### New Business Variables

The latest version uses `BUSINESS` prefix for improved semantic accuracy:

```env
# Business Information
NEXT_PUBLIC_BUSINESS_NAME=IndexOf.ID
NEXT_PUBLIC_BUSINESS_ALTERNATE_NAME=Index Of Indonesia
NEXT_PUBLIC_BUSINESS_DESCRIPTION=Platform teknologi terdepan untuk solusi domain, hosting, VPS, dan pengembangan website profesional di Indonesia
NEXT_PUBLIC_BUSINESS_TYPE=ProfessionalService

# Contact Information
NEXT_PUBLIC_BUSINESS_PHONE=+62-852-889-89824
NEXT_PUBLIC_BUSINESS_EMAIL=support@indexof.id

# Address Information
NEXT_PUBLIC_BUSINESS_STREET_ADDRESS=Jl. Maguwo Raya No. 123
NEXT_PUBLIC_BUSINESS_LOCALITY=Sleman
NEXT_PUBLIC_BUSINESS_REGION=DI Yogyakarta
NEXT_PUBLIC_BUSINESS_POSTAL_CODE=55285

# Geographic Coordinates
NEXT_PUBLIC_BUSINESS_LATITUDE=-7.7553
NEXT_PUBLIC_BUSINESS_LONGITUDE=110.4186
```

### Legacy Organization Variables (Backward Compatibility)

For backward compatibility, `ORG` variables are still supported:

```env
NEXT_PUBLIC_ORG_NAME=IndexOf.ID
NEXT_PUBLIC_ORG_DESCRIPTION=Platform teknologi...
# ... other ORG variables
```

**Variable Priority:** BUSINESS → ORG → empty string

## Fixing Common Schema Issues

### 1. Empty URLs in Schema

**Problem:** Schema shows empty `"url": ""` values

**Solution:** Ensure these variables are set:
```env
# Primary URL configuration
NEXT_PUBLIC_SITE_URL=https://www.indexof.id

# Fallback URL for development
NEXT_PUBLIC_FRONTEND_DOMAIN=http://localhost:3000
```

The system will use fallback order: `SITE_URL` → `FRONTEND_DOMAIN` → `https://www.indexof.id`

### 2. Missing Geo Coordinates

**Problem:** Schema shows `"geo": null`

**Solution:** Add valid coordinates for your business location:
```env
# Coordinates for Sleman, Yogyakarta
NEXT_PUBLIC_BUSINESS_LATITUDE=-7.7553
NEXT_PUBLIC_BUSINESS_LONGITUDE=110.4186
```

### 3. Placeholder Social Media Links

**Problem:** Schema shows default `https://facebook.com/your-page` links

**Solution:** Update with real social media URLs:
```env
NEXT_PUBLIC_FACEBOOK_URL=https://facebook.com/indexofid
NEXT_PUBLIC_TWITTER_URL=https://twitter.com/indexofid
NEXT_PUBLIC_LINKEDIN_URL=https://linkedin.com/company/indexofid
NEXT_PUBLIC_INSTAGRAM_URL=https://instagram.com/indexofid
NEXT_PUBLIC_YOUTUBE_URL=https://youtube.com/@indexofid
```

### 4. Empty Services Array

**Problem:** Schema shows `"serviceType": []`

**Solution:** Configure your business services:
```env
NEXT_PUBLIC_SERVICE_1=WordPress Maintenance
NEXT_PUBLIC_SERVICE_2=VPS Management
NEXT_PUBLIC_SERVICE_3=Malware Removal
NEXT_PUBLIC_SERVICE_4=Website Migration

# Service descriptions
NEXT_PUBLIC_SERVICE_1_DESC=Layanan maintenance dan optimasi WordPress profesional
NEXT_PUBLIC_SERVICE_2_DESC=Setup dan pengelolaan VPS managed dengan keamanan tinggi
NEXT_PUBLIC_SERVICE_3_DESC=Pembersihan malware dan perlindungan keamanan website
NEXT_PUBLIC_SERVICE_4_DESC=Migrasi website dan domain dengan aman tanpa downtime
```

### 5. Inconsistent Address Information

**Problem:** Address shows wrong region (e.g., DKI Jakarta for Sleman location)

**Solution:** Ensure address consistency:
```env
# For Sleman, Yogyakarta location
NEXT_PUBLIC_BUSINESS_LOCALITY=Sleman
NEXT_PUBLIC_BUSINESS_REGION=DI Yogyakarta
NEXT_PUBLIC_BUSINESS_POSTAL_CODE=55285
```

## Schema Testing

### Test Local Schema

1. Start development server: `npm run dev`
2. Test JSON-LD API: `curl http://localhost:3000/api/json-ld | jq`
3. Check specific schema properties:

```bash
# Test business information
curl -s "http://localhost:3000/api/json-ld" | jq '.["@graph"][0] | {name, url, logo, address, geo, sameAs}'

# Test services
curl -s "http://localhost:3000/api/json-ld" | jq '.["@graph"][0].serviceType'

# Test full schema
curl -s "http://localhost:3000" | grep -A 50 'application/ld+json'
```

### Production Schema Validation

1. Use Google's Rich Results Test: https://search.google.com/test/rich-results
2. Schema.org validator: https://validator.schema.org/
3. Check for structured data warnings in Google Search Console

## Migration Guide

### From Organization to Business Schema

1. **Backup current configuration:**
```bash
cp .env.local .env.local.backup
```

2. **Add new BUSINESS variables** (copy values from existing ORG variables):
```env
NEXT_PUBLIC_BUSINESS_NAME=IndexOf.ID  # was NEXT_PUBLIC_ORG_NAME
NEXT_PUBLIC_BUSINESS_PHONE=+62-852-889-89824  # was NEXT_PUBLIC_ORG_PHONE
# ... continue for all variables
```

3. **Keep ORG variables** for backward compatibility (optional)

4. **Test the migration:**
```bash
npm run dev
curl -s "http://localhost:3000/api/json-ld" | jq '.["@graph"][0].name'
```

### Benefits of Migration

- ✅ **Semantic Accuracy:** Uses business-appropriate terminology
- ✅ **Enhanced Services:** Better service catalog management
- ✅ **Social Media Support:** Instagram and YouTube integration
- ✅ **Geographic Precision:** Proper coordinates and address handling
- ✅ **Backward Compatibility:** Existing ORG variables still work
- ✅ **Schema Validation:** Improved compliance with Schema.org standards

## Troubleshooting

### Schema Not Updating

1. **Restart development server** after environment changes
2. **Clear browser cache** for client-side changes
3. **Check environment loading** with debug commands

### Environment Variable Debug

```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXT_PUBLIC_BUSINESS_NAME)"

# Test environment configuration
curl -s "http://localhost:3000/api/json-ld" | jq '.["@graph"][0] | keys'
```

### Common Validation Errors

1. **Missing required fields:** Add all address components
2. **Invalid coordinates:** Use decimal degrees format (-7.7553, 110.4186)
3. **Malformed URLs:** Ensure proper protocol (https://)
4. **Empty service arrays:** Configure at least one service

## Production Deployment

### Vercel Configuration

1. Add environment variables in Vercel dashboard
2. Use production URLs: `https://www.indexof.id`
3. Test deployed schema: `https://www.indexof.id/api/json-ld`

### Environment Variable Security

- ✅ **Public variables:** NEXT_PUBLIC_* (safe to expose)
- ❌ **Private variables:** API keys, secrets (server-only)
- ✅ **Schema variables:** All business schema vars are public

## Support

For schema-related issues:
1. Check this documentation
2. Validate schema with online tools
3. Test with Google Rich Results
4. Review browser console for errors

---

**Last Updated:** January 2025  
**Schema Version:** Business Schema v2.0 with backward compatibility 