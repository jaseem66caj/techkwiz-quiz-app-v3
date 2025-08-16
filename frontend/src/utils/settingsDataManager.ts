import { 
  SystemSettings, 
  UserPreferences, 
  SecuritySettings, 
  IntegrationSettings,
  SETTINGS_STORAGE_KEYS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_SECURITY_SETTINGS
} from '@/types/admin'

class SettingsDataManager {
  private static instance: SettingsDataManager
  private readonly SETTINGS_VERSION = '1.0.0'

  static getInstance(): SettingsDataManager {
    if (!SettingsDataManager.instance) {
      SettingsDataManager.instance = new SettingsDataManager()
    }
    return SettingsDataManager.instance
  }

  // System Settings Management
  getSystemSettings(): SystemSettings {
    // Return default settings if not on client side
    if (typeof window === 'undefined') {
      return this.createDefaultSystemSettings()
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEYS.SYSTEM)
      if (stored) {
        const parsed = JSON.parse(stored)
        return this.validateSystemSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading system settings:', error)
    }

    return this.createDefaultSystemSettings()
  }

  saveSystemSettings(settings: Partial<SystemSettings>): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const current = this.getSystemSettings()
      const updated: SystemSettings = {
        ...current,
        ...settings,
        updatedAt: Date.now()
      }

