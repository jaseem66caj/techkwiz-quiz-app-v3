// System settings interface
export interface SystemSettings {
  id: string
  siteName: string
  siteDescription: string
  logoUrl: string
  faviconUrl: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  maintenanceMode: boolean
  maintenanceMessage: string
  featureFlags: {
    [key: string]: boolean
  }
  performance: {
    cacheEnabled: boolean
    cacheDuration: number
    lazyLoading: boolean
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
    openGraph: {
      title: string
      description: string
      image: string
    }
  }
  analytics: {
    googleAnalyticsId: string
    hotjarId: string
    matomoUrl: string
  }
  createdAt: number
  updatedAt: number
}

// User preferences interface
export interface UserPreferences {
  id: string
  userId: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    inApp: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    activityVisibility: 'public' | 'friends' | 'private'
    dataSharing: boolean
  }
  accessibility: {
    fontSize: 'small' | 'medium' | 'large'
    highContrast: boolean
    screenReader: boolean
  }
  display: {
    theme: 'light' | 'dark' | 'auto'
    animations: boolean
    compactMode: boolean
  }
  createdAt: number
  updatedAt: number
}

// Security settings interface
export interface SecuritySettings {
  id: string
  passwordPolicy: {
    minLength: number
    requireNumbers: boolean
    requireSpecialChars: boolean
    requireUppercase: boolean
    requireLowercase: boolean
    expirationDays: number
  }
  twoFactorAuth: {
    enabled: boolean
    methods: ('sms' | 'email' | 'authenticator')[]
  }
  session: {
    timeoutMinutes: number
    maxSessions: number
    ipLocking: boolean
  }
  rateLimiting: {
    requestsPerMinute: number
    burstLimit: number
    blockDuration: number
  }
  auditLogging: {
    enabled: boolean
    retentionDays: number
  }
  createdAt: number
  updatedAt: number
}

// Integration settings interface
export interface IntegrationSettings {
  id: string
  apiConfiguration: {
    baseUrl: string
    timeout: number
    retries: number
    headers: {
      [key: string]: string
    }
  }
  thirdPartyServices: {
    google: {
      clientId: string
      enabled: boolean
    }
    facebook: {
      appId: string
      enabled: boolean
    }
    twitter: {
      apiKey: string
      enabled: boolean
    }
  }
  webhooks: {
    quizCompleted: {
      url: string
      enabled: boolean
      secret: string
    }
    userRegistered: {
      url: string
      enabled: boolean
      secret: string
    }
  }
  createdAt: number
  updatedAt: number
}

// Settings storage keys
export const SETTINGS_STORAGE_KEYS = {
  SYSTEM: 'admin_system_settings',
  USER_PREFERENCES: 'admin_user_preferences',
  SECURITY: 'admin_security_settings',
  INTEGRATIONS: 'admin_integration_settings',
  BACKUP: 'admin_settings_backup'
} as const

// Default system settings
export const DEFAULT_SYSTEM_SETTINGS: Omit<SystemSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  siteName: 'TechKwiz',
  siteDescription: 'Interactive Tech Quiz Game',
  logoUrl: '/logo.png',
  faviconUrl: '/favicon.ico',
  theme: 'auto',
  language: 'en',
  timezone: 'UTC',
  maintenanceMode: false,
  maintenanceMessage: 'Site is currently under maintenance',
  featureFlags: {
    enableRewards: true,
    enableAchievements: true,
    enableLeaderboard: true,
    enableSocialSharing: true,
    enableAnalytics: true
  },
  performance: {
    cacheEnabled: true,
    cacheDuration: 300000, // 5 minutes
    lazyLoading: true
  },
  seo: {
    metaTitle: 'TechKwiz - Interactive Tech Quiz Game',
    metaDescription: 'Test your knowledge with our interactive tech quizzes. Earn coins and compete with friends!',
    metaKeywords: 'quiz, tech, games, entertainment, education',
    openGraph: {
      title: 'TechKwiz',
      description: 'Interactive Tech Quiz Game',
      image: '/og-image.png'
    }
  },
  analytics: {
    googleAnalyticsId: '',
    hotjarId: '',
    matomoUrl: ''
  }
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    inApp: true
  },
  privacy: {
    profileVisibility: 'public',
    activityVisibility: 'friends',
    dataSharing: false
  },
  accessibility: {
    fontSize: 'medium',
    highContrast: false,
    screenReader: false
  },
  display: {
    theme: 'auto',
    animations: true,
    compactMode: false
  }
}

// Default security settings
export const DEFAULT_SECURITY_SETTINGS: Omit<SecuritySettings, 'id' | 'createdAt' | 'updatedAt'> = {
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
    requireUppercase: true,
    requireLowercase: true,
    expirationDays: 90
  },
  twoFactorAuth: {
    enabled: false,
    methods: ['authenticator']
  },
  session: {
    timeoutMinutes: 30,
    maxSessions: 5,
    ipLocking: false
  },
  rateLimiting: {
    requestsPerMinute: 60,
    burstLimit: 10,
    blockDuration: 300000 // 5 minutes
  },
  auditLogging: {
    enabled: true,
    retentionDays: 30
  }
}

// Default integration settings
export const DEFAULT_INTEGRATION_SETTINGS: Omit<IntegrationSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  apiConfiguration: {
    baseUrl: 'https://api.techkwiz.com',
    timeout: 10000,
    retries: 3,
    headers: {}
  },
  thirdPartyServices: {
    google: {
      clientId: '',
      enabled: false
    },
    facebook: {
      appId: '',
      enabled: false
    },
    twitter: {
      apiKey: '',
      enabled: false
    }
  },
  webhooks: {
    quizCompleted: {
      url: '',
      enabled: false,
      secret: ''
    },
    userRegistered: {
      url: '',
      enabled: false,
      secret: ''
    }
  }
}