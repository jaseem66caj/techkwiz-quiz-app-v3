# Sentry Error Resolution

## Error

Sentry Logger [error]: "Transport disabled"

## Root Cause

The Sentry initialization was disabled in `src/instrumentation.ts`. The `register` function, which is responsible for initializing Sentry for both the Node.js and edge runtimes, was commented out. Additionally, the `onRequestError` function, which captures errors and sends them to Sentry, was also disabled.

## Resolution

To resolve this issue, I have re-enabled the Sentry initialization by uncommenting the `register` and `onRequestError` functions in `src/instrumentation.ts`. This will ensure that the Sentry SDK is properly initialized and that errors are captured and sent to Sentry.