      const validated = this.validateSystemSettings(updated)
      localStorage.setItem(SETTINGS_STORAGE_KEYS.SYSTEM, JSON.stringify(validated))
      return true
    } catch (error) {
      console.error('Error saving system settings:', error)
      return false
    }
  }

  // User Preferences Management
  getUserPreferences(): UserPreferences {
    // Return default preferences if not on client side
    if (typeof window === 'undefined') {
      return this.createDefaultUserPreferences()
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEYS.USER_PREFERENCES)
      if (stored) {
        const parsed = JSON.parse(stored)
        return this.validateUserPreferences(parsed)
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    }

    return this.createDefaultUserPreferences()
  }

  saveUserPreferences(preferences: Partial<UserPreferences>): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const current = this.getUserPreferences()
      const updated: UserPreferences = {
        ...current,
        ...preferences,
        updatedAt: Date.now()
      }

      const validated = this.validateUserPreferences(updated)
      localStorage.setItem(SETTINGS_STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(validated))
      return true
    } catch (error) {
      console.error('Error saving user preferences:', error)
      return false
    }
  }

  // Security Settings Management
  getSecuritySettings(): SecuritySettings {
    // Return default settings if not on client side
    if (typeof window === 'undefined') {
      return this.createDefaultSecuritySettings()
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEYS.SECURITY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return this.validateSecuritySettings(parsed)
      }
    } catch (error) {
      console.error('Error loading security settings:', error)
    }

    return this.createDefaultSecuritySettings()
  }

  saveSecuritySettings(settings: Partial<SecuritySettings>): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const current = this.getSecuritySettings()
      const updated: SecuritySettings = {
        ...current,
        ...settings,
        updatedAt: Date.now()
      }

      const validated = this.validateSecuritySettings(updated)
      localStorage.setItem(SETTINGS_STORAGE_KEYS.SECURITY, JSON.stringify(validated))
      return true
    } catch (error) {
      console.error('Error saving security settings:', error)
      return false
    }
  }

  // Integration Settings Management
  getIntegrationSettings(): IntegrationSettings {
    // Return default settings if not on client side
    if (typeof window === 'undefined') {
      return this.createDefaultIntegrationSettings()
    }

    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEYS.INTEGRATIONS)
      if (stored) {
        const parsed = JSON.parse(stored)
        return this.validateIntegrationSettings(parsed)
      }
    } catch (error) {
      console.error('Error loading integration settings:', error)
    }

    return this.createDefaultIntegrationSettings()
  }

  saveIntegrationSettings(settings: Partial<IntegrationSettings>): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const current = this.getIntegrationSettings()
      const updated: IntegrationSettings = {
        ...current,
        ...settings,
        updatedAt: Date.now()
      }

      const validated = this.validateIntegrationSettings(updated)
      localStorage.setItem(SETTINGS_STORAGE_KEYS.INTEGRATIONS, JSON.stringify(validated))
      return true
    } catch (error) {
      console.error('Error saving integration settings:', error)
      return false
    }
  }

  // Backup and Restore
  createBackup(): string {
    try {
      const backup = {
        version: this.SETTINGS_VERSION,
        timestamp: Date.now(),
        systemSettings: this.getSystemSettings(),
        userPreferences: this.getUserPreferences(),
        securitySettings: this.getSecuritySettings(),
        integrationSettings: this.getIntegrationSettings()
      }
      
      return JSON.stringify(backup, null, 2)
    } catch (error) {
      console.error('Error creating backup:', error)
      throw new Error('Failed to create backup')
    }
  }

  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)
      
      // Validate backup structure
      if (!backup.version || !backup.systemSettings || !backup.userPreferences) {
        throw new Error('Invalid backup format')
      }
      
      // Restore each section
      this.saveSystemSettings(backup.systemSettings)
      this.saveUserPreferences(backup.userPreferences)
      this.saveSecuritySettings(backup.securitySettings)
      this.saveIntegrationSettings(backup.integrationSettings)
      
      return true
    } catch (error) {
      console.error('Error restoring backup:', error)
      return false
    }
  }

  // Reset to defaults
  resetToDefaults(): boolean {
    // Return false if not on client side
    if (typeof window === 'undefined') {
      return false
    }

    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEYS.SYSTEM)
      localStorage.removeItem(SETTINGS_STORAGE_KEYS.USER_PREFERENCES)
      localStorage.removeItem(SETTINGS_STORAGE_KEYS.SECURITY)
      localStorage.removeItem(SETTINGS_STORAGE_KEYS.INTEGRATIONS)
      return true
    } catch (error) {
      console.error('Error resetting to defaults:', error)
      return false
    }
  }

  // Validation methods
  private validateSystemSettings(settings: any): SystemSettings {
    return {
      id: settings.id || `system_${Date.now()}`,
      applicationName: settings.applicationName || DEFAULT_SYSTEM_SETTINGS.applicationName,
      applicationVersion: settings.applicationVersion || DEFAULT_SYSTEM_SETTINGS.applicationVersion,
      maintenanceMode: Boolean(settings.maintenanceMode),
      debugMode: Boolean(settings.debugMode),
      logLevel: ['error', 'warn', 'info', 'debug'].includes(settings.logLevel) ? settings.logLevel : 'info',
      maxUsers: Math.max(1, Math.min(1000, Number(settings.maxUsers) || 100)),
      sessionTimeout: Math.max(5, Math.min(120, Number(settings.sessionTimeout) || 30)),
      autoBackup: Boolean(settings.autoBackup),
      backupFrequency: ['daily', 'weekly', 'monthly'].includes(settings.backupFrequency) ? settings.backupFrequency : 'weekly',
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  private validateUserPreferences(preferences: any): UserPreferences {
    return {
      id: preferences.id || `user_${Date.now()}`,
      theme: ['light', 'dark', 'auto'].includes(preferences.theme) ? preferences.theme : 'light',
      language: preferences.language || 'en',
      timezone: preferences.timezone || 'UTC',
      dateFormat: preferences.dateFormat || 'MM/DD/YYYY',
      timeFormat: ['12h', '24h'].includes(preferences.timeFormat) ? preferences.timeFormat : '12h',
      dashboardLayout: ['compact', 'comfortable', 'spacious'].includes(preferences.dashboardLayout) ? preferences.dashboardLayout : 'comfortable',
      notifications: {
        emailNotifications: Boolean(preferences.notifications?.emailNotifications ?? true),
        pushNotifications: Boolean(preferences.notifications?.pushNotifications ?? false),
        systemAlerts: Boolean(preferences.notifications?.systemAlerts ?? true),
        maintenanceAlerts: Boolean(preferences.notifications?.maintenanceAlerts ?? true),
        securityAlerts: Boolean(preferences.notifications?.securityAlerts ?? true),
        digestFrequency: ['immediate', 'hourly', 'daily', 'weekly'].includes(preferences.notifications?.digestFrequency) ? preferences.notifications.digestFrequency : 'daily'
      },
      accessibility: {
        highContrast: Boolean(preferences.accessibility?.highContrast ?? false),
        largeText: Boolean(preferences.accessibility?.largeText ?? false),
        reducedMotion: Boolean(preferences.accessibility?.reducedMotion ?? false),
        screenReader: Boolean(preferences.accessibility?.screenReader ?? false),
        keyboardNavigation: Boolean(preferences.accessibility?.keyboardNavigation ?? true)
      },
      createdAt: preferences.createdAt || Date.now(),
      updatedAt: preferences.updatedAt || Date.now()
    }
  }

  private validateSecuritySettings(settings: any): SecuritySettings {
    return {
      id: settings.id || `security_${Date.now()}`,
      passwordPolicy: {
        minLength: Math.max(6, Math.min(32, Number(settings.passwordPolicy?.minLength) || 8)),
        requireUppercase: Boolean(settings.passwordPolicy?.requireUppercase ?? true),
        requireLowercase: Boolean(settings.passwordPolicy?.requireLowercase ?? true),
        requireNumbers: Boolean(settings.passwordPolicy?.requireNumbers ?? true),
        requireSpecialChars: Boolean(settings.passwordPolicy?.requireSpecialChars ?? true),
        expirationDays: Math.max(30, Math.min(365, Number(settings.passwordPolicy?.expirationDays) || 90)),
        preventReuse: Math.max(1, Math.min(10, Number(settings.passwordPolicy?.preventReuse) || 5))
      },
      sessionSecurity: {
        maxConcurrentSessions: Math.max(1, Math.min(10, Number(settings.sessionSecurity?.maxConcurrentSessions) || 3)),
        idleTimeout: Math.max(5, Math.min(120, Number(settings.sessionSecurity?.idleTimeout) || 30)),
        forceLogoutOnPasswordChange: Boolean(settings.sessionSecurity?.forceLogoutOnPasswordChange ?? true),
        requireReauthForSensitive: Boolean(settings.sessionSecurity?.requireReauthForSensitive ?? true)
      },
      loginAttempts: {
        maxAttempts: Math.max(3, Math.min(10, Number(settings.loginAttempts?.maxAttempts) || 5)),
        lockoutDuration: Math.max(5, Math.min(60, Number(settings.loginAttempts?.lockoutDuration) || 15)),
        resetAfter: Math.max(30, Math.min(300, Number(settings.loginAttempts?.resetAfter) || 60)),
        notifyOnLockout: Boolean(settings.loginAttempts?.notifyOnLockout ?? true)
      },
      twoFactorAuth: Boolean(settings.twoFactorAuth ?? false),
      ipWhitelist: Array.isArray(settings.ipWhitelist) ? settings.ipWhitelist : [],
      auditLogging: Boolean(settings.auditLogging ?? true),
      encryptionEnabled: Boolean(settings.encryptionEnabled ?? true),
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  private validateIntegrationSettings(settings: any): IntegrationSettings {
    return {
      id: settings.id || `integration_${Date.now()}`,
      apiConfiguration: {
        baseUrl: settings.apiConfiguration?.baseUrl || '',
        apiKey: settings.apiConfiguration?.apiKey || '',
        rateLimit: Math.max(10, Math.min(10000, Number(settings.apiConfiguration?.rateLimit) || 1000)),
        timeout: Math.max(1000, Math.min(30000, Number(settings.apiConfiguration?.timeout) || 5000)),
        retryAttempts: Math.max(0, Math.min(5, Number(settings.apiConfiguration?.retryAttempts) || 3)),
        enableCaching: Boolean(settings.apiConfiguration?.enableCaching ?? true)
      },
      thirdPartyServices: {
        googleAnalytics: {
          enabled: Boolean(settings.thirdPartyServices?.googleAnalytics?.enabled ?? false),
          trackingId: settings.thirdPartyServices?.googleAnalytics?.trackingId || '',
          anonymizeIp: Boolean(settings.thirdPartyServices?.googleAnalytics?.anonymizeIp ?? true)
        },
        adSense: {
          enabled: Boolean(settings.thirdPartyServices?.adSense?.enabled ?? false),
          publisherId: settings.thirdPartyServices?.adSense?.publisherId || '',
          adSlotId: settings.thirdPartyServices?.adSense?.adSlotId || ''
        },
        emailService: {
          enabled: Boolean(settings.thirdPartyServices?.emailService?.enabled ?? false),
          provider: ['sendgrid', 'mailgun', 'ses'].includes(settings.thirdPartyServices?.emailService?.provider) ? settings.thirdPartyServices.emailService.provider : 'sendgrid',
          apiKey: settings.thirdPartyServices?.emailService?.apiKey || '',
          fromEmail: settings.thirdPartyServices?.emailService?.fromEmail || ''
        }
      },
      webhooks: {
        enabled: Boolean(settings.webhooks?.enabled ?? false),
        endpoints: Array.isArray(settings.webhooks?.endpoints) ? settings.webhooks.endpoints : [],
        retryPolicy: {
          maxRetries: Math.max(0, Math.min(5, Number(settings.webhooks?.retryPolicy?.maxRetries) || 3)),
          backoffMultiplier: Math.max(1, Math.min(10, Number(settings.webhooks?.retryPolicy?.backoffMultiplier) || 2)),
          maxBackoffTime: Math.max(1000, Math.min(60000, Number(settings.webhooks?.retryPolicy?.maxBackoffTime) || 30000))
        }
      },
      socialMedia: {
        twitter: {
          enabled: Boolean(settings.socialMedia?.twitter?.enabled ?? false),
          apiKey: settings.socialMedia?.twitter?.apiKey || '',
          apiSecret: settings.socialMedia?.twitter?.apiSecret || ''
        },
        facebook: {
          enabled: Boolean(settings.socialMedia?.facebook?.enabled ?? false),
          appId: settings.socialMedia?.facebook?.appId || '',
          appSecret: settings.socialMedia?.facebook?.appSecret || ''
        },
        linkedin: {
          enabled: Boolean(settings.socialMedia?.linkedin?.enabled ?? false),
          clientId: settings.socialMedia?.linkedin?.clientId || '',
          clientSecret: settings.socialMedia?.linkedin?.clientSecret || ''
        }
      },
      analytics: {
        customAnalytics: {
          enabled: Boolean(settings.analytics?.customAnalytics?.enabled ?? false),
          endpoint: settings.analytics?.customAnalytics?.endpoint || '',
          apiKey: settings.analytics?.customAnalytics?.apiKey || ''
        },
        heatmaps: {
          enabled: Boolean(settings.analytics?.heatmaps?.enabled ?? false),
          provider: ['hotjar', 'fullstory', 'logrocket'].includes(settings.analytics?.heatmaps?.provider) ? settings.analytics.heatmaps.provider : 'hotjar',
          trackingId: settings.analytics?.heatmaps?.trackingId || ''
        }
      },
      notifications: {
        email: {
          enabled: Boolean(settings.notifications?.email?.enabled ?? false),
          smtpHost: settings.notifications?.email?.smtpHost || '',
          smtpPort: Number(settings.notifications?.email?.smtpPort) || 587,
          username: settings.notifications?.email?.username || '',
          password: settings.notifications?.email?.password || ''
        },
        sms: {
          enabled: Boolean(settings.notifications?.sms?.enabled ?? false),
          provider: ['twilio', 'nexmo', 'aws-sns'].includes(settings.notifications?.sms?.provider) ? settings.notifications.sms.provider : 'twilio',
          apiKey: settings.notifications?.sms?.apiKey || '',
          fromNumber: settings.notifications?.sms?.fromNumber || ''
        },
        push: {
          enabled: Boolean(settings.notifications?.push?.enabled ?? false),
          vapidPublicKey: settings.notifications?.push?.vapidPublicKey || '',
          vapidPrivateKey: settings.notifications?.push?.vapidPrivateKey || ''
        }
      },
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  // Default creation methods
  private createDefaultSystemSettings(): SystemSettings {
    return {
      id: `system_${Date.now()}`,
      ...DEFAULT_SYSTEM_SETTINGS,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  private createDefaultUserPreferences(): UserPreferences {
    return {
      id: `user_${Date.now()}`,
      ...DEFAULT_USER_PREFERENCES,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  private createDefaultSecuritySettings(): SecuritySettings {
    return {
      id: `security_${Date.now()}`,
      ...DEFAULT_SECURITY_SETTINGS,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  private createDefaultIntegrationSettings(): IntegrationSettings {
    return {
      id: `integration_${Date.now()}`,
      apiConfiguration: {
        baseUrl: '',
        apiKey: '',
        rateLimit: 1000,
        timeout: 5000,
        retryAttempts: 3,
        enableCaching: true
      },
      thirdPartyServices: {
        googleAnalytics: {
          enabled: false,
          trackingId: '',
          anonymizeIp: true
        },
        adSense: {
          enabled: false,
          publisherId: '',
          adSlotId: ''
        },
        emailService: {
          enabled: false,
          provider: 'sendgrid',
          apiKey: '',
          fromEmail: ''
        }
      },
      webhooks: {
        enabled: false,
        endpoints: [],
        retryPolicy: {
          maxRetries: 3,
          backoffMultiplier: 2,
          maxBackoffTime: 30000
        }
      },
      socialMedia: {
        twitter: {
          enabled: false,
          apiKey: '',
          apiSecret: ''
        },
        facebook: {
          enabled: false,
          appId: '',
          appSecret: ''
        },
        linkedin: {
          enabled: false,
          clientId: '',
          clientSecret: ''
        }
      },
      analytics: {
        customAnalytics: {
          enabled: false,
          endpoint: '',
          apiKey: ''
        },
        heatmaps: {
          enabled: false,
          provider: 'hotjar',
          trackingId: ''
        }
      },
      notifications: {
        email: {
          enabled: false,
          smtpHost: '',
          smtpPort: 587,
          username: '',
          password: ''
        },
        sms: {
          enabled: false,
          provider: 'twilio',
          apiKey: '',
          fromNumber: ''
        },
        push: {
          enabled: false,
          vapidPublicKey: '',
          vapidPrivateKey: ''
        }
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }
}

export const settingsDataManager = SettingsDataManager.getInstance()
