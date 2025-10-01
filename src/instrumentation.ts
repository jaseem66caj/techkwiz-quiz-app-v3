export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = async (err: unknown, request: any, context: any) => {
  try {
    const { captureRequestError } = await import('@sentry/nextjs')
    captureRequestError(err, request, context)
  } catch (error) {
    // Sentry not available, log to console instead
    console.error('Error capturing request error:', error, err)
  }
}