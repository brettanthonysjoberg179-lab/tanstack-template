import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start'

import { createRouter } from './router'
import { initSentry } from './sentry'

const router = createRouter();

(async () => {
  const Sentry = await initSentry();

  const AppComponent = Sentry
    ? Sentry.withErrorBoundary(StartClient, {
        fallback: () => (
          <div>An error has occurred. Our team has been notified.</div>
        ),
      })
    : StartClient;

  hydrateRoot(document, <AppComponent router={router} />);
})();
