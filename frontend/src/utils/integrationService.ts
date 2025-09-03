import { IntegrationSettings } from '@/types/settings'
import { settingsDataManager } from './settingsDataManager'

// Integration service for handling real API connections and third-party services
class IntegrationService {
  private static instance: IntegrationService
  private settings: IntegrationSettings | null = null

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService()
    }
    return IntegrationService.instance
  }

  constructor() {
    // Only load settings on client side
    if (typeof window !== 'undefined') {
      this.loadSettings()
    }
  }

  private loadSettings(): void {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    try {
      this.settings = settingsDataManager.getIntegrationSettings()
    } catch (error) {
      console.error('Failed to load integration settings:', error)
    }
  }

  // API Configuration Methods
  async testApiConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    if (!this.settings?.apiConfiguration.baseUrl) {
      return { success: false, message: 'API base URL not configured' }
    }

    const startTime = Date.now()
    
    try {
      const response = await fetch(`${this.settings.apiConfiguration.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${(this.settings.apiConfiguration as any).apiKey || ''}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(this.settings.apiConfiguration.timeout)
      })

      const responseTime = Date.now() - startTime

      if (response.ok) {
        return { 
          success: true, 
          message: 'API connection successful', 
          responseTime 
        }
      } else {
        return { 
          success: false, 
          message: `API returned ${response.status}: ${response.statusText}` 
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed',
        responseTime 
      }
    }
  }

  async makeApiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.settings?.apiConfiguration.baseUrl) {
      throw new Error('API base URL not configured')
    }

    const url = `${this.settings.apiConfiguration.baseUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${(this.settings.apiConfiguration as any).apiKey || ''}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.settings.apiConfiguration.timeout)
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Webhook Methods
  async registerWebhook(url: string, events: string[]): Promise<{ success: boolean; webhookId?: string; message: string }> {
    try {
      const response = await this.makeApiRequest('/webhooks', {
        method: 'POST',
        body: JSON.stringify({
          url,
          events,
          active: true
        })
      })

      return {
        success: true,
        webhookId: response.id,
        message: 'Webhook registered successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register webhook'
      }
    }
  }

  async testWebhook(url: string): Promise<{ success: boolean; message: string }> {
    try {
      const testPayload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        data: { message: 'This is a test webhook from TechKwiz' }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (response.ok) {
        return { success: true, message: 'Webhook test successful' }
      } else {
        return { success: false, message: `Webhook returned ${response.status}` }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Webhook test failed'
      }
    }
  }

  // Social Media Integration Methods
  async connectSocialMedia(platform: 'facebook' | 'twitter' | 'instagram', credentials: any): Promise<{ success: boolean; message: string }> {
    try {
      // In a real implementation, this would handle OAuth flows
      const response = await this.makeApiRequest('/social/connect', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          credentials
        })
      })

      return {
        success: true,
        message: `Successfully connected to ${platform}`
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : `Failed to connect to ${platform}`
      }
    }
  }

  async postToSocialMedia(platform: string, content: string, media?: string[]): Promise<{ success: boolean; postId?: string; message: string }> {
    try {
      const response = await this.makeApiRequest('/social/post', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          content,
          media
        })
      })

      return {
        success: true,
        postId: response.postId,
        message: 'Post published successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish post'
      }
    }
  }

  // Analytics Integration Methods
  async sendAnalyticsEvent(event: string, properties: Record<string, any>): Promise<void> {
    if (!(this.settings as any)?.analytics?.googleAnalytics?.enabled) {
      return
    }

    try {
      // Google Analytics 4 event tracking
      if (typeof window !== 'undefined' && typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', event, properties)
      }

      // Custom analytics endpoint
      if ((this.settings as any)?.analytics?.customAnalytics?.enabled) {
        await this.makeApiRequest('/analytics/events', {
          method: 'POST',
          body: JSON.stringify({
            event,
            properties,
            timestamp: new Date().toISOString()
          })
        })
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error)
    }
  }

  // Notification Methods
  async sendNotification(type: 'email' | 'sms' | 'push', recipient: string, message: string, subject?: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeApiRequest('/notifications/send', {
        method: 'POST',
        body: JSON.stringify({
          type,
          recipient,
          message,
          subject
        })
      })

      return {
        success: true,
        message: 'Notification sent successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send notification'
      }
    }
  }

  // AdSense Integration Methods
  async initializeAdSense(): Promise<{ success: boolean; message: string }> {
    if (!(this.settings as any)?.adSense?.enabled || !(this.settings as any)?.adSense?.publisherId) {
      return { success: false, message: 'AdSense not configured' }
    }

    try {
      // Load AdSense script dynamically
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${(this.settings as any)?.adSense?.publisherId || ''}`
      script.crossOrigin = 'anonymous'
      
      document.head.appendChild(script)

      return { success: true, message: 'AdSense initialized successfully' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to initialize AdSense'
      }
    }
  }

  async displayAd(adSlotId: string, containerId: string): Promise<{ success: boolean; message: string }> {
    if (!(this.settings as any)?.adSense?.enabled) {
      return { success: false, message: 'AdSense not enabled' }
    }

    try {
      const adContainer = document.getElementById(containerId)
      if (!adContainer) {
        return { success: false, message: 'Ad container not found' }
      }

      // Create ad element
      const adElement = document.createElement('ins')
      adElement.className = 'adsbygoogle'
      adElement.style.display = 'block'
      adElement.setAttribute('data-ad-client', `ca-pub-${(this.settings as any)?.adSense?.publisherId || ''}`)
      adElement.setAttribute('data-ad-slot', adSlotId)
      adElement.setAttribute('data-ad-format', 'auto')

      adContainer.appendChild(adElement)

      // Push ad to AdSense
      if (typeof window !== 'undefined' && typeof (window as any).adsbygoogle !== 'undefined') {
        ((window as any).adsbygoogle as any).push({})
      }

      return { success: true, message: 'Ad displayed successfully' }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to display ad'
      }
    }
  }

  // Utility Methods
  refreshSettings(): void {
    this.loadSettings()
  }

  getConnectionStatus(): Record<string, boolean> {
    if (!this.settings) return {}

    return {
      api: !!this.settings.apiConfiguration.baseUrl && !!(this.settings.apiConfiguration as any).apiKey,
      webhooks: this.settings.webhooks.quizCompleted.enabled || this.settings.webhooks.userRegistered.enabled,
      socialMedia: Object.values((this.settings as any)?.socialMedia || {}).some((platform: any) => platform?.enabled),
      analytics: (this.settings as any)?.analytics?.googleAnalytics?.enabled || (this.settings as any)?.analytics?.customAnalytics?.enabled,
      notifications: Object.values((this.settings as any)?.notifications || {}).some((service: any) => service?.enabled),
      adSense: (this.settings as any)?.adSense?.enabled
    }
  }
}

// Export a function to get the service instance (lazy initialization)
export const getIntegrationService = () => {
  if (typeof window === 'undefined') {
    // Return a mock service for SSR
    return {
      testApiConnection: () => Promise.resolve({ success: false, message: 'Not available during SSR' }),
      testWebhook: () => Promise.resolve({ success: false, message: 'Not available during SSR' }),
      initializeAdSense: () => Promise.resolve({ success: false, message: 'Not available during SSR' }),
      refreshSettings: () => {},
      getConnectionStatus: () => ({})
    }
  }
  return IntegrationService.getInstance()
}

// For backward compatibility
export const integrationService = getIntegrationService()
