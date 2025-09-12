import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if DSN is provided
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1,
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || '8.0.0',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    initialScope: {
      tags: {
        component: 'client',
        app: 'techkwiz-v8'
      },
    },
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} else {
  console.log('Sentry DSN not provided, error monitoring disabled on client');
}