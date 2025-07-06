'use client';

import Script from 'next/script';

export default function AnalyticsWrapper() {
  return (
    <>
      {/* Vercel Analytics via Script tag instead of component */}
      <Script 
        src="/_vercel/insights/script.js"
        strategy="afterInteractive"
      />
    </>
  );
} 