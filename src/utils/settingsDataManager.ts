import { 
  SystemSettings, 
  UserPreferences, 
  SecuritySettings, 
  IntegrationSettings,
  SETTINGS_STORAGE_KEYS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_USER_PREFERENCES,
  DEFAULT_SECURITY_SETTINGS,
  DEFAULT_INTEGRATION_SETTINGS
} from '@/types/settings'

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
        system: this.getSystemSettings(),
        userPreferences: this.getUserPreferences(),
        security: this.getSecuritySettings(),
        integrations: this.getIntegrationSettings()
      }

      const backupString = JSON.stringify(backup)
      localStorage.setItem(SETTINGS_STORAGE_KEYS.BACKUP, backupString)
      return backupString
    } catch (error) {
      console.error('Error creating settings backup:', error)
      throw new Error('Failed to create settings backup')
    }
  }

  restoreFromBackup(backupData: string): boolean {
    try {
      const backup = JSON.parse(backupData)

      if (backup.system) {
        this.saveSystemSettings(backup.system)
      }

      if (backup.userPreferences) {
        this.saveUserPreferences(backup.userPreferences)
      }

      if (backup.security) {
        this.saveSecuritySettings(backup.security)
      }

      if (backup.integrations) {
        this.saveIntegrationSettings(backup.integrations)
      }

      console.info('✅ Settings restored from backup')
      return true
    } catch (error) {
      console.error('Error restoring settings from backup:', error)
      return false
    }
  }

  getBackup(): string | null {
    return localStorage.getItem(SETTINGS_STORAGE_KEYS.BACKUP)
  }

  // Validation methods
  private validateSystemSettings(settings: any): SystemSettings {
    return {
      id: settings.id || `sys_${Date.now()}`,
      siteName: settings.siteName || DEFAULT_SYSTEM_SETTINGS.siteName,
      siteDescription: settings.siteDescription || DEFAULT_SYSTEM_SETTINGS.siteDescription,
      logoUrl: settings.logoUrl || DEFAULT_SYSTEM_SETTINGS.logoUrl,
      faviconUrl: settings.faviconUrl || DEFAULT_SYSTEM_SETTINGS.faviconUrl,
      theme: settings.theme && ['light', 'dark', 'auto'].includes(settings.theme) 
        ? settings.theme 
        : DEFAULT_SYSTEM_SETTINGS.theme,
      language: settings.language || DEFAULT_SYSTEM_SETTINGS.language,
      timezone: settings.timezone || DEFAULT_SYSTEM_SETTINGS.timezone,
      maintenanceMode: typeof settings.maintenanceMode === 'boolean' 
        ? settings.maintenanceMode 
        : DEFAULT_SYSTEM_SETTINGS.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage || DEFAULT_SYSTEM_SETTINGS.maintenanceMessage,
      featureFlags: {
        ...DEFAULT_SYSTEM_SETTINGS.featureFlags,
        ...settings.featureFlags
      },
      performance: {
        cacheEnabled: typeof settings.performance?.cacheEnabled === 'boolean' 
          ? settings.performance.cacheEnabled 
          : DEFAULT_SYSTEM_SETTINGS.performance.cacheEnabled,
        cacheDuration: typeof settings.performance?.cacheDuration === 'number' 
          ? settings.performance.cacheDuration 
          : DEFAULT_SYSTEM_SETTINGS.performance.cacheDuration,
        lazyLoading: typeof settings.performance?.lazyLoading === 'boolean' 
          ? settings.performance.lazyLoading 
          : DEFAULT_SYSTEM_SETTINGS.performance.lazyLoading
      },
      seo: {
        metaTitle: settings.seo?.metaTitle || DEFAULT_SYSTEM_SETTINGS.seo.metaTitle,
        metaDescription: settings.seo?.metaDescription || DEFAULT_SYSTEM_SETTINGS.seo.metaDescription,
        metaKeywords: settings.seo?.metaKeywords || DEFAULT_SYSTEM_SETTINGS.seo.metaKeywords,
        openGraph: {
          title: settings.seo?.openGraph?.title || DEFAULT_SYSTEM_SETTINGS.seo.openGraph.title,
          description: settings.seo?.openGraph?.description || DEFAULT_SYSTEM_SETTINGS.seo.openGraph.description,
          image: settings.seo?.openGraph?.image || DEFAULT_SYSTEM_SETTINGS.seo.openGraph.image
        }
      },
      analytics: {
        googleAnalyticsId: settings.analytics?.googleAnalyticsId || DEFAULT_SYSTEM_SETTINGS.analytics.googleAnalyticsId,
        hotjarId: settings.analytics?.hotjarId || DEFAULT_SYSTEM_SETTINGS.analytics.hotjarId,
        matomoUrl: settings.analytics?.matomoUrl || DEFAULT_SYSTEM_SETTINGS.analytics.matomoUrl
      },
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  private validateUserPreferences(preferences: any): UserPreferences {
    return {
      id: preferences.id || `pref_${Date.now()}`,
      userId: preferences.userId || 'guest',
      notifications: {
        email: typeof preferences.notifications?.email === 'boolean' 
          ? preferences.notifications.email 
          : DEFAULT_USER_PREFERENCES.notifications.email,
        push: typeof preferences.notifications?.push === 'boolean' 
          ? preferences.notifications.push 
          : DEFAULT_USER_PREFERENCES.notifications.push,
        sms: typeof preferences.notifications?.sms === 'boolean' 
          ? preferences.notifications.sms 
          : DEFAULT_USER_PREFERENCES.notifications.sms,
        inApp: typeof preferences.notifications?.inApp === 'boolean' 
          ? preferences.notifications.inApp 
          : DEFAULT_USER_PREFERENCES.notifications.inApp
      },
      privacy: {
        profileVisibility: preferences.privacy?.profileVisibility && 
          ['public', 'friends', 'private'].includes(preferences.privacy.profileVisibility)
          ? preferences.privacy.profileVisibility
          : DEFAULT_USER_PREFERENCES.privacy.profileVisibility,
        activityVisibility: preferences.privacy?.activityVisibility && 
          ['public', 'friends', 'private'].includes(preferences.privacy.activityVisibility)
          ? preferences.privacy.activityVisibility
          : DEFAULT_USER_PREFERENCES.privacy.activityVisibility,
        dataSharing: typeof preferences.privacy?.dataSharing === 'boolean' 
          ? preferences.privacy.dataSharing 
          : DEFAULT_USER_PREFERENCES.privacy.dataSharing
      },
      accessibility: {
        fontSize: preferences.accessibility?.fontSize && 
          ['small', 'medium', 'large'].includes(preferences.accessibility.fontSize)
          ? preferences.accessibility.fontSize
          : DEFAULT_USER_PREFERENCES.accessibility.fontSize,
        highContrast: typeof preferences.accessibility?.highContrast === 'boolean' 
          ? preferences.accessibility.highContrast 
          : DEFAULT_USER_PREFERENCES.accessibility.highContrast,
        screenReader: typeof preferences.accessibility?.screenReader === 'boolean' 
          ? preferences.accessibility.screenReader 
          : DEFAULT_USER_PREFERENCES.accessibility.screenReader
      },
      display: {
        theme: preferences.display?.theme && 
          ['light', 'dark', 'auto'].includes(preferences.display.theme)
          ? preferences.display.theme
          : DEFAULT_USER_PREFERENCES.display.theme,
        animations: typeof preferences.display?.animations === 'boolean' 
          ? preferences.display.animations 
          : DEFAULT_USER_PREFERENCES.display.animations,
        compactMode: typeof preferences.display?.compactMode === 'boolean' 
          ? preferences.display.compactMode 
          : DEFAULT_USER_PREFERENCES.display.compactMode
      },
      createdAt: preferences.createdAt || Date.now(),
      updatedAt: preferences.updatedAt || Date.now()
    }
  }

  private validateSecuritySettings(settings: any): SecuritySettings {
    return {
      id: settings.id || `sec_${Date.now()}`,
      passwordPolicy: {
        minLength: typeof settings.passwordPolicy?.minLength === 'number' 
          ? settings.passwordPolicy.minLength 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.minLength,
        requireNumbers: typeof settings.passwordPolicy?.requireNumbers === 'boolean' 
          ? settings.passwordPolicy.requireNumbers 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.requireNumbers,
        requireSpecialChars: typeof settings.passwordPolicy?.requireSpecialChars === 'boolean' 
          ? settings.passwordPolicy.requireSpecialChars 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.requireSpecialChars,
        requireUppercase: typeof settings.passwordPolicy?.requireUppercase === 'boolean' 
          ? settings.passwordPolicy.requireUppercase 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.requireUppercase,
        requireLowercase: typeof settings.passwordPolicy?.requireLowercase === 'boolean' 
          ? settings.passwordPolicy.requireLowercase 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.requireLowercase,
        expirationDays: typeof settings.passwordPolicy?.expirationDays === 'number' 
          ? settings.passwordPolicy.expirationDays 
          : DEFAULT_SECURITY_SETTINGS.passwordPolicy.expirationDays
      },
      twoFactorAuth: {
        enabled: typeof settings.twoFactorAuth?.enabled === 'boolean' 
          ? settings.twoFactorAuth.enabled 
          : DEFAULT_SECURITY_SETTINGS.twoFactorAuth.enabled,
        methods: Array.isArray(settings.twoFactorAuth?.methods) 
          ? settings.twoFactorAuth.methods.filter((method: string) => 
              ['sms', 'email', 'authenticator'].includes(method))
          : DEFAULT_SECURITY_SETTINGS.twoFactorAuth.methods
      },
      session: {
        timeoutMinutes: typeof settings.session?.timeoutMinutes === 'number' 
          ? settings.session.timeoutMinutes 
          : DEFAULT_SECURITY_SETTINGS.session.timeoutMinutes,
        maxSessions: typeof settings.session?.maxSessions === 'number' 
          ? settings.session.maxSessions 
          : DEFAULT_SECURITY_SETTINGS.session.maxSessions,
        ipLocking: typeof settings.session?.ipLocking === 'boolean' 
          ? settings.session.ipLocking 
          : DEFAULT_SECURITY_SETTINGS.session.ipLocking
      },
      rateLimiting: {
        requestsPerMinute: typeof settings.rateLimiting?.requestsPerMinute === 'number' 
          ? settings.rateLimiting.requestsPerMinute 
          : DEFAULT_SECURITY_SETTINGS.rateLimiting.requestsPerMinute,
        burstLimit: typeof settings.rateLimiting?.burstLimit === 'number' 
          ? settings.rateLimiting.burstLimit 
          : DEFAULT_SECURITY_SETTINGS.rateLimiting.burstLimit,
        blockDuration: typeof settings.rateLimiting?.blockDuration === 'number' 
          ? settings.rateLimiting.blockDuration 
          : DEFAULT_SECURITY_SETTINGS.rateLimiting.blockDuration
      },
      auditLogging: {
        enabled: typeof settings.auditLogging?.enabled === 'boolean' 
          ? settings.auditLogging.enabled 
          : DEFAULT_SECURITY_SETTINGS.auditLogging.enabled,
        retentionDays: typeof settings.auditLogging?.retentionDays === 'number' 
          ? settings.auditLogging.retentionDays 
          : DEFAULT_SECURITY_SETTINGS.auditLogging.retentionDays
      },
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  private validateIntegrationSettings(settings: any): IntegrationSettings {
    return {
      id: settings.id || `int_${Date.now()}`,
      apiConfiguration: {
        baseUrl: settings.apiConfiguration?.baseUrl || DEFAULT_INTEGRATION_SETTINGS.apiConfiguration.baseUrl,
        timeout: typeof settings.apiConfiguration?.timeout === 'number' 
          ? settings.apiConfiguration.timeout 
          : DEFAULT_INTEGRATION_SETTINGS.apiConfiguration.timeout,
        retries: typeof settings.apiConfiguration?.retries === 'number' 
          ? settings.apiConfiguration.retries 
          : DEFAULT_INTEGRATION_SETTINGS.apiConfiguration.retries,
        headers: {
          ...DEFAULT_INTEGRATION_SETTINGS.apiConfiguration.headers,
          ...settings.apiConfiguration?.headers
        }
      },
      thirdPartyServices: {
        google: {
          clientId: settings.thirdPartyServices?.google?.clientId || DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.google.clientId,
          enabled: typeof settings.thirdPartyServices?.google?.enabled === 'boolean' 
            ? settings.thirdPartyServices.google.enabled 
            : DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.google.enabled
        },
        facebook: {
          appId: settings.thirdPartyServices?.facebook?.appId || DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.facebook.appId,
          enabled: typeof settings.thirdPartyServices?.facebook?.enabled === 'boolean' 
            ? settings.thirdPartyServices.facebook.enabled 
            : DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.facebook.enabled
        },
        twitter: {
          apiKey: settings.thirdPartyServices?.twitter?.apiKey || DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.twitter.apiKey,
          enabled: typeof settings.thirdPartyServices?.twitter?.enabled === 'boolean' 
            ? settings.thirdPartyServices.twitter.enabled 
            : DEFAULT_INTEGRATION_SETTINGS.thirdPartyServices.twitter.enabled
        }
      },
      webhooks: {
        quizCompleted: {
          url: settings.webhooks?.quizCompleted?.url || DEFAULT_INTEGRATION_SETTINGS.webhooks.quizCompleted.url,
          enabled: typeof settings.webhooks?.quizCompleted?.enabled === 'boolean' 
            ? settings.webhooks.quizCompleted.enabled 
            : DEFAULT_INTEGRATION_SETTINGS.webhooks.quizCompleted.enabled,
          secret: settings.webhooks?.quizCompleted?.secret || DEFAULT_INTEGRATION_SETTINGS.webhooks.quizCompleted.secret
        },
        userRegistered: {
          url: settings.webhooks?.userRegistered?.url || DEFAULT_INTEGRATION_SETTINGS.webhooks.userRegistered.url,
          enabled: typeof settings.webhooks?.userRegistered?.enabled === 'boolean' 
            ? settings.webhooks.userRegistered.enabled 
            : DEFAULT_INTEGRATION_SETTINGS.webhooks.userRegistered.enabled,
          secret: settings.webhooks?.userRegistered?.secret || DEFAULT_INTEGRATION_SETTINGS.webhooks.userRegistered.secret
        }
      },
      createdAt: settings.createdAt || Date.now(),
      updatedAt: settings.updatedAt || Date.now()
    }
  }

  // Default creation methods
  private createDefaultSystemSettings(): SystemSettings {
    const now = Date.now()
    return {
      id: `sys_${now}`,
      ...DEFAULT_SYSTEM_SETTINGS,
      createdAt: now,
      updatedAt: now
    }
  }

  private createDefaultUserPreferences(): UserPreferences {
    const now = Date.now()
    return {
      id: `pref_${now}`,
      userId: 'guest',
      ...DEFAULT_USER_PREFERENCES,
      createdAt: now,
      updatedAt: now
    }
  }

  private createDefaultSecuritySettings(): SecuritySettings {
    const now = Date.now()
    return {
      id: `sec_${now}`,
      ...DEFAULT_SECURITY_SETTINGS,
      createdAt: now,
      updatedAt: now
    }
  }

  private createDefaultIntegrationSettings(): IntegrationSettings {
    const now = Date.now()
    return {
      id: `int_${now}`,
      ...DEFAULT_INTEGRATION_SETTINGS,
      createdAt: now,
      updatedAt: now
    }
  }

  // Clear all settings
  clearAllSettings(): void {
    Object.values(SETTINGS_STORAGE_KEYS).forEach(key => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error(`Error clearing settings for key ${key}:`, error)
      }
    })
  }
}

// Export singleton instance
export const settingsDataManager = SettingsDataManager.getInstance()