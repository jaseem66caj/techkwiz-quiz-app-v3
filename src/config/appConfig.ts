/**
 * Centralized application configuration
 * Contains all application-level constants and configuration values
 */

// Application metadata
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'TechKwiz',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '8.0.0',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost',

  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'development',

  // Feature flags
  FEATURES: {
    ENABLE_ERROR_TRACKING: process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING === 'true',
    ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_ADSENSE: process.env.NEXT_PUBLIC_ENABLE_ADSENSE === 'true',
    ENABLE_ADMIN_PANEL: process.env.NEXT_PUBLIC_ENABLE_ADMIN_PANEL === 'true',
    ENABLE_TEST_PAGES: process.env.NEXT_PUBLIC_ENABLE_TEST_PAGES === 'true',
  },

  // Analytics
  ANALYTICS: {
    GA4_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
    GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || '',
  },

  // Monetization
  ADSENSE: {
    PUBLISHER_ID: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || '',
  },

  // Error monitoring
  SENTRY: {
    DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    ORG: process.env.SENTRY_ORG || '',
    PROJECT: process.env.SENTRY_PROJECT || '',
  },

  // Development settings
  DEVELOPMENT: {
    DISABLE_HOT_RELOAD: process.env.DISABLE_HOT_RELOAD === 'true',
  },

  // API endpoints
  API: {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  },

  // Storage keys
  STORAGE: {
    USER_DATA: 'techkwiz_user_data',
    QUIZ_PROGRESS: 'techkwiz_quiz_progress',
    APP_ERRORS: 'techkwiz_app_errors',
    REVENUE_METRICS: 'techkwiz_revenue_metrics',
  },

  // Default values
  DEFAULTS: {
    QUIZ_QUESTION_COUNT: 5,
    COIN_BALANCE: 0,
  },

  // Timeouts and intervals
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    QUIZ_TRANSITION: 300, // 300ms
  },

  // UI settings
  UI: {
    ANIMATION_DURATION: 300,
    MOBILE_BREAKPOINT: 768,
  },
} as const;

// Export individual sections for easier imports
export const APP_METADATA = {
  NAME: APP_CONFIG.NAME,
  VERSION: APP_CONFIG.VERSION,
  URL: APP_CONFIG.URL,
  DOMAIN: APP_CONFIG.DOMAIN,
} as const;

export const FEATURE_FLAGS = APP_CONFIG.FEATURES;

export const ANALYTICS_CONFIG = APP_CONFIG.ANALYTICS;

export const ADSENSE_CONFIG = APP_CONFIG.ADSENSE;

export const SENTRY_CONFIG = APP_CONFIG.SENTRY;

export const STORAGE_KEYS = APP_CONFIG.STORAGE;

export const DEFAULT_VALUES = APP_CONFIG.DEFAULTS;

export const TIMEOUTS = APP_CONFIG.TIMEOUTS;

export const UI_SETTINGS = APP_CONFIG.UI;

// Environment-specific configurations
export const isDevelopment = APP_CONFIG.ENVIRONMENT === 'development';
export const isProduction = APP_CONFIG.ENVIRONMENT === 'production';
export const isTest = APP_CONFIG.ENVIRONMENT === 'test';

// Utility functions
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS) => {
  return FEATURE_FLAGS[feature] === true;
};

export const getStorageKey = (key: keyof typeof STORAGE_KEYS) => {
  return STORAGE_KEYS[key];
};

export const getTimeout = (timeout: keyof typeof TIMEOUTS) => {
  return TIMEOUTS[timeout];
};
