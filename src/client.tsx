import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'
import * as Sentry from '@sentry/react'

import { createRouter } from './router'
import { initSentry } from './sentry'
import { initWebVitals, analyzeBundleSize } from './utils/web-vitals'

// Initialize Sentry (will be skipped if DSN is not defined)
initSentry()

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Initialize web vitals monitoring
  initWebVitals();
  
  // Analyze bundle size after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      analyzeBundleSize();
    }, 1000);
  });
}

const router = createRouter()

// Check if Sentry DSN is defined before creating error boundary
const AppComponent = process.env.SENTRY_DSN
  ? Sentry.withErrorBoundary(StartClient, {
      fallback: () => <div>An error has occurred. Our team has been notified.</div>,
    })
  : StartClient

hydrateRoot(document, <AppComponent router={router} />)
