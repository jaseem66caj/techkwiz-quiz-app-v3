import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Basic health check
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '8.0.0',
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    // Log error to console
    console.error('Health check failed:', error)

    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'HealthAPI',
        endpoint: '/api/health'
      }
    })

    // Return error response
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

