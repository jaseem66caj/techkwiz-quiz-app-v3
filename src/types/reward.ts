// Reward configuration interface
export interface RewardConfig {
  id: string
  coinValues: {
    correct: number
    incorrect: number
    bonus: number
    dailyBonus: number
    streakBonus: number
  }
  streakSettings: {
    enabled: boolean
    multiplierPerDay: number
    maxMultiplier: number
    resetOnWrongAnswer: boolean
  }
  popupSettings: {
    enabled: boolean
    showAfterQuestions: number
    duration: number
    showFunFact: boolean
    customMessages: {
      correct: string
      incorrect: string
      bonus: string
    }
  }
  adSettings: {
    enabled: boolean
    frequency: number
    minQuestionsBetweenAds: number
    rewardCoins: number
  }
  achievements: Achievement[]
  createdAt: number
  updatedAt: number
}

// Achievement interface
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  requirement: {
    type: 'questions_answered' | 'correct_answers' | 'streak_days' | 'coins_earned'
    value: number
  }
  reward: {
    coins: number
    badge: boolean
  }
  hidden: boolean
  createdAt: number
  updatedAt: number
}

// Popup settings interface
export interface PopupSettings {
  enabled: boolean
  showAfterQuestions: number
  duration: number
  showFunFact: boolean
  customMessages: {
    correct: string
    incorrect: string
    bonus: string
  }
}

// AdSense configuration interface
export interface AdSenseConfig {
  enabled: boolean
  publisherId: string
  adSlots: {
    [key: string]: string
  }
}

// Reward preview data interface
export interface RewardPreviewData {
  type: 'correct' | 'incorrect' | 'bonus' | 'achievement'
  coins: number
  message: string
  funFact?: string
  achievement?: Achievement
}

// Reward storage keys
export const REWARD_STORAGE_KEYS = {
  CONFIG: 'admin_reward_config',
  ACHIEVEMENTS: 'admin_reward_achievements',
  SETTINGS: 'admin_reward_settings',
  BACKUP: 'admin_reward_backup'
} as const

// Default reward configuration
export const DEFAULT_REWARD_CONFIG: Omit<RewardConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  coinValues: {
    correct: 25,
    incorrect: 0,
    bonus: 50,
    dailyBonus: 100,
    streakBonus: 10
  },
  streakSettings: {
    enabled: true,
    multiplierPerDay: 1.1,
    maxMultiplier: 3,
    resetOnWrongAnswer: true
  },
  popupSettings: {
    enabled: true,
    showAfterQuestions: 1,
    duration: 3,
    showFunFact: true,
    customMessages: {
      correct: 'Great job! You earned {coins} coins!',
      incorrect: 'Better luck next time!',
      bonus: 'Bonus! You earned {coins} extra coins!'
    }
  },
  adSettings: {
    enabled: true,
    frequency: 3,
    minQuestionsBetweenAds: 2,
    rewardCoins: 100
  },
  achievements: []
}

// Default achievement templates
export const DEFAULT_ACHIEVEMENT_TEMPLATES: Achievement[] = [
  {
    id: 'first_quiz',
    name: 'First Steps',
    description: 'Complete your first quiz',
    icon: '🎯',
    requirement: {
      type: 'questions_answered',
      value: 5
    },
    reward: {
      coins: 50,
      badge: true
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Answer 100 questions correctly',
    icon: '🏆',
    requirement: {
      type: 'correct_answers',
      value: 100
    },
    reward: {
      coins: 500,
      badge: true
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'streak_warrior',
    name: 'Streak Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    requirement: {
      type: 'streak_days',
      value: 7
    },
    reward: {
      coins: 200,
      badge: true
    },
    hidden: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

