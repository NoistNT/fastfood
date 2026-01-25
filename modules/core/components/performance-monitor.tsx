'use client';

import { useEffect } from 'react';

// Performance monitoring for mobile optimization
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    let lcpObserver: PerformanceObserver | null = null;
    let fidObserver: PerformanceObserver | null = null;
    let clsObserver: PerformanceObserver | null = null;

    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          if (navigation) {
            const timing = {
              domContentLoaded:
                navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
              totalTime: navigation.loadEventEnd - navigation.fetchStart,
            };

            if (process.env.NODE_ENV === 'development') {
              console.log('Navigation Timing:', timing);

              // Log performance metrics for monitoring
              if (timing.totalTime > 3000) {
                console.warn('Slow page load detected:', timing.totalTime + 'ms');
              }
            }
          }
        }, 0);
      });
    }

    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memory = (
        performance as {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      const memoryUsage = {
        used: Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100 + ' MB',
        total: Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100 + ' MB',
        limit: Math.round((memory.jsHeapSizeLimit / 1048576) * 100) / 100 + ' MB',
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('Memory Usage:', memoryUsage);

        // Warn if memory usage is high
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
          console.warn('High memory usage detected:', usagePercent.toFixed(1) + '%');
        }
      }
    }

    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Largest Contentful Paint (LCP)
        lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (process.env.NODE_ENV === 'development') {
            console.log('LCP:', lastEntry.startTime + 'ms');

            if (lastEntry.startTime > 2500) {
              console.warn('Slow LCP detected:', lastEntry.startTime + 'ms');
            }
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor First Input Delay (FID)
        fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if ('processingStart' in entry) {
              const fidEntry = entry as { processingStart: number; startTime: number };
              if (process.env.NODE_ENV === 'development') {
                console.log('FID:', fidEntry.processingStart - fidEntry.startTime + 'ms');

                if (fidEntry.processingStart - fidEntry.startTime > 100) {
                  console.warn(
                    'Poor FID detected:',
                    fidEntry.processingStart - fidEntry.startTime + 'ms'
                  );
                }
              }
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if ('value' in entry && 'hadRecentInput' in entry) {
              const clsEntry = entry as { value: number; hadRecentInput: boolean };
              if (!clsEntry.hadRecentInput) {
                clsValue += clsEntry.value;
              }
            }
          });
          if (process.env.NODE_ENV === 'development') {
            console.log('CLS:', clsValue);

            if (clsValue > 0.1) {
              console.warn('High CLS detected:', clsValue);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (_error) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Performance monitoring not fully supported');
        }
      }
    }

    // Cleanup function
    return () => {
      if (lcpObserver) lcpObserver.disconnect();
      if (fidObserver) fidObserver.disconnect();
      if (clsObserver) clsObserver.disconnect();
    };
  }, []);

  return null;
}

// Preload critical resources
export function ResourcePreloader() {
  useEffect(() => {
    // Preload critical API data
    if ('serviceWorker' in navigator && 'caches' in window) {
      // Warm up cache for critical resources
      caches.open('fastfood-static-v1').then((cache) => {
        cache.match('/api/products').catch(() => {
          // Pre-fetch if not cached
          fetch('/api/products', { priority: 'low' as RequestPriority });
        });
      });
    }
  }, []);

  return null;
}

// Bundle size monitoring
export function BundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle size information
      if ('performance' in window && 'getEntriesByType' in performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const scripts = resources.filter((r) => r.initiatorType === 'script');

        console.log('Bundle Analysis:', {
          totalScripts: scripts.length,
          totalSize: scripts.reduce((acc, script) => acc + script.transferSize, 0),
          largestScript: Math.max(...scripts.map((s) => s.transferSize)),
        });
      }
    }
  }, []);

  return null;
}
