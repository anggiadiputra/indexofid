'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wphead-ui-theme');
      if (stored === 'light' || stored === 'dark') {
        document.documentElement.classList.add(stored);
      } else {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');
      }
    } catch (e) {
      document.documentElement.classList.add('light');
    }
  }, []);

  return null;
} 