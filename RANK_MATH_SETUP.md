# 🎯 Rank Math SEO API Setup & Troubleshooting

Panduan lengkap untuk mengintegrasikan Rank Math SEO API dalam headless WordPress setup untuk mendapatkan **focus keyword** dan **thumbnail** otomatis.

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Konfigurasi WordPress Backend](#konfigurasi-wordpress-backend)
3. [Konfigurasi Frontend](#konfigurasi-frontend)
4. [Testing & Debugging](#testing--debugging)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

---

## 🔧 Prerequisites

### WordPress Backend Requirements
- ✅ WordPress dengan Rank Math SEO plugin aktif
- ✅ Rank Math Pro (untuk headless support)
- ✅ REST API enabled
- ✅ CORS configured untuk headless setup

### Frontend Requirements
- ✅ Next.js 15+ dengan App Router
- ✅ Environment variables dikonfigurasi dengan benar

---

## 🏢 Konfigurasi WordPress Backend

### 1. Install & Activate Rank Math Pro

```bash
# Install via WordPress admin atau upload manual
# Aktifkan Rank Math SEO plugin
# Upgrade ke Rank Math Pro untuk headless features
```

### 2. Enable Headless Support

Di WordPress admin:

1. **Rank Math → General Settings → Modules**
   - Enable "Redirections"
   - Enable "404 Monitor" 
   - Enable "Role Manager"

2. **Rank Math → General Settings → Headless Support**
   - ✅ Enable "Headless Support"
   - ✅ Enable "REST API"
   - Set allowed domains untuk CORS

### 3. Verify API Endpoint

Test di browser bahwa endpoint berikut dapat diakses:

```
https://your-wp-site.com/wp-json/rankmath/v1/getHead?url=https://your-wp-site.com/sample-post/
```

**Expected Response:**
```json
{
  "success": true,
  "head": "<title>Post Title</title><meta name=\"description\" content=\"Post description\">..."
}
```

---

## 🌐 Konfigurasi Frontend

### 1. Environment Variables

Tambahkan ke `.env.local`:

```bash
# ==============================================
# RANK MATH SEO API CONFIGURATION
# ==============================================

# Enable Rank Math API
NEXT_PUBLIC_RANKMATH_API_ENABLED=true

# Rank Math API endpoint
NEXT_PUBLIC_RANKMATH_API_URL=https://backend.indexof.id/wp-json/rankmath/v1/getHead

# Site URLs for canonical and schema
NEXT_PUBLIC_SITE_URL=https://indexof.id
WORDPRESS_BACKEND_URL=https://backend.indexof.id

# WordPress REST API
WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
```

### 2. Verifikasi Konfigurasi

Restart development server:

```bash
npm run dev
```

---

## 🧪 Testing & Debugging

### 1. Browser Console Testing

Buka browser console dan jalankan:

```javascript
// Test konfigurasi
debugRankMath.config()

// Test koneksi API
await debugRankMath.test()

// Test URL specific
await debugRankMath.testUrl('https://backend.indexof.id/cara-import-database-mysql-mariadb/')

// Run full diagnostic
await debugRankMath.diagnostic()
```

### 2. Expected Output

**✅ Successful Configuration:**
```
🔧 [RankMath Debug] Testing API connection...
📊 [RankMath Debug] API Enabled: true
🔌 [RankMath Debug] Connection: ✅ SUCCESS

🧪 [RankMath Debug] Testing URL: https://backend.indexof.id/cara-import-database-mysql-mariadb/
📥 [RankMath Debug] Raw head HTML length: 2847
🔍 [RankMath Debug] Extracted data:
   📰 Title: "Cara Import Database MySQL/MariaDB..."
   📝 Description: "Panduan lengkap import database MySQL..."
   🎯 Focus Keyword: "import database mysql"
   🖼️  Thumbnail: "https://backend.indexof.id/wp-content/uploads/2024/01/mysql-import.jpg"
   🖼️  OG Image: "https://backend.indexof.id/wp-content/uploads/2024/01/mysql-import.jpg"
   🐦 Twitter Image: "https://backend.indexof.id/wp-content/uploads/2024/01/mysql-import.jpg"
   🔗 Canonical URL: "https://backend.indexof.id/cara-import-database-mysql-mariadb/"
   📚 Structured Data: 3 items
```

**❌ Failed Configuration:**
```
❌ [RankMath Debug] API not enabled. Check environment variables:
   - NEXT_PUBLIC_RANKMATH_API_ENABLED should be "true"
   - NEXT_PUBLIC_RANKMATH_API_URL should be set to your WordPress Rank Math API endpoint
```

### 3. Server Logs

Monitor server logs untuk melihat Rank Math API calls:

```bash
# Development
npm run dev

# Look for logs like:
[RankMath] Fetching SEO data for https://backend.indexof.id/cara-import-database-mysql-mariadb/
[RankMath] Successfully fetched SEO data for https://backend.indexof.id/cara-import-database-mysql-mariadb/
[RankMath] Extracted SEO data: {
  title: "Cara Import Database MySQL/MariaDB...",
  focusKeyword: "import database mysql",
  thumbnail: "https://backend.indexof.id/wp-content/uploads/2024/01/mysql-import.jpg"
}
```

---

## 🛠 Troubleshooting

### 1. Focus Keyword Tidak Muncul

**Possible Causes & Solutions:**

#### A. Rank Math belum set focus keyword
```bash
# Check WordPress admin:
# Edit post → Rank Math → Focus Keyword
# Pastikan focus keyword sudah diset
```

#### B. API tidak mengirim focus keyword
```javascript
// Debug di browser console:
await debugRankMath.testUrl('your-post-url')

// Check apakah ada di raw HTML:
// Look for meta tags like:
// <meta name="rankmath-focus-keyword" content="your keyword">
// <meta name="focus-keyword" content="your keyword">
```

#### C. Parsing tidak mendeteksi keyword
```javascript
// Check structured data:
// Focus keyword mungkin ada di JSON-LD schema
// Check keywords property in Article schema
```

### 2. Thumbnail Tidak Muncul

**Possible Causes & Solutions:**

#### A. Featured image belum diset
```bash
# WordPress admin:
# Edit post → Featured Image
# Set featured image untuk post
```

#### B. Open Graph image tidak dikonfigurasi
```bash
# Rank Math → Titles & Meta → Posts → Articles
# Set default fallback image
# Atau per-post: Edit post → Rank Math → Social Meta
```

#### C. Image URL tidak valid
```javascript
// Debug di console:
const extracted = await debugRankMath.testUrl('your-url')
console.log('All image sources:', {
  ogImage: extracted.ogImage,
  twitterImage: extracted.twitterImage,
  thumbnail: extracted.thumbnail,
  featuredImage: extracted.featuredImage
})
```

### 3. API Connection Failed

**Possible Causes & Solutions:**

#### A. CORS Issues
```bash
# WordPress backend perlu allow CORS untuk domain frontend
# Add to wp-config.php atau via plugin:

header('Access-Control-Allow-Origin: https://indexof.id');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

#### B. API Endpoint tidak ditemukan
```bash
# Test manual di browser:
https://backend.indexof.id/wp-json/rankmath/v1/getHead?url=https://backend.indexof.id/

# Expected: JSON response
# Got 404? Check Rank Math Pro activation
```

#### C. WordPress REST API disabled
```bash
# Check .htaccess rules
# Pastikan tidak ada rules yang block /wp-json/
```

### 4. Environment Variables

**Check Configuration:**
```javascript
// Browser console:
debugRankMath.config()

// Expected output:
⚙️  [RankMath Debug] Current configuration:
   🔧 API Enabled: true
   🌐 API URL: https://backend.indexof.id/wp-json/rankmath/v1/getHead
   🏠 Site URL: https://indexof.id
   🏢 WordPress Backend: https://backend.indexof.id
```

---

## 🚀 Advanced Configuration

### 1. Custom Focus Keyword Extraction

Jika Rank Math tidak mengirim focus keyword via meta tags standar, Anda bisa custom extract:

```typescript
// src/lib/rankmath-api.ts
extractFocusKeywordFromContent(headHtml: string): string | undefined {
  // Try multiple patterns
  const patterns = [
    /rankmath[_-]focus[_-]keyword["\'\s]*[:\=]["\'\s]*([^"\'<>\n]+)/i,
    /focus[_-]keyword["\'\s]*[:\=]["\'\s]*([^"\'<>\n]+)/i,
    /target[_-]keyword["\'\s]*[:\=]["\'\s]*([^"\'<>\n]+)/i,
    // Add custom patterns specific to your setup
  ];
  
  for (const pattern of patterns) {
    const match = headHtml.match(pattern);
    if (match) return match[1].trim();
  }
  
  // Extract from JSON-LD structured data
  const structuredData = this.getStructuredData(headHtml);
  for (const data of structuredData) {
    if (data.keywords) {
      return Array.isArray(data.keywords) ? data.keywords[0] : data.keywords.split(',')[0].trim();
    }
  }
  
  return undefined;
}
```

### 2. Custom Thumbnail Sources

```typescript
// Extract thumbnail from multiple sources
extractImageFromContent(headHtml: string): string | undefined {
  const patterns = [
    // Rank Math specific
    /<meta[^>]*name=["']rankmath:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    // WordPress specific  
    /<meta[^>]*name=["']thumbnail["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    // Generic image meta
    /<meta[^>]*name=["']image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    // Link rel image
    /<link[^>]*rel=["']image["'][^>]*href=["']([^"']+)["'][^>]*>/i,
  ];
  
  for (const pattern of patterns) {
    const match = headHtml.match(pattern);
    if (match) return match[1];
  }
  
  return undefined;
}
```

### 3. Caching Optimization

```typescript
// Optimize cache settings
const config: RankMathConfig = {
  apiUrl: process.env.NEXT_PUBLIC_RANKMATH_API_URL || '',
  enabled: process.env.NEXT_PUBLIC_RANKMATH_API_ENABLED === 'true',
  timeout: 10000, // 10 seconds for slow networks
  cacheTime: 60 * 60 * 1000, // 1 hour cache for SEO data
};
```

---

## 📊 Performance Monitoring

### 1. Response Time Monitoring

```javascript
// Monitor API response times
console.time('RankMath API');
const data = await getRankMathSEO(url);
console.timeEnd('RankMath API');
```

### 2. Cache Hit Rate

```javascript
// Monitor cache performance
console.log('Cache stats:', {
  hits: serverCache.getStats?.().hits || 0,
  misses: serverCache.getStats?.().misses || 0
});
```

### 3. Error Rate Tracking

```javascript
// Track API failures
let successCount = 0;
let errorCount = 0;

// After each API call:
if (result?.success) successCount++;
else errorCount++;

console.log(`Success rate: ${(successCount/(successCount+errorCount)*100).toFixed(1)}%`);
```

---

## 🔍 Common Meta Tags Reference

Rank Math API biasanya mengirim meta tags berikut:

```html
<!-- Basic SEO -->
<title>Page Title</title>
<meta name="description" content="Page description">
<meta name="robots" content="index, follow">

<!-- Focus Keyword (Rank Math specific) -->
<meta name="rankmath-focus-keyword" content="focus keyword">

<!-- Open Graph -->
<meta property="og:title" content="OG Title">
<meta property="og:description" content="OG Description">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:type" content="article">

<!-- Twitter -->
<meta name="twitter:title" content="Twitter Title">
<meta name="twitter:description" content="Twitter Description">
<meta name="twitter:image" content="https://example.com/image.jpg">
<meta name="twitter:card" content="summary_large_image">

<!-- Canonical -->
<link rel="canonical" href="https://example.com/post/">

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "keywords": "keyword1, keyword2, keyword3",
  "image": "https://example.com/image.jpg"
}
</script>
```

---

## ✅ Checklist Troubleshooting

### Backend WordPress:
- [ ] Rank Math Pro installed & activated
- [ ] Headless support enabled in Rank Math settings
- [ ] Focus keyword set untuk posts yang ditest
- [ ] Featured image set untuk posts yang ditest
- [ ] API endpoint accessible: `/wp-json/rankmath/v1/getHead`
- [ ] CORS configured untuk frontend domain

### Frontend Next.js:
- [ ] Environment variables set dengan benar
- [ ] `NEXT_PUBLIC_RANKMATH_API_ENABLED=true`
- [ ] `NEXT_PUBLIC_RANKMATH_API_URL` pointing ke correct endpoint
- [ ] Server restarted setelah environment changes
- [ ] Browser console shows no CORS errors

### Testing:
- [ ] `debugRankMath.config()` shows correct values
- [ ] `debugRankMath.test()` returns SUCCESS
- [ ] `debugRankMath.testUrl()` extracts focus keyword
- [ ] `debugRankMath.testUrl()` extracts thumbnail
- [ ] Server logs show successful API calls

---

Jika masih ada masalah setelah mengikuti panduan ini, periksa network tab di browser untuk melihat actual API requests dan responses. 