import React from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConvexClientProvider } from '../convex'
import * as Sentry from '@sentry/react'

function RootComponent() {
  // Preload critical resources
  React.useEffect(() => {
    // Preload critical fonts and assets
    const preloadCriticalResources = () => {
      // Preload web fonts for better text rendering performance
      const fontPreload = document.createElement('link');
      fontPreload.rel = 'preload';
      fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontPreload.as = 'style';
      fontPreload.crossOrigin = 'anonymous';
      document.head.appendChild(fontPreload);

      // Preconnect to external domains for faster API calls
      const anthropicPreconnect = document.createElement('link');
      anthropicPreconnect.rel = 'preconnect';
      anthropicPreconnect.href = 'https://api.anthropic.com';
      document.head.appendChild(anthropicPreconnect);

      const convexPreconnect = document.createElement('link');
      convexPreconnect.rel = 'preconnect';
      convexPreconnect.href = import.meta.env.VITE_CONVEX_URL || '';
      if (convexPreconnect.href) {
        document.head.appendChild(convexPreconnect);
      }
    };

    // Use requestIdleCallback for non-critical preloading
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadCriticalResources);
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadCriticalResources, 1);
    }

    // Add performance observer for monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID:', entry.processingStart - entry.startTime);
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Ignore if not supported
      }
    }
  }, []);

  return (
    <>
      {/* Critical CSS should be inlined here for faster rendering */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Critical above-the-fold CSS */
          html, body, #root {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #111827;
            color: #f9fafb;
          }
          
          /* Loading skeleton for immediate feedback */
          .app-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #111827;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #374151;
            border-top: 4px solid #f97316;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
      
      <ConvexClientProvider>
        <Sentry.ErrorBoundary fallback={({ error }) => (
          <div className="app-loading">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-red-500 mb-2">Something went wrong</h1>
              <p className="text-gray-400">{error.message}</p>
            </div>
          </div>
        )}>
          <Outlet />
        </Sentry.ErrorBoundary>
      </ConvexClientProvider>
      
      {process.env.NODE_ENV === 'development' && (
        <React.Suspense fallback={null}>
          <TanStackRouterDevtools />
        </React.Suspense>
      )}
    </>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
