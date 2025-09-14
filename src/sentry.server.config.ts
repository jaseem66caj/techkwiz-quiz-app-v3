import * as Sentry from "@sentry/nextjs";

// Only initialize Sentry if we have a DSN
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1,
    debug: process.env.NODE_ENV === 'development',
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION || '8.0.0',
    beforeSend(event, hint) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Server Event:', event);
      }
      return event;
    },
    initialScope: {
      tags: {
        component: 'server',
        app: 'techkwiz-quiz-app-v3'
      },
    },
  });
}