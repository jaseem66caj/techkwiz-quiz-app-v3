import * as Sentry from '@sentry/nextjs';
import { isDevelopment } from '../config';

/**
 * Centralized logging utility for TechKwiz application
 * Provides structured, consistent logging with multiple levels and Sentry integration
 */

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Log entry interface
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: number;
  component?: string;
  userId?: string;
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableSentry: boolean;
  component?: string;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isDevelopment ? 'debug' : 'info',
  enableConsole: true,
  enableSentry: true,
};

// Log level priorities (for filtering)
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Log an error message
   */
  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }

  /**
   * Log an error with Error object
   */
  errorWithException(error: Error, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
    };

    this.log('error', error.message, errorContext);

    // Report to Sentry if enabled
    if (this.config.enableSentry) {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
        tags: {
          component: this.config.component,
        },
      });
    }
  }

  /**
   * Log a message with specified level
   */
  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    // Check if log level meets minimum threshold
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.config.minLevel]) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      context,
      timestamp: Date.now(),
      component: this.config.component,
    };

    // Log to console if enabled
    if (this.config.enableConsole) {
      this.logToConsole(logEntry);
    }

    // Log to Sentry if enabled and level is warn or error
    if (this.config.enableSentry && (level === 'warn' || level === 'error')) {
      this.logToSentry(logEntry);
    }

    // Store in localStorage for debugging if in browser environment
    if (typeof window !== 'undefined' && level === 'error') {
      this.storeErrorLocally(logEntry);
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]${entry.component ? ` [${entry.component}]` : ''}`;

    const logArgs: any[] = [prefix, entry.message];
    if (entry.context) {
      logArgs.push(entry.context);
    }

    switch (entry.level) {
      case 'debug':
        console.debug.apply(console, logArgs);
        break;
      case 'info':
        console.info.apply(console, logArgs);
        break;
      case 'warn':
        console.warn.apply(console, logArgs);
        break;
      case 'error':
        console.error.apply(console, logArgs);
        break;
    }
  }

  /**
   * Log to Sentry
   */
  private logToSentry(entry: LogEntry): void {
    const sentryContext = {
      ...entry.context,
      component: entry.component,
      timestamp: entry.timestamp,
    };

    if (entry.level === 'error') {
      Sentry.captureMessage(entry.message, {
        level: 'error',
        contexts: {
          logEntry: sentryContext,
        },
        tags: {
          component: entry.component,
          logLevel: entry.level,
        },
      });
    } else if (entry.level === 'warn') {
      Sentry.captureMessage(entry.message, {
        level: 'warning',
        contexts: {
          logEntry: sentryContext,
        },
        tags: {
          component: entry.component,
          logLevel: entry.level,
        },
      });
    }
  }

  /**
   * Store error in localStorage for debugging
   */
  private storeErrorLocally(entry: LogEntry): void {
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(entry);

      // Keep only last 20 errors to prevent storage bloat
      const recentErrors = existingErrors.slice(-20);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      // Ignore storage errors to prevent infinite loops
      console.warn('Failed to store error in localStorage:', storageError);
    }
  }

  /**
   * Get stored errors from localStorage
   */
  getStoredErrors(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_errors') || '[]');
    } catch (error) {
      console.warn('Failed to retrieve stored errors:', error);
      return [];
    }
  }

  /**
   * Clear stored errors
   */
  clearStoredErrors(): void {
    try {
      localStorage.removeItem('app_errors');
    } catch (error) {
      console.warn('Failed to clear stored errors:', error);
    }
  }

  /**
   * Create a child logger with additional context
   */
  createChild(component: string): Logger {
    return new Logger({
      ...this.config,
      component,
    });
  }
}

// Create and export default logger instance
export const logger = new Logger();

// Export Logger class for creating custom loggers
export default Logger;
