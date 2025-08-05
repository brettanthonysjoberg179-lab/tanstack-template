import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'

import { createRouter } from './router'
import { initSentry } from './sentry'

let streamHandler = defaultStreamHandler;

// Only attempt to load & use Sentry when a DSN is configured
if (process.env.SENTRY_DSN) {
  streamHandler = async (options) => {
    try {
      return await defaultStreamHandler(options);
    } catch (error) {
      const Sentry = await initSentry();
      if (Sentry) {
        Sentry.captureException(error);
      }
      throw error;
    }
  };
}

export default createStartHandler({
  createRouter,
  getRouterManifest,
})(streamHandler)
