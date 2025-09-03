// Real-time data synchronization between admin dashboard and quiz game
import { QuizQuestion } from '@/types/quiz'
import { quizDataManager } from './quizDataManager'
import { rewardDataManager } from './rewardDataManager'
import { analyticsDataManager } from './analyticsDataManager'

interface SyncEvent {
  type: 'quiz_updated' | 'reward_updated' | 'analytics_updated' | 'settings_updated'
  data: any
  timestamp: number
  source: 'admin' | 'game'
}

class RealTimeSyncService {
  private static instance: RealTimeSyncService
  private eventListeners: Map<string, ((event: SyncEvent) => void)[]> = new Map()
  private syncQueue: SyncEvent[] = []
  private isProcessing = false
  private lastSyncTime = 0
  private syncInterval: NodeJS.Timeout | null = null

  static getInstance(): RealTimeSyncService {
    if (!RealTimeSyncService.instance) {
      RealTimeSyncService.instance = new RealTimeSyncService()
    }
    return RealTimeSyncService.instance
  }

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.startSyncLoop()
      this.setupStorageListener()
    }
  }

  // Start the sync loop
  private startSyncLoop(): void {
    if (typeof window === 'undefined') return

    this.syncInterval = setInterval(() => {
      this.processSyncQueue()
    }, 1000) // Process every second
  }

  // Setup localStorage change listener for cross-tab sync
  private setupStorageListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('admin_') && e.newValue !== e.oldValue) {
        this.handleStorageChange(e.key, e.newValue)
      }
    })
  }

  // Handle localStorage changes from other tabs
  private handleStorageChange(key: string, newValue: string | null): void {
    if (!newValue) return

    try {
      const data = JSON.parse(newValue)
      let eventType: SyncEvent['type']

      if (key.includes('quiz')) {
        eventType = 'quiz_updated'
      } else if (key.includes('reward')) {
        eventType = 'reward_updated'
      } else if (key.includes('analytics')) {
        eventType = 'analytics_updated'
      } else if (key.includes('settings')) {
        eventType = 'settings_updated'
      } else {
        return
      }

      const syncEvent: SyncEvent = {
        type: eventType,
        data,
        timestamp: Date.now(),
        source: 'admin'
      }

      this.notifyListeners(eventType, syncEvent)
    } catch (error) {
      console.error('Failed to parse storage change:', error)
    }
  }

  // Add event listener
  addEventListener(eventType: SyncEvent['type'], callback: (event: SyncEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(callback)
  }

  // Remove event listener
  removeEventListener(eventType: SyncEvent['type'], callback: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // Notify listeners of events
  private notifyListeners(eventType: SyncEvent['type'], event: SyncEvent): void {
    const listeners = this.eventListeners.get(eventType) || []
    listeners.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in sync event listener:', error)
      }
    })
  }

  // Queue sync event
  queueSync(event: Omit<SyncEvent, 'timestamp'>): void {
    const syncEvent: SyncEvent = {
      ...event,
      timestamp: Date.now()
    }
    
    this.syncQueue.push(syncEvent)
  }

  // Process sync queue
  private async processSyncQueue(): Promise<void> {
    if (this.isProcessing || this.syncQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      const events = [...this.syncQueue]
      this.syncQueue = []

      for (const event of events) {
        await this.processEvent(event)
      }

      this.lastSyncTime = Date.now()
    } catch (error) {
      console.error('Error processing sync queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  // Process individual sync event
  private async processEvent(event: SyncEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'quiz_updated':
          await this.syncQuizData(event)
          break
        case 'reward_updated':
          await this.syncRewardData(event)
          break
        case 'analytics_updated':
          await this.syncAnalyticsData(event)
          break
        case 'settings_updated':
          await this.syncSettingsData(event)
          break
      }

      this.notifyListeners(event.type, event)
    } catch (error) {
      console.error(`Error processing ${event.type} event:`, error)
    }
  }

  // Sync quiz data
  private async syncQuizData(event: SyncEvent): Promise<void> {
    if (event.source === 'admin') {
      // Admin updated quiz data, sync to game
      const gameQuizData = localStorage.getItem('game_quiz_data')
      const adminQuizData = JSON.stringify(event.data)
      
      if (gameQuizData !== adminQuizData) {
        localStorage.setItem('game_quiz_data', adminQuizData)
        localStorage.setItem('game_last_sync', Date.now().toString())
      }
    }
  }

  // Sync reward data
  private async syncRewardData(event: SyncEvent): Promise<void> {
    if (event.source === 'admin') {
      // Admin updated reward data, sync to game
      const gameRewardData = localStorage.getItem('game_reward_data')
      const adminRewardData = JSON.stringify(event.data)
      
      if (gameRewardData !== adminRewardData) {
        localStorage.setItem('game_reward_data', adminRewardData)
        localStorage.setItem('game_last_sync', Date.now().toString())
      }
    }
  }

  // Sync analytics data
  private async syncAnalyticsData(event: SyncEvent): Promise<void> {
    // Analytics data flows from game to admin
    if (event.source === 'game') {
      // Import game data if method exists
      if (typeof (analyticsDataManager as any).importGameData === 'function') {
        (analyticsDataManager as any).importGameData(event.data)
      }
    }
  }

  // Sync settings data
  private async syncSettingsData(event: SyncEvent): Promise<void> {
    if (event.source === 'admin') {
      // Admin updated settings, sync to game
      const gameSettingsData = localStorage.getItem('game_settings_data')
      const adminSettingsData = JSON.stringify(event.data)
      
      if (gameSettingsData !== adminSettingsData) {
        localStorage.setItem('game_settings_data', adminSettingsData)
        localStorage.setItem('game_last_sync', Date.now().toString())
      }
    }
  }

  // Manual sync trigger
  async triggerSync(): Promise<{ success: boolean; message: string }> {
    try {
      // Sync all data from admin to game
      const quizData = quizDataManager.getQuestions()
      const rewardData = rewardDataManager.getAllAchievements()
      
      this.queueSync({
        type: 'quiz_updated',
        data: quizData,
        source: 'admin'
      })

      this.queueSync({
        type: 'reward_updated',
        data: rewardData,
        source: 'admin'
      })

      await this.processSyncQueue()

      return {
        success: true,
        message: 'Data synchronized successfully'
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync failed'
      }
    }
  }

  // Get sync status
  getSyncStatus(): {
    lastSyncTime: number
    queueLength: number
    isProcessing: boolean
    gameLastSync: number
  } {
    const gameLastSync = parseInt(localStorage.getItem('game_last_sync') || '0')
    
    return {
      lastSyncTime: this.lastSyncTime,
      queueLength: this.syncQueue.length,
      isProcessing: this.isProcessing,
      gameLastSync
    }
  }

  // Check if game data is in sync
  isGameInSync(): boolean {
    const gameLastSync = parseInt(localStorage.getItem('game_last_sync') || '0')
    const adminLastUpdate = Math.max(
      parseInt(localStorage.getItem('admin_quiz_questions_updated') || '0'),
      parseInt(localStorage.getItem('admin_reward_config_updated') || '0')
    )
    
    return gameLastSync >= adminLastUpdate
  }

  // Force sync all data
  async forceSyncAll(): Promise<void> {
    const quizData = quizDataManager.getQuestions()
    const rewardData = rewardDataManager.getAllAchievements()
    
    // Update game data directly
    localStorage.setItem('game_quiz_data', JSON.stringify(quizData))
    localStorage.setItem('game_reward_data', JSON.stringify(rewardData))
    localStorage.setItem('game_last_sync', Date.now().toString())
    
    // Notify listeners
    this.notifyListeners('quiz_updated', {
      type: 'quiz_updated',
      data: quizData,
      timestamp: Date.now(),
      source: 'admin'
    })

    this.notifyListeners('reward_updated', {
      type: 'reward_updated',
      data: rewardData,
      timestamp: Date.now(),
      source: 'admin'
    })
  }

  // Cleanup
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.eventListeners.clear()
    this.syncQueue = []
  }
}

export const realTimeSyncService = RealTimeSyncService.getInstance()
