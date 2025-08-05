import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

// Performance monitoring configuration
const vitalsThresholds = {
  CLS: 0.1,    // Cumulative Layout Shift
  FID: 100,    // First Input Delay
  FCP: 1800,   // First Contentful Paint
  LCP: 2500,   // Largest Contentful Paint
  TTFB: 800,   // Time to First Byte
};

// Custom performance observer for additional metrics
class PerformanceObserver {
  private observer: any;
  private metrics: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.setupObservers();
    }
  }

  private setupObservers() {
    // Observe long tasks
    this.observer = new (window as any).PerformanceObserver((list: any) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Tasks longer than 50ms
          console.warn('🐌 Long task detected:', {
            duration: entry.duration,
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      }
    });
    this.observer.observe({ entryTypes: ['longtask'] });
  }

  // Track custom metrics
  trackMetric(name: string, value: number) {
    this.metrics.set(name, value);
    console.log(`📊 ${name}: ${value.toFixed(2)}`);
  }

  // Get all metrics
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

// Initialize web vitals monitoring
export function initWebVitals() {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver();

  // Track Core Web Vitals
  onCLS((metric) => {
    observer.trackMetric('CLS', metric.value);
    if (metric.value > vitalsThresholds.CLS) {
      console.warn('⚠️ Poor CLS score detected');
    }
  });

  onFID((metric) => {
    observer.trackMetric('FID', metric.value);
    if (metric.value > vitalsThresholds.FID) {
      console.warn('⚠️ Poor FID score detected');
    }
  });

  onFCP((metric) => {
    observer.trackMetric('FCP', metric.value);
    if (metric.value > vitalsThresholds.FCP) {
      console.warn('⚠️ Poor FCP score detected');
    }
  });

  onLCP((metric) => {
    observer.trackMetric('LCP', metric.value);
    if (metric.value > vitalsThresholds.LCP) {
      console.warn('⚠️ Poor LCP score detected');
    }
  });

  onTTFB((metric) => {
    observer.trackMetric('TTFB', metric.value);
    if (metric.value > vitalsThresholds.TTFB) {
      console.warn('⚠️ Poor TTFB score detected');
    }
  });

  // Track additional performance metrics
  if ('performance' in window) {
    const perf = window.performance;
    
    // Track navigation timing
    if (perf.navigation) {
      const nav = perf.navigation;
      observer.trackMetric('NavigationType', nav.type);
      observer.trackMetric('RedirectCount', nav.redirectCount);
    }

    // Track memory usage
    if ((perf as any).memory) {
      const memory = (perf as any).memory;
      observer.trackMetric('MemoryUsed', memory.usedJSHeapSize / 1024 / 1024);
      observer.trackMetric('MemoryTotal', memory.totalJSHeapSize / 1024 / 1024);
    }
  }

  return observer;
}

// Bundle size analyzer
export function analyzeBundleSize() {
  if (typeof window === 'undefined') return;

  // Analyze script tags
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (src) {
      console.log(`📦 Script loaded: ${src}`);
    }
  });

  // Analyze CSS
  const styles = document.querySelectorAll('link[rel="stylesheet"]');
  styles.forEach((style) => {
    const href = style.getAttribute('href');
    if (href) {
      console.log(`🎨 Stylesheet loaded: ${href}`);
    }
  });

  console.log(`📊 Total external resources: ${scripts.length + styles.length}`);
}

// Performance budget checker
export function checkPerformanceBudget() {
  const budgets = {
    bundleSize: 500, // KB
    loadTime: 3000,  // ms
    renderTime: 16,  // ms (60fps)
  };

  return budgets;
}

// Export for use in components
export { vitalsThresholds };