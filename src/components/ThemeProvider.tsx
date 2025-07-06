'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Remove any existing theme class to prevent flashing
    document.documentElement.classList.remove('light', 'dark');
    
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

    // Add optimized transition handling for theme switching
    const handleThemeChange = () => {
      // Temporarily disable transitions during theme change
      document.documentElement.style.setProperty('--theme-transition', 'none');
      
      // Re-enable transitions after a brief delay
      requestAnimationFrame(() => {
        setTimeout(() => {
          document.documentElement.style.removeProperty('--theme-transition');
        }, 50);
      });
    };

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      storageKey="wphead-ui-theme"
      enableColorScheme={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from 'next-themes'; 