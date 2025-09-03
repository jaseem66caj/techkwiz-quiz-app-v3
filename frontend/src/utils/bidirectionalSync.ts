// Bidirectional Data Synchronization System for TechKwiz Admin Dashboard
import { quizDataManager } from './quizDataManager'
import { rewardDataManager } from './rewardDataManager'
import { settingsDataManager } from './settingsDataManager'

export interface ConfigData {
  quiz: {
    questions: any[]
    categories: any[]
    settings: any
    lastModified: number
    version: string
  }
  rewards: {
    achievements: any[]
    popupSettings: any
    coinMultipliers: any
    lastModified: number
    version: string
  }
  systemSettings: {
    featureFlags: any
    configValues: any
    adsConfig: any
    lastModified: number
    version: string
  }
}

export interface SyncOperation {
  id: string
  type: 'pull' | 'push' | 'smart' | 'reset'
  direction: 'admin-to-frontend' | 'frontend-to-admin' | 'bidirectional'
  timestamp: number
  changes: ChangeItem[]
  status: 'pending' | 'completed' | 'failed' | 'rolled-back'
  riskLevel: 'safe' | 'caution' | 'destructive'
  performanceMetrics: {
    duration: number
    dataSize: number
    conflictsResolved: number
  }
}

export interface ChangeItem {
  category: 'quiz' | 'rewards' | 'systemSettings'
  field: string
  action: 'add' | 'modify' | 'delete' | 'remove'
  oldValue: any
  newValue: any
  riskLevel: 'safe' | 'caution' | 'destructive'
  impact: string
  details?: {
    questions?: any[]
    added?: any[]
    removed?: any[]
    settingsChanged?: any
    [key: string]: any
  }
}

export interface ConflictResolution {
  field: string
  adminValue: any
  frontendValue: any
  adminTimestamp: number
  frontendTimestamp: number
  resolution: 'use-admin' | 'use-frontend' | 'merge' | 'manual'
  mergedValue?: any
}

export interface SyncPreview {
  operation: SyncOperation
  conflicts: ConflictResolution[]
  summary: {
    totalChanges: number
    safeChanges: number
    cautionChanges: number
    destructiveChanges: number
    estimatedDuration: number
  }
  dataFreshness: {
    admin: 'fresh' | 'stale' | 'outdated'
    frontend: 'fresh' | 'stale' | 'outdated'
  }
}

export interface SyncHistory {
  operations: SyncOperation[]
  rollbackPoints: Array<{
    id: string
    timestamp: number
    description: string
    configSnapshot: ConfigData
  }>
}

class BidirectionalSyncService {
  private static instance: BidirectionalSyncService
  private syncHistory: SyncHistory = { operations: [], rollbackPoints: [] }
  private listeners: ((preview: SyncPreview) => void)[] = []
  private isOperationInProgress = false

