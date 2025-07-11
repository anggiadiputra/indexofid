'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { env } from '@/config/environment';

export default function AnalyticsWrapper() {
  return (
    <>
      {process.env.NODE_ENV === 'production' && (
        <Script 
          src="/_vercel/insights/script.js"
          strategy="lazyOnload"
          defer
          data-domain={env.site.url}
        />
      )}
    </>
  );
} 