// This file configures the initialization of Sentry on the browser/client side
// The config you add here will be used whenever a page is visited
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Lower from 1.0 in production — errors are still captured at 100%,
    // this only samples performance transactions.
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',

    replaysOnErrorSampleRate: 1.0,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Session Replay is lazy-loaded after the page has settled (see below) so it
    // never sits on the critical rendering path. Do not add `replayIntegration`
    // to this list.

    beforeSend(event, _hint) {
      // Filter out development errors if needed
      if (process.env.NODE_ENV === 'development') {
        console.info('Sentry Event:', event);
      }
      return event;
    },

    // Environment configuration
    environment: process.env.NODE_ENV,

    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || '8.0.0',

    // Additional configuration
    initialScope: {
      tags: {
        component: 'client',
        app: 'techkwiz-quiz-app-v3'
      },
    },
  });

  // Load Session Replay only once the browser is idle (after LCP/TBT-critical
  // work), and always with text masked + media blocked.
  const loadReplay = () => {
    Sentry.lazyLoadIntegration('replayIntegration')
      .then(replayIntegration => {
        Sentry.addIntegration(
          replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          })
        );
      })
      .catch(error => {
        console.error('Failed to lazy-load Sentry Replay:', error);
      });
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(loadReplay);
  } else {
    window.setTimeout(loadReplay, 3000);
  }
}

// Export required hooks for Next.js integration (Sentry v10+)
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
