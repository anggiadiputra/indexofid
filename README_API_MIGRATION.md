# 🔄 Cara Ganti WordPress API ke Domain Lain

## 📋 **Setup Awal (Satu Domain)**

Buat file `.env.local` di root project dengan konfigurasi ini:

```bash
# Satu domain untuk semua endpoint
WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2

# Opsional: fallback (bisa sama dengan primary atau beda domain)
NEXT_PUBLIC_FALLBACK_API_URL=https://backend.indexof.id/wp-json/wp/v2
```

## 🚀 **Cara Migrasi ke Domain Baru**

### **Step 1: Update Environment Variables**

Edit file `.env.local`, ganti domain lama dengan domain baru:

```bash
# Sebelum (domain lama)
WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_FALLBACK_API_URL=https://backend.indexof.id/wp-json/wp/v2

# Sesudah (domain baru)
WORDPRESS_API_URL=https://domain-baru.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://domain-baru.com/wp-json/wp/v2
NEXT_PUBLIC_FALLBACK_API_URL=https://domain-baru.com/wp-json/wp/v2
```

### **Step 2: Update Image Domains**

Edit `next.config.js`, tambahkan domain baru di `remotePatterns`:

```javascript
images: {
  remotePatterns: [
    // Domain lama (bisa dihapus setelah migrasi selesai)
    {
      protocol: 'https',
      hostname: 'backend.indexof.id',
      pathname: '/wp-content/uploads/**',
    },
    // Domain baru
    {
      protocol: 'https',
      hostname: 'domain-baru.com',
      pathname: '/wp-content/uploads/**',
    },
  ],
}
```

### **Step 3: Restart Server**

```bash
npm run dev
```

## 🧪 **Testing Migration**

### **Option 1: Test API Health**
```bash
# Buka browser console di website Anda, jalankan:
fetch('https://domain-baru.com/wp-json/wp/v2/posts?per_page=1')
  .then(res => res.json())
  .then(data => console.log('API working:', data))
```

### **Option 2: Gradual Migration (Aman)**
```bash
# Phase 1: Test domain baru sebagai fallback dulu
WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://backend.indexof.id/wp-json/wp/v2
NEXT_PUBLIC_FALLBACK_API_URL=https://domain-baru.com/wp-json/wp/v2

# Phase 2: Setelah yakin OK, swap ke domain baru
WORDPRESS_API_URL=https://domain-baru.com/wp-json/wp/v2
NEXT_PUBLIC_WORDPRESS_API_URL=https://domain-baru.com/wp-json/wp/v2
NEXT_PUBLIC_FALLBACK_API_URL=https://domain-baru.com/wp-json/wp/v2
```

## 🎯 **Contoh Kasus Nyata**

### **Migrasi dari Subdomain ke Domain Utama:**
```bash
# Dari
https://backend.indexof.id/wp-json/wp/v2

# Ke  
https://indexof.id/wp-json/wp/v2
```

### **Migrasi ke Provider Hosting Baru:**
```bash
# Dari
https://old-hosting.com/wp-json/wp/v2

# Ke
https://new-hosting.com/wp-json/wp/v2
```

## ⚠️ **Catatan Penting**

1. **Backup Data**: Pastikan domain baru memiliki data WordPress yang sama
2. **CORS Settings**: Pastikan domain baru mengizinkan request dari domain Next.js Anda
3. **SSL Certificate**: Pastikan domain baru memiliki HTTPS
4. **Test Endpoints**: Pastikan semua endpoint WordPress berfungsi di domain baru

## 🔧 **Troubleshooting**

### **Error: CORS**
Tambahkan di WordPress `functions.php`:
```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://your-nextjs-domain.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Credentials: true');
        return $value;
    });
});
```

### **Error: Images Not Loading**
Pastikan domain baru sudah ditambahkan di `next.config.js` → `images.remotePatterns`

### **Error: API Not Found**
Pastikan WordPress REST API aktif dan bisa diakses:
- Test: `https://domain-baru.com/wp-json/wp/v2/posts` 