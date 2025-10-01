// Mock frontend quiz data generator for testing comprehensive sync
export class MockFrontendDataGenerator {
  private static instance: MockFrontendDataGenerator
  private isGenerating = false

  static getInstance(): MockFrontendDataGenerator {
    if (!MockFrontendDataGenerator.instance) {
      MockFrontendDataGenerator.instance = new MockFrontendDataGenerator()
    }
    return MockFrontendDataGenerator.instance
  }

  // Generate realistic quiz session data
  generateQuizSessions(count: number = 10): any[] {
    const sessions = []
    const categories = ['Movies', 'Social Media', 'Gaming', 'Music', 'Travel', 'Food', 'Animals', 'Facts']
    
    for (let i = 0; i < count; i++) {
      const questionsAnswered = Math.floor(Math.random() * 15) + 5 // 5-20 questions
      const correctRate = 0.6 + Math.random() * 0.3 // 60-90% success rate
      const correctAnswers = Math.floor(questionsAnswered * correctRate)
      
      const session = {
        id: `session-${Date.now()}-${i}`,
        startTime: Date.now() - Math.random() * 86400000, // Within last 24 hours
        endTime: Date.now() - Math.random() * 43200000, // Within last 12 hours
        questionsAnswered: Array.from({ length: questionsAnswered }, (_, qIndex) => ({
          id: `q-${i}-${qIndex}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          correct: qIndex < correctAnswers,
          timeSpent: Math.floor(Math.random() * 30000) + 5000, // 5-35 seconds
          difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]
        })),
        coinsEarned: correctAnswers * 10 + Math.floor(Math.random() * 50), // Base + bonus
        duration: Math.floor(Math.random() * 600000) + 120000, // 2-12 minutes
        active: Math.random() > 0.8 // 20% chance of being active
      }
      
      sessions.push(session)
    }
    
    return sessions
  }

  // Generate user progress data
  generateUserProgress(): any {
    const achievements = [
      'first_question', 'streak_5', 'streak_10', 'category_master_movies',
      'speed_demon', 'perfect_score', 'coin_collector', 'daily_player'
    ]
    
    const unlockedAchievements = achievements.filter(() => Math.random() > 0.4)
    
    return {
      level: Math.floor(Math.random() * 20) + 1,
      totalXP: Math.floor(Math.random() * 10000) + 1000,
      achievements: unlockedAchievements.reduce((acc, achievement) => {
        acc[achievement] = {
          unlockedAt: Date.now() - Math.random() * 604800000, // Within last week
          progress: 100
        }
        return acc
      }, {} as Record<string, any>),
      categoryProgress: {
        'Movies': { level: 5, xp: 1250 },
        'Gaming': { level: 3, xp: 750 },
        'Music': { level: 7, xp: 1750 },
        'Travel': { level: 2, xp: 500 }
      }
    }
  }

  // Generate game statistics
  generateGameStats(): any {
    return {
      totalQuestionsAnswered: Math.floor(Math.random() * 500) + 100,
      correctAnswers: Math.floor(Math.random() * 400) + 80,
      totalCoinsEarned: Math.floor(Math.random() * 5000) + 1000,
      totalPlayTime: Math.floor(Math.random() * 3600000) + 600000, // 10 minutes to 1+ hours
      averageSessionTime: Math.floor(Math.random() * 300000) + 120000, // 2-7 minutes
      longestStreak: Math.floor(Math.random() * 25) + 5,
      categoriesPlayed: ['Movies', 'Gaming', 'Music', 'Travel', 'Food'],
      lastPlayed: Date.now() - Math.random() * 86400000 // Within last 24 hours
    }
  }

  // Generate recent actions
  generateRecentActions(count: number = 15): any[] {
    const actionTypes = [
      'question_answered', 'achievement_unlocked', 'coins_earned', 
      'category_completed', 'streak_achieved', 'level_up'
    ]
    
    const actions = []
    
    for (let i = 0; i < count; i++) {
      const type = actionTypes[Math.floor(Math.random() * actionTypes.length)]
      const timestamp = Date.now() - Math.random() * 86400000 // Within last 24 hours
      
      let description = ''
      switch (type) {
        case 'question_answered':
          description = `Answered ${Math.floor(Math.random() * 10) + 1} questions correctly`
          break
        case 'achievement_unlocked':
          description = `Unlocked "${['Speed Demon', 'Perfect Score', 'Streak Master'][Math.floor(Math.random() * 3)]}" achievement`
          break
        case 'coins_earned':
          description = `Earned ${Math.floor(Math.random() * 100) + 10} coins`
          break
        case 'category_completed':
          description = `Completed Movies category quiz`
          break
        case 'streak_achieved':
          description = `Achieved ${Math.floor(Math.random() * 10) + 5} question streak`
          break
        case 'level_up':
          description = `Reached level ${Math.floor(Math.random() * 20) + 1}`
          break
      }
      
      actions.push({
        id: `action-${i}`,
        type,
        description,
        timestamp,
        data: {
          value: Math.floor(Math.random() * 100),
          category: ['Movies', 'Gaming', 'Music'][Math.floor(Math.random() * 3)]
        }
      })
    }
    
    return actions.sort((a, b) => b.timestamp - a.timestamp)
  }

  // Generate user sessions
  generateUserSessions(count: number = 5): any[] {
    const sessions = []
    
    for (let i = 0; i < count; i++) {
      sessions.push({
        id: `user-session-${i}`,
        userId: `user-${Math.floor(Math.random() * 1000)}`,
        startTime: Date.now() - Math.random() * 86400000,
        endTime: Math.random() > 0.3 ? Date.now() - Math.random() * 43200000 : null,
        active: Math.random() > 0.7, // 30% chance of being active
        questionsAnswered: Math.floor(Math.random() * 20) + 1,
        coinsEarned: Math.floor(Math.random() * 200) + 50,
        pageViews: Math.floor(Math.random() * 10) + 3
      })
    }
    
    return sessions
  }

  // Generate page views data
  generatePageViews(): any {
    return {
      '/': Math.floor(Math.random() * 1000) + 500,
      '/quiz': Math.floor(Math.random() * 800) + 300,
      '/categories': Math.floor(Math.random() * 400) + 200,
      '/achievements': Math.floor(Math.random() * 300) + 100,
      '/leaderboard': Math.floor(Math.random() * 250) + 75,
      '/profile': Math.floor(Math.random() * 200) + 50
    }
  }

  // Generate user engagement data
  generateUserEngagement(): any {
    return {
      averageEngagement: Math.floor(Math.random() * 40) + 60, // 60-100%
      totalSessions: Math.floor(Math.random() * 200) + 50,
      averageSessionDuration: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
      bounceRate: Math.floor(Math.random() * 30) + 10, // 10-40%
      returnVisitorRate: Math.floor(Math.random() * 50) + 40 // 40-90%
    }
  }

  // Generate conversion data
  generateConversionData(): any {
    return {
      rate: Math.floor(Math.random() * 30) + 70, // 70-100% conversion rate
      totalConversions: Math.floor(Math.random() * 100) + 50,
      conversionsByCategory: {
        'Movies': Math.floor(Math.random() * 25) + 10,
        'Gaming': Math.floor(Math.random() * 20) + 8,
        'Music': Math.floor(Math.random() * 30) + 15,
        'Travel': Math.floor(Math.random() * 15) + 5
      }
    }
  }

  // Generate active users data
  generateActiveUsers(count: number = 8): any[] {
    const users = []
    
    for (let i = 0; i < count; i++) {
      users.push({
        id: `user-${i}`,
        username: `Player${Math.floor(Math.random() * 1000)}`,
        lastActive: Date.now() - Math.random() * 3600000, // Within last hour
        currentSession: Math.random() > 0.5,
        questionsAnswered: Math.floor(Math.random() * 50) + 10,
        totalCoins: Math.floor(Math.random() * 1000) + 100,
        level: Math.floor(Math.random() * 15) + 1
      })
    }
    
    return users
  }

  // Populate localStorage with mock data
  populateMockData(): void {
    if (this.isGenerating) return
    
    this.isGenerating = true
    console.info('🎭 Generating mock frontend data...')
    
    try {
      // Generate and store all mock data
      localStorage.setItem('quiz_sessions', JSON.stringify(this.generateQuizSessions(15)))
      localStorage.setItem('user_progress', JSON.stringify(this.generateUserProgress()))
      localStorage.setItem('game_stats', JSON.stringify(this.generateGameStats()))
      localStorage.setItem('recent_actions', JSON.stringify(this.generateRecentActions(20)))
      localStorage.setItem('user_sessions', JSON.stringify(this.generateUserSessions(8)))
      localStorage.setItem('page_views', JSON.stringify(this.generatePageViews()))
      localStorage.setItem('user_engagement', JSON.stringify(this.generateUserEngagement()))
      localStorage.setItem('conversion_data', JSON.stringify(this.generateConversionData()))
      localStorage.setItem('active_users', JSON.stringify(this.generateActiveUsers(12)))
      
      // Add timestamp
      localStorage.setItem('mock_data_generated', Date.now().toString())
      
      console.info('🎭 Mock frontend data generated successfully!')
      
      // Trigger storage event to notify sync service
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'quiz_sessions',
        newValue: localStorage.getItem('quiz_sessions'),
        storageArea: localStorage
      }))
      
    } catch (error) {
      console.error('🎭 Error generating mock data:', error)
    } finally {
      this.isGenerating = false
    }
  }

  // Update mock data with new values (simulates real user activity)
  updateMockData(): void {
    try {
      // Update recent actions with new activity
      const existingActions = JSON.parse(localStorage.getItem('recent_actions') || '[]')
      const newActions = this.generateRecentActions(3)
      const updatedActions = [...newActions, ...existingActions].slice(0, 20)
      localStorage.setItem('recent_actions', JSON.stringify(updatedActions))
      
      // Update game stats
      const gameStats = JSON.parse(localStorage.getItem('game_stats') || '{}')
      gameStats.totalQuestionsAnswered = (gameStats.totalQuestionsAnswered || 0) + Math.floor(Math.random() * 5) + 1
      gameStats.correctAnswers = (gameStats.correctAnswers || 0) + Math.floor(Math.random() * 4) + 1
      gameStats.totalCoinsEarned = (gameStats.totalCoinsEarned || 0) + Math.floor(Math.random() * 50) + 10
      gameStats.lastPlayed = Date.now()
      localStorage.setItem('game_stats', JSON.stringify(gameStats))
      
      // Update page views
      const pageViews = JSON.parse(localStorage.getItem('page_views') || '{}')
      Object.keys(pageViews).forEach(page => {
        pageViews[page] += Math.floor(Math.random() * 5) + 1
      })
      localStorage.setItem('page_views', JSON.stringify(pageViews))
      
      console.info('🎭 Mock data updated with new activity')
      
      // Trigger storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'game_stats',
        newValue: localStorage.getItem('game_stats'),
        storageArea: localStorage
      }))
      
    } catch (error) {
      console.error('🎭 Error updating mock data:', error)
    }
  }

  // Start periodic updates to simulate real activity
  startPeriodicUpdates(intervalMs: number = 30000): NodeJS.Timeout {
    return setInterval(() => {
      this.updateMockData()
    }, intervalMs)
  }

  // Clear all mock data
  clearMockData(): void {
    const mockKeys = [
      'quiz_sessions', 'user_progress', 'game_stats', 'recent_actions',
      'user_sessions', 'page_views', 'user_engagement', 'conversion_data',
      'active_users', 'mock_data_generated'
    ]
    
    mockKeys.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.info('🎭 Mock data cleared')
  }
}

// Export singleton instance
export const mockFrontendData = MockFrontendDataGenerator.getInstance()
