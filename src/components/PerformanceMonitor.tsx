'use client';

import { useEffect, useState, useCallback } from 'react';
import { cacheManager } from '@/lib/cache-manager';

interface PerformanceMetrics {
  lcp?: number;      // Largest Contentful Paint
  fid?: number;      // First Input Delay  
  cls?: number;      // Cumulative Layout Shift
  fcp?: number;      // First Contentful Paint
  ttfb?: number;     // Time to First Byte
  loadTime?: number; // Page load time
}

interface CacheMetrics {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  hitRate: number;
  maxSize: number;
}

interface TTFBMetrics {
  current: number;
  average: number;
  samples: number;
  threshold: number;
}

export default function PerformanceMonitor({ 
  showMetrics = false, 
  className = '' 
}: { 
  showMetrics?: boolean; 
  className?: string; 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [cacheMetrics, setCacheMetrics] = useState<CacheMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // TTFB tracking
  const [ttfbMetrics, setTtfbMetrics] = useState<TTFBMetrics>({
    current: 0,
    average: 0,
    samples: 0,
    threshold: 600, // 600ms threshold for good TTFB
  });

  useEffect(() => {
    // Measure Core Web Vitals
    const measurePerformance = () => {
      // FCP - First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          setMetrics(prev => ({ ...prev, fcp: fcp.startTime }));
        }
      });
      observer.observe({ entryTypes: ['paint'] });

      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue;
          clsValue += (entry as any).value;
          setMetrics(prev => ({ ...prev, cls: clsValue }));
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // TTFB - Time to First Byte
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0] as PerformanceNavigationTiming;
        setMetrics(prev => ({ 
          ...prev, 
          ttfb: navEntry.responseStart - navEntry.requestStart,
          loadTime: navEntry.loadEventEnd - navEntry.fetchStart 
        }));
      }

      // Clean up observers
      return () => {
        observer.disconnect();
        lcpObserver.disconnect();
        clsObserver.disconnect();
      };
    };

    const cleanup = measurePerformance();

    // Update cache metrics every 30 seconds
    const updateCacheMetrics = () => {
      setCacheMetrics(cacheManager.getStats());
    };

    updateCacheMetrics();
    const interval = setInterval(updateCacheMetrics, 30000);

    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, []);

  // Enhanced TTFB measurement
  const measureTTFB = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation && navigation.responseStart && navigation.requestStart) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        
        setTtfbMetrics(prev => {
          const newSamples = prev.samples + 1;
          const newAverage = ((prev.average * prev.samples) + ttfb) / newSamples;
          
          return {
            current: ttfb,
            average: newAverage,
            samples: newSamples,
            threshold: prev.threshold,
          };
        });

        return ttfb;
      }
    }
    return 0;
  }, []);

  // Performance score calculation
  const calculateScore = (metric: number | undefined, thresholds: [number, number]): 'good' | 'needs-improvement' | 'poor' | 'unknown' => {
    if (metric === undefined) return 'unknown';
    if (metric <= thresholds[0]) return 'good';
    if (metric <= thresholds[1]) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string): string => {
    switch (score) {
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'needs-improvement': return 'text-yellow-600 dark:text-yellow-400';
      case 'poor': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getPerformanceScore = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fcp: { good: 1800, poor: 3000 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 600, poor: 1200 }, // Enhanced TTFB thresholds
      loadTime: { good: 3000, poor: 5000 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const updateMetrics = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Measure TTFB first
    const ttfb = measureTTFB();

    // ... existing metrics code ...

    const newMetrics: PerformanceMetrics = {
      lcp: 0,
      fcp: 0,
      cls: 0,
      ttfb,
      loadTime: performance.now(),
    };

    // ... existing performance measurement code ...

    setMetrics(newMetrics);

    // Update cache stats
    const stats = cacheManager.getStats();
    setCacheMetrics({
      totalEntries: stats.totalEntries,
      validEntries: stats.validEntries,
      expiredEntries: stats.expiredEntries,
      hitRate: stats.hitRate,
      maxSize: stats.maxSize,
    });
  }, [measureTTFB]);

  if (!showMetrics && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <>
      {/* Toggle Button (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Performance Metrics"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}

      {/* Performance Panel */}
      {(showMetrics || isVisible) && (
        <div className={`fixed bottom-20 right-4 z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-sm ${className}`}>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* TTFB Alert */}
            {ttfbMetrics.current > ttfbMetrics.threshold && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-600 dark:text-red-400 mr-2">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      High TTFB Detected
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Current: {Math.round(ttfbMetrics.current)}ms (Target: &lt;{ttfbMetrics.threshold}ms)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Core Web Vitals */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Core Web Vitals</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>LCP (Largest Contentful Paint):</span>
                  <span className={getScoreColor(calculateScore(metrics.lcp, [2500, 4000]))}>
                    {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'Measuring...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FCP (First Contentful Paint):</span>
                  <span className={getScoreColor(calculateScore(metrics.fcp, [1800, 3000]))}>
                    {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'Measuring...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CLS (Cumulative Layout Shift):</span>
                  <span className={getScoreColor(calculateScore(metrics.cls, [0.1, 0.25]))}>
                    {metrics.cls !== undefined ? metrics.cls.toFixed(3) : 'Measuring...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>TTFB (Time to First Byte):</span>
                  <span className={getScoreColor(calculateScore(metrics.ttfb, [600, 1200]))}>
                    {metrics.ttfb ? `${Math.round(metrics.ttfb)}ms` : 'Measuring...'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Performance */}
            {cacheMetrics && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cache Performance</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Cache Entries:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {cacheMetrics.validEntries}/{cacheMetrics.maxSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hit Rate:</span>
                    <span className={cacheMetrics.hitRate > 0.7 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                      {Math.round(cacheMetrics.hitRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Entries:</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {cacheMetrics.expiredEntries}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Load Time */}
            {metrics.loadTime && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Page Load</h4>
                <div className="flex justify-between text-xs">
                  <span>Total Load Time:</span>
                  <span className={getScoreColor(calculateScore(metrics.loadTime, [2000, 4000]))}>
                    {Math.round(metrics.loadTime)}ms
                  </span>
                </div>
              </div>
            )}

            {/* Performance Tips */}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Good (&lt; 2.5s LCP)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Needs improvement</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>Poor (&gt; 4s LCP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 