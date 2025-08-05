import type * as SentryType from '@sentry/react';

// Dynamically initialise Sentry only when it is actually configured via VITE_SENTRY_DSN.
export async function initSentry() {
  // Skip initialisation entirely when no DSN is supplied – this removes
  // @sentry/react (~250 kB) from the default client bundle and from local
  // development builds.
  if (!import.meta.env.VITE_SENTRY_DSN) {
    return null;
  }

  // Dynamically load the heavy Sentry bundle in its own chunk.
  const Sentry = (await import('@sentry/react')) as typeof SentryType;

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring – keep sampling aggressive in dev, lower in prod.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });

  return Sentry;
}