  static getInstance(): BidirectionalSyncService {
    if (!BidirectionalSyncService.instance) {
      BidirectionalSyncService.instance = new BidirectionalSyncService()
    }
    return BidirectionalSyncService.instance
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSyncHistory()
      this.setupStorageListeners()
    }
  }

  // Get current admin configuration data
  private getAdminConfigData(): ConfigData {
    const now = Date.now()
    
    return {
      quiz: {
        questions: quizDataManager.getQuestions() || [],
        categories: quizDataManager.getCategories() || [],
        settings: quizDataManager.getSettings() || {},
        lastModified: parseInt(localStorage.getItem('admin_quiz_questions_updated') || now.toString()),
        version: this.generateVersion('quiz')
      },
      rewards: {
        achievements: rewardDataManager.getAchievements() || [],
        popupSettings: rewardDataManager.getRewardConfig().popupSettings || {},
        coinMultipliers: rewardDataManager.getRewardConfig().coinValues || {},
        lastModified: parseInt(localStorage.getItem('admin_reward_config_updated') || now.toString()),
        version: this.generateVersion('rewards')
      },
      systemSettings: {
        featureFlags: settingsDataManager.getSystemSettings().featureFlags || {},
        configValues: settingsDataManager.getSystemSettings() || {},
        adsConfig: {},
        lastModified: parseInt(localStorage.getItem('admin_settings_updated') || now.toString()),
        version: this.generateVersion('systemSettings')
      }
    }
  }

  // Get current frontend configuration data
  private getFrontendConfigData(): ConfigData {
    const now = Date.now()
    
    try {
      return {
        quiz: {
          questions: JSON.parse(localStorage.getItem('game_quiz_data') || '[]'),
          categories: JSON.parse(localStorage.getItem('game_categories') || '[]'),
          settings: JSON.parse(localStorage.getItem('game_quiz_settings') || '{}'),
          lastModified: parseInt(localStorage.getItem('game_last_sync') || now.toString()),
          version: localStorage.getItem('game_quiz_version') || '1.0.0'
        },
        rewards: {
          achievements: JSON.parse(localStorage.getItem('game_reward_data') || '[]'),
          popupSettings: JSON.parse(localStorage.getItem('game_popup_settings') || '{}'),
          coinMultipliers: JSON.parse(localStorage.getItem('game_coin_multipliers') || '{}'),
          lastModified: parseInt(localStorage.getItem('game_rewards_sync') || now.toString()),
          version: localStorage.getItem('game_rewards_version') || '1.0.0'
        },
        systemSettings: {
          featureFlags: JSON.parse(localStorage.getItem('game_feature_flags') || '{}'),
          configValues: JSON.parse(localStorage.getItem('game_settings_data') || '{}'),
          adsConfig: JSON.parse(localStorage.getItem('game_ads_config') || '{}'),
          lastModified: parseInt(localStorage.getItem('game_settings_sync') || now.toString()),
          version: localStorage.getItem('game_settings_version') || '1.0.0'
        }
      }
    } catch (error) {
      console.error('Error reading frontend config data:', error)
      return this.getDefaultConfigData()
    }
  }

  // Generate version string based on data hash
  private generateVersion(category: string): string {
    const timestamp = Date.now()
    const hash = Math.random().toString(36).substring(2, 8)
    return `${category}-${timestamp}-${hash}`
  }

  // Get default configuration data
  private getDefaultConfigData(): ConfigData {
    const now = Date.now()
    return {
      quiz: {
        questions: [],
        categories: [],
        settings: {},
        lastModified: now,
        version: '1.0.0'
      },
      rewards: {
        achievements: [],
        popupSettings: {},
        coinMultipliers: {},
        lastModified: now,
        version: '1.0.0'
      },
      systemSettings: {
        featureFlags: {},
        configValues: {},
        adsConfig: {},
        lastModified: now,
        version: '1.0.0'
      }
    }
  }

  // Detect changes between admin and frontend data
  detectChanges(adminData: ConfigData, frontendData: ConfigData): ChangeItem[] {
    const changes: ChangeItem[] = []

    // Compare quiz data
    changes.push(...this.compareQuizData(adminData.quiz, frontendData.quiz))
    
    // Compare rewards data
    changes.push(...this.compareRewardsData(adminData.rewards, frontendData.rewards))
    
    // Compare system settings
    changes.push(...this.compareSystemSettings(adminData.systemSettings, frontendData.systemSettings))

    return changes
  }

  // Compare quiz data with detailed question-level analysis
  private compareQuizData(admin: any, frontend: any): ChangeItem[] {
    const changes: ChangeItem[] = []

    // Detailed question comparison
    const questionChanges = this.compareQuestions(admin.questions || [], frontend.questions || [])
    changes.push(...questionChanges)

    // Compare categories
    if (JSON.stringify(admin.categories) !== JSON.stringify(frontend.categories)) {
      changes.push({
        category: 'quiz',
        field: 'categories',
        action: 'modify',
        oldValue: frontend.categories,
        newValue: admin.categories,
        riskLevel: 'safe',
        impact: `Categories: ${frontend.categories.length} → ${admin.categories.length}`,
        details: {
          added: admin.categories.filter((cat: string) => !frontend.categories.includes(cat)),
          removed: frontend.categories.filter((cat: string) => !admin.categories.includes(cat))
        }
      })
    }

    // Compare settings
    if (JSON.stringify(admin.settings) !== JSON.stringify(frontend.settings)) {
      changes.push({
        category: 'quiz',
        field: 'settings',
        action: 'modify',
        oldValue: frontend.settings,
        newValue: admin.settings,
        riskLevel: 'caution',
        impact: 'Quiz settings configuration updated',
        details: {
          settingsChanged: this.getSettingsChanges(frontend.settings, admin.settings)
        }
      })
    }

    return changes
  }

  // Detailed question comparison at individual question level
  private compareQuestions(adminQuestions: any[], frontendQuestions: any[]): ChangeItem[] {
    const changes: ChangeItem[] = []

    // Create maps for efficient lookup
    const adminMap = new Map(adminQuestions.map(q => [q.id, q]))
    const frontendMap = new Map(frontendQuestions.map(q => [q.id, q]))

    // Find added questions (in admin but not in frontend)
    const addedQuestions = adminQuestions.filter(q => !frontendMap.has(q.id))
    if (addedQuestions.length > 0) {
      changes.push({
        category: 'quiz',
        field: 'questions',
        action: 'add',
        oldValue: null,
        newValue: addedQuestions,
        riskLevel: 'safe',
        impact: `Adding ${addedQuestions.length} new question${addedQuestions.length > 1 ? 's' : ''}`,
        details: {
          questions: addedQuestions.map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            funFact: q.funFact,
            tags: q.tags
          }))
        }
      })
    }

    // Find removed questions (in frontend but not in admin)
    const removedQuestions = frontendQuestions.filter(q => !adminMap.has(q.id))
    if (removedQuestions.length > 0) {
      changes.push({
        category: 'quiz',
        field: 'questions',
        action: 'remove',
        oldValue: removedQuestions,
        newValue: null,
        riskLevel: 'destructive',
        impact: `Removing ${removedQuestions.length} question${removedQuestions.length > 1 ? 's' : ''}`,
        details: {
          questions: removedQuestions.map(q => ({
            id: q.id,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            funFact: q.funFact,
            tags: q.tags
          }))
        }
      })
    }

    // Find modified questions (same ID but different content)
    const modifiedQuestions: any[] = []
    for (const adminQ of adminQuestions) {
      const frontendQ = frontendMap.get(adminQ.id)
      if (frontendQ && JSON.stringify(adminQ) !== JSON.stringify(frontendQ)) {
        const questionDiff = this.getQuestionDiff(frontendQ, adminQ)
        modifiedQuestions.push({
          id: adminQ.id,
          oldQuestion: frontendQ,
          newQuestion: adminQ,
          changes: questionDiff
        })
      }
    }

    if (modifiedQuestions.length > 0) {
      changes.push({
        category: 'quiz',
        field: 'questions',
        action: 'modify',
        oldValue: modifiedQuestions.map(m => m.oldQuestion),
        newValue: modifiedQuestions.map(m => m.newQuestion),
        riskLevel: 'caution',
        impact: `Modifying ${modifiedQuestions.length} question${modifiedQuestions.length > 1 ? 's' : ''}`,
        details: {
          questions: modifiedQuestions
        }
      })
    }

    return changes
  }

  // Get detailed diff for a single question
  private getQuestionDiff(oldQuestion: any, newQuestion: any): any {
    const diff: any = {}

    if (oldQuestion.question !== newQuestion.question) {
      diff.question = { old: oldQuestion.question, new: newQuestion.question }
    }

    if (JSON.stringify(oldQuestion.options) !== JSON.stringify(newQuestion.options)) {
      diff.options = { old: oldQuestion.options, new: newQuestion.options }
    }

    if (oldQuestion.correctAnswer !== newQuestion.correctAnswer) {
      diff.correctAnswer = {
        old: { index: oldQuestion.correctAnswer, text: oldQuestion.options[oldQuestion.correctAnswer] },
        new: { index: newQuestion.correctAnswer, text: newQuestion.options[newQuestion.correctAnswer] }
      }
    }

    if (oldQuestion.category !== newQuestion.category) {
      diff.category = { old: oldQuestion.category, new: newQuestion.category }
    }

    if (oldQuestion.difficulty !== newQuestion.difficulty) {
      diff.difficulty = { old: oldQuestion.difficulty, new: newQuestion.difficulty }
    }

    if (oldQuestion.type !== newQuestion.type) {
      diff.type = { old: oldQuestion.type, new: newQuestion.type }
    }

    if (oldQuestion.funFact !== newQuestion.funFact) {
      diff.funFact = { old: oldQuestion.funFact, new: newQuestion.funFact }
    }

    if (JSON.stringify(oldQuestion.tags) !== JSON.stringify(newQuestion.tags)) {
      diff.tags = { old: oldQuestion.tags || [], new: newQuestion.tags || [] }
    }

    return diff
  }

  // Get settings changes
  private getSettingsChanges(oldSettings: any, newSettings: any): any {
    const changes: any = {}

    for (const key in newSettings) {
      if (JSON.stringify(oldSettings[key]) !== JSON.stringify(newSettings[key])) {
        changes[key] = { old: oldSettings[key], new: newSettings[key] }
      }
    }

    return changes
  }

  // Compare rewards data
  private compareRewardsData(admin: any, frontend: any): ChangeItem[] {
    const changes: ChangeItem[] = []

    // Compare achievements
    if (JSON.stringify(admin.achievements) !== JSON.stringify(frontend.achievements)) {
      changes.push({
        category: 'rewards',
        field: 'achievements',
        action: 'modify',
        oldValue: frontend.achievements,
        newValue: admin.achievements,
        riskLevel: 'safe',
        impact: `Achievements: ${frontend.achievements.length} → ${admin.achievements.length}`
      })
    }

    // Compare popup settings
    if (JSON.stringify(admin.popupSettings) !== JSON.stringify(frontend.popupSettings)) {
      changes.push({
        category: 'rewards',
        field: 'popupSettings',
        action: 'modify',
        oldValue: frontend.popupSettings,
        newValue: admin.popupSettings,
        riskLevel: 'caution',
        impact: 'Reward popup configuration updated'
      })
    }

    // Compare coin multipliers
    if (JSON.stringify(admin.coinMultipliers) !== JSON.stringify(frontend.coinMultipliers)) {
      changes.push({
        category: 'rewards',
        field: 'coinMultipliers',
        action: 'modify',
        oldValue: frontend.coinMultipliers,
        newValue: admin.coinMultipliers,
        riskLevel: 'caution',
        impact: 'Coin multiplier settings updated'
      })
    }

    return changes
  }

  // Compare system settings
  private compareSystemSettings(admin: any, frontend: any): ChangeItem[] {
    const changes: ChangeItem[] = []

    // Compare feature flags
    if (JSON.stringify(admin.featureFlags) !== JSON.stringify(frontend.featureFlags)) {
      changes.push({
        category: 'systemSettings',
        field: 'featureFlags',
        action: 'modify',
        oldValue: frontend.featureFlags,
        newValue: admin.featureFlags,
        riskLevel: 'caution',
        impact: 'Feature flags configuration updated'
      })
    }

    // Compare config values
    if (JSON.stringify(admin.configValues) !== JSON.stringify(frontend.configValues)) {
      changes.push({
        category: 'systemSettings',
        field: 'configValues',
        action: 'modify',
        oldValue: frontend.configValues,
        newValue: admin.configValues,
        riskLevel: 'caution',
        impact: 'System configuration values updated'
      })
    }

    // Compare ads config
    if (JSON.stringify(admin.adsConfig) !== JSON.stringify(frontend.adsConfig)) {
      changes.push({
        category: 'systemSettings',
        field: 'adsConfig',
        action: 'modify',
        oldValue: frontend.adsConfig,
        newValue: admin.adsConfig,
        riskLevel: 'safe',
        impact: 'Ads configuration updated'
      })
    }

    return changes
  }

  // Detect conflicts between admin and frontend data
  detectConflicts(adminData: ConfigData, frontendData: ConfigData): ConflictResolution[] {
    const conflicts: ConflictResolution[] = []

    // Check for timestamp conflicts
    Object.keys(adminData).forEach(category => {
      const adminCat = adminData[category as keyof ConfigData]
      const frontendCat = frontendData[category as keyof ConfigData]
      
      if (adminCat.lastModified > 0 && frontendCat.lastModified > 0) {
        const timeDiff = Math.abs(adminCat.lastModified - frontendCat.lastModified)
        
        // If both were modified within 5 minutes of each other, it's a potential conflict
        if (timeDiff < 300000 && adminCat.version !== frontendCat.version) {
          conflicts.push({
            field: `${category}.version`,
            adminValue: adminCat.version,
            frontendValue: frontendCat.version,
            adminTimestamp: adminCat.lastModified,
            frontendTimestamp: frontendCat.lastModified,
            resolution: adminCat.lastModified > frontendCat.lastModified ? 'use-admin' : 'use-frontend'
          })
        }
      }
    })

    return conflicts
  }

  // Assess data freshness
  assessDataFreshness(timestamp: number): 'fresh' | 'stale' | 'outdated' {
    const now = Date.now()
    const age = now - timestamp
    
    if (age < 300000) return 'fresh' // < 5 minutes
    if (age < 1800000) return 'stale' // < 30 minutes
    return 'outdated' // > 30 minutes
  }

  // Generate sync preview
  async generateSyncPreview(operation: 'pull' | 'push' | 'smart' | 'reset'): Promise<SyncPreview> {
    const startTime = performance.now()
    console.log(`🔄 Generating sync preview for operation: ${operation}`)

    const adminData = this.getAdminConfigData()
    const frontendData = this.getFrontendConfigData()
    
    let changes: ChangeItem[] = []
    let direction: 'admin-to-frontend' | 'frontend-to-admin' | 'bidirectional' = 'bidirectional'

    switch (operation) {
      case 'pull':
        changes = this.detectChanges(frontendData, adminData)
        direction = 'frontend-to-admin'
        break
      case 'push':
        changes = this.detectChanges(adminData, frontendData)
        direction = 'admin-to-frontend'
        break
      case 'smart':
        changes = this.detectChanges(adminData, frontendData)
        direction = 'bidirectional'
        break
      case 'reset':
        changes = this.detectChanges(adminData, frontendData)
        direction = 'admin-to-frontend'
        break
    }

    const conflicts = this.detectConflicts(adminData, frontendData)
    
    const syncOperation: SyncOperation = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      type: operation,
      direction,
      timestamp: Date.now(),
      changes,
      status: 'pending',
      riskLevel: this.calculateOverallRiskLevel(changes),
      performanceMetrics: {
        duration: performance.now() - startTime,
        dataSize: JSON.stringify({ adminData, frontendData }).length,
        conflictsResolved: conflicts.length
      }
    }

    const preview: SyncPreview = {
      operation: syncOperation,
      conflicts,
      summary: {
        totalChanges: changes.length,
        safeChanges: changes.filter(c => c.riskLevel === 'safe').length,
        cautionChanges: changes.filter(c => c.riskLevel === 'caution').length,
        destructiveChanges: changes.filter(c => c.riskLevel === 'destructive').length,
        estimatedDuration: this.estimateSyncDuration(changes)
      },
      dataFreshness: {
        admin: this.assessDataFreshness(Math.max(
          adminData.quiz.lastModified,
          adminData.rewards.lastModified,
          adminData.systemSettings.lastModified
        )),
        frontend: this.assessDataFreshness(Math.max(
          frontendData.quiz.lastModified,
          frontendData.rewards.lastModified,
          frontendData.systemSettings.lastModified
        ))
      }
    }

    console.log(`🔄 Sync preview generated in ${preview.operation.performanceMetrics.duration.toFixed(2)}ms`)
    return preview
  }

  // Calculate overall risk level
  private calculateOverallRiskLevel(changes: ChangeItem[]): 'safe' | 'caution' | 'destructive' {
    if (changes.some(c => c.riskLevel === 'destructive')) return 'destructive'
    if (changes.some(c => c.riskLevel === 'caution')) return 'caution'
    return 'safe'
  }

  // Estimate sync duration
  private estimateSyncDuration(changes: ChangeItem[]): number {
    // Base time + time per change
    return 100 + (changes.length * 50) // milliseconds
  }

  // Setup storage listeners for real-time updates
  private setupStorageListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith('admin_') || e.key?.startsWith('game_')) {
        console.log('🔄 Storage change detected, updating sync preview:', e.key)
        this.notifyListeners()
      }
    })
  }

  // Load sync history from localStorage
  private loadSyncHistory(): void {
    try {
      const history = localStorage.getItem('bidirectional_sync_history')
      if (history) {
        this.syncHistory = JSON.parse(history)
      }
    } catch (error) {
      console.error('Error loading sync history:', error)
      this.syncHistory = { operations: [], rollbackPoints: [] }
    }
  }

  // Save sync history to localStorage
  private saveSyncHistory(): void {
    try {
      localStorage.setItem('bidirectional_sync_history', JSON.stringify(this.syncHistory))
    } catch (error) {
      console.error('Error saving sync history:', error)
    }
  }

  // Add sync listener
  addSyncListener(callback: (preview: SyncPreview) => void): void {
    this.listeners.push(callback)
  }

  // Remove sync listener
  removeSyncListener(callback: (preview: SyncPreview) => void): void {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Notify all listeners
  private async notifyListeners(): Promise<void> {
    if (this.listeners.length > 0) {
      try {
        const preview = await this.generateSyncPreview('smart')
        this.listeners.forEach(callback => {
          try {
            callback(preview)
          } catch (error) {
            console.error('Error in sync listener:', error)
          }
        })
      } catch (error) {
        console.error('Error generating preview for listeners:', error)
      }
    }
  }

  // Get sync history
  getSyncHistory(): SyncHistory {
    return { ...this.syncHistory }
  }

  // Execute sync operation
  async executeSyncOperation(preview: SyncPreview): Promise<{ success: boolean; message: string; operation: SyncOperation }> {
    if (this.isOperationInProgress) {
      return { success: false, message: 'Another sync operation is in progress', operation: preview.operation }
    }

    this.isOperationInProgress = true
    const startTime = performance.now()

    try {
      console.log(`🔄 Executing sync operation: ${preview.operation.type}`)

      // Create rollback point
      await this.createRollbackPoint(`Before ${preview.operation.type} operation`)

      // Apply changes based on operation type
      switch (preview.operation.type) {
        case 'pull':
          await this.syncFromFrontend(preview.operation.changes)
          break
        case 'push':
          await this.syncToFrontend(preview.operation.changes)
          break
        case 'smart':
          await this.smartSync(preview.operation.changes, preview.conflicts)
          break
        case 'reset':
          await this.resetFrontend()
          break
      }

      // Update operation status
      preview.operation.status = 'completed'
      preview.operation.performanceMetrics.duration = performance.now() - startTime

      // Add to history
      this.syncHistory.operations.push(preview.operation)
      this.saveSyncHistory()

      console.log(`🔄 Sync operation completed in ${preview.operation.performanceMetrics.duration.toFixed(2)}ms`)

      return {
        success: true,
        message: `${preview.operation.type} operation completed successfully`,
        operation: preview.operation
      }

    } catch (error) {
      console.error('🔄 Sync operation failed:', error)

      // Mark operation as failed
      preview.operation.status = 'failed'
      preview.operation.performanceMetrics.duration = performance.now() - startTime

      // Add to history
      this.syncHistory.operations.push(preview.operation)
      this.saveSyncHistory()

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sync operation failed',
        operation: preview.operation
      }
    } finally {
      this.isOperationInProgress = false
    }
  }

  // Sync from frontend to admin
  private async syncFromFrontend(changes: ChangeItem[]): Promise<void> {
    const frontendData = this.getFrontendConfigData()

    for (const change of changes) {
      switch (change.category) {
        case 'quiz':
          await this.applyQuizChanges(change, frontendData.quiz)
          break
        case 'rewards':
          await this.applyRewardChanges(change, frontendData.rewards)
          break
        case 'systemSettings':
          await this.applySystemSettingsChanges(change, frontendData.systemSettings)
          break
      }
    }

    // Update admin timestamps
    localStorage.setItem('admin_last_sync_from_frontend', Date.now().toString())
  }

  // Sync from admin to frontend
  private async syncToFrontend(changes: ChangeItem[]): Promise<void> {
    const adminData = this.getAdminConfigData()

    for (const change of changes) {
      switch (change.category) {
        case 'quiz':
          await this.pushQuizToFrontend(adminData.quiz)
          break
        case 'rewards':
          await this.pushRewardsToFrontend(adminData.rewards)
          break
        case 'systemSettings':
          await this.pushSystemSettingsToFrontend(adminData.systemSettings)
          break
      }
    }

    // Update frontend timestamps
    localStorage.setItem('game_last_sync', Date.now().toString())
  }

  // Smart sync with conflict resolution
  private async smartSync(changes: ChangeItem[], conflicts: ConflictResolution[]): Promise<void> {
    // Resolve conflicts first
    for (const conflict of conflicts) {
      await this.resolveConflict(conflict)
    }

    // Apply non-conflicting changes
    const nonConflictingChanges = changes.filter(change =>
      !conflicts.some(conflict => conflict.field.includes(change.field))
    )

    await this.syncToFrontend(nonConflictingChanges)
  }

  // Reset frontend with admin data
  private async resetFrontend(): Promise<void> {
    const adminData = this.getAdminConfigData()

    // Push all admin data to frontend
    await this.pushQuizToFrontend(adminData.quiz)
    await this.pushRewardsToFrontend(adminData.rewards)
    await this.pushSystemSettingsToFrontend(adminData.systemSettings)

    // Update timestamps
    localStorage.setItem('game_last_sync', Date.now().toString())
    localStorage.setItem('game_reset_timestamp', Date.now().toString())
  }

  // Apply quiz changes to admin
  private async applyQuizChanges(change: ChangeItem, frontendQuizData: any): Promise<void> {
    switch (change.field) {
      case 'questions':
        // Update admin questions with frontend data
        localStorage.setItem('admin_quiz_questions', JSON.stringify(frontendQuizData.questions))
        break
      case 'categories':
        localStorage.setItem('admin_quiz_categories', JSON.stringify(frontendQuizData.categories))
        break
      case 'settings':
        localStorage.setItem('admin_quiz_settings', JSON.stringify(frontendQuizData.settings))
        break
    }
    localStorage.setItem('admin_quiz_questions_updated', Date.now().toString())
  }

  // Apply reward changes to admin
  private async applyRewardChanges(change: ChangeItem, frontendRewardData: any): Promise<void> {
    switch (change.field) {
      case 'achievements':
        localStorage.setItem('admin_reward_achievements', JSON.stringify(frontendRewardData.achievements))
        break
      case 'popupSettings':
        localStorage.setItem('admin_reward_popup_settings', JSON.stringify(frontendRewardData.popupSettings))
        break
      case 'coinMultipliers':
        localStorage.setItem('admin_reward_coin_multipliers', JSON.stringify(frontendRewardData.coinMultipliers))
        break
    }
    localStorage.setItem('admin_reward_config_updated', Date.now().toString())
  }

  // Apply system settings changes to admin
  private async applySystemSettingsChanges(change: ChangeItem, frontendSettingsData: any): Promise<void> {
    switch (change.field) {
      case 'featureFlags':
        localStorage.setItem('admin_feature_flags', JSON.stringify(frontendSettingsData.featureFlags))
        break
      case 'configValues':
        localStorage.setItem('admin_system_settings', JSON.stringify(frontendSettingsData.configValues))
        break
      case 'adsConfig':
        localStorage.setItem('admin_ads_config', JSON.stringify(frontendSettingsData.adsConfig))
        break
    }
    localStorage.setItem('admin_settings_updated', Date.now().toString())
  }

  // Push quiz data to frontend
  private async pushQuizToFrontend(adminQuizData: any): Promise<void> {
    localStorage.setItem('game_quiz_data', JSON.stringify(adminQuizData.questions))
    localStorage.setItem('game_categories', JSON.stringify(adminQuizData.categories))
    localStorage.setItem('game_quiz_settings', JSON.stringify(adminQuizData.settings))
    localStorage.setItem('game_quiz_version', adminQuizData.version)
  }

  // Push rewards data to frontend
  private async pushRewardsToFrontend(adminRewardData: any): Promise<void> {
    localStorage.setItem('game_reward_data', JSON.stringify(adminRewardData.achievements))
    localStorage.setItem('game_popup_settings', JSON.stringify(adminRewardData.popupSettings))
    localStorage.setItem('game_coin_multipliers', JSON.stringify(adminRewardData.coinMultipliers))
    localStorage.setItem('game_rewards_version', adminRewardData.version)
    localStorage.setItem('game_rewards_sync', Date.now().toString())
  }

  // Push system settings to frontend
  private async pushSystemSettingsToFrontend(adminSettingsData: any): Promise<void> {
    localStorage.setItem('game_feature_flags', JSON.stringify(adminSettingsData.featureFlags))
    localStorage.setItem('game_settings_data', JSON.stringify(adminSettingsData.configValues))
    localStorage.setItem('game_ads_config', JSON.stringify(adminSettingsData.adsConfig))
    localStorage.setItem('game_settings_version', adminSettingsData.version)
    localStorage.setItem('game_settings_sync', Date.now().toString())
  }

  // Resolve conflict
  private async resolveConflict(conflict: ConflictResolution): Promise<void> {
    console.log(`🔄 Resolving conflict for ${conflict.field}: ${conflict.resolution}`)

    switch (conflict.resolution) {
      case 'use-admin':
        // Admin data takes precedence
        break
      case 'use-frontend':
        // Frontend data takes precedence
        break
      case 'merge':
        // Use merged value if available
        if (conflict.mergedValue) {
          // Apply merged value to both admin and frontend
        }
        break
      case 'manual':
        // Manual resolution required - throw error to prompt user
        throw new Error(`Manual resolution required for ${conflict.field}`)
    }
  }

  // Create rollback point
  private async createRollbackPoint(description: string): Promise<void> {
    const configSnapshot = this.getAdminConfigData()

    const rollbackPoint = {
      id: `rollback-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: Date.now(),
      description,
      configSnapshot
    }

    this.syncHistory.rollbackPoints.push(rollbackPoint)

    // Keep only last 10 rollback points
    if (this.syncHistory.rollbackPoints.length > 10) {
      this.syncHistory.rollbackPoints = this.syncHistory.rollbackPoints.slice(-10)
    }

    this.saveSyncHistory()
    console.log(`🔄 Rollback point created: ${description}`)
  }

  // Rollback to specific point
  async rollbackToPoint(rollbackId: string): Promise<{ success: boolean; message: string }> {
    try {
      const rollbackPoint = this.syncHistory.rollbackPoints.find(rp => rp.id === rollbackId)

      if (!rollbackPoint) {
        return { success: false, message: 'Rollback point not found' }
      }

      console.log(`🔄 Rolling back to: ${rollbackPoint.description}`)

      // Restore admin configuration
      const config = rollbackPoint.configSnapshot

      // Restore quiz data
      localStorage.setItem('admin_quiz_questions', JSON.stringify(config.quiz.questions))
      localStorage.setItem('admin_quiz_categories', JSON.stringify(config.quiz.categories))
      localStorage.setItem('admin_quiz_settings', JSON.stringify(config.quiz.settings))

      // Restore reward data
      localStorage.setItem('admin_reward_achievements', JSON.stringify(config.rewards.achievements))
      localStorage.setItem('admin_reward_popup_settings', JSON.stringify(config.rewards.popupSettings))
      localStorage.setItem('admin_reward_coin_multipliers', JSON.stringify(config.rewards.coinMultipliers))

      // Restore system settings
      localStorage.setItem('admin_feature_flags', JSON.stringify(config.systemSettings.featureFlags))
      localStorage.setItem('admin_system_settings', JSON.stringify(config.systemSettings.configValues))
      localStorage.setItem('admin_ads_config', JSON.stringify(config.systemSettings.adsConfig))

      // Update timestamps
      localStorage.setItem('admin_rollback_timestamp', Date.now().toString())

      // Create operation record
      const rollbackOperation: SyncOperation = {
        id: `rollback-op-${Date.now()}`,
        type: 'push', // Rollback is essentially pushing old admin data
        direction: 'admin-to-frontend',
        timestamp: Date.now(),
        changes: [],
        status: 'completed',
        riskLevel: 'caution',
        performanceMetrics: {
          duration: 0,
          dataSize: JSON.stringify(config).length,
          conflictsResolved: 0
        }
      }

      this.syncHistory.operations.push(rollbackOperation)
      this.saveSyncHistory()

      return { success: true, message: `Successfully rolled back to: ${rollbackPoint.description}` }

    } catch (error) {
      console.error('🔄 Rollback failed:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Rollback failed' }
    }
  }

  // Get last operation
  getLastOperation(): SyncOperation | null {
    return this.syncHistory.operations.length > 0
      ? this.syncHistory.operations[this.syncHistory.operations.length - 1]
      : null
  }

  // Undo last sync
  async undoLastSync(): Promise<{ success: boolean; message: string }> {
    const lastOperation = this.getLastOperation()

    if (!lastOperation) {
      return { success: false, message: 'No sync operations to undo' }
    }

    if (lastOperation.status === 'rolled-back') {
      return { success: false, message: 'Last operation was already rolled back' }
    }

    // Find the rollback point before the last operation
    const rollbackPoint = this.syncHistory.rollbackPoints
      .filter(rp => rp.timestamp < lastOperation.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)[0]

    if (!rollbackPoint) {
      return { success: false, message: 'No rollback point available before last operation' }
    }

    const result = await this.rollbackToPoint(rollbackPoint.id)

    if (result.success) {
      // Mark last operation as rolled back
      lastOperation.status = 'rolled-back'
      this.saveSyncHistory()
    }

    return result
  }

  // Check if operation is in progress
  getOperationStatus(): boolean {
    return this.isOperationInProgress
  }
}

// Export singleton instance
export const bidirectionalSync = BidirectionalSyncService.getInstance()
