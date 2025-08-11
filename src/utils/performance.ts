// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track bundle size
  trackBundleSize(bundleName: string, size: number): void {
    this.metrics.set(`bundle_${bundleName}`, size);
    console.log(`📦 Bundle ${bundleName}: ${(size / 1024).toFixed(2)} KB`);
  }

  // Track load time
  trackLoadTime(componentName: string, loadTime: number): void {
    this.metrics.set(`load_${componentName}`, loadTime);
    console.log(`⏱️ ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
  }

  // Track render time
  trackRenderTime(componentName: string, renderTime: number): void {
    this.metrics.set(`render_${componentName}`, renderTime);
    if (renderTime > 16) { // 60fps threshold
      console.warn(`🐌 Slow render detected for ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  // Get performance report
  getReport(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear();
  }
}

// React performance hooks
export const usePerformanceTracking = (componentName: string) => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    trackRender: (renderTime: number) => {
      monitor.trackRenderTime(componentName, renderTime);
    },
    trackLoad: (loadTime: number) => {
      monitor.trackLoadTime(componentName, loadTime);
    },
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined') {
    const performance = window.performance;
    if (performance && performance.memory) {
      const memory = performance.memory;
      console.log('🧠 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }
};

// Lazy loading performance tracker
export const trackLazyLoad = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    PerformanceMonitor.getInstance().trackLoadTime(componentName, loadTime);
  };
};