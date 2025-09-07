'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '../app/providers'

interface RevenueMetrics {
  totalCoinsEarned: number
  totalCoinsSpent: number
  adViews: number
  referrals: number
  dailyStreak: number
  lastLoginDate: string
  premiumFeatures: string[]
  lifetimeValue: number
}

interface CoinMultiplier {
  type: 'streak' | 'daily_bonus' | 'referral' | 'premium' | 'event'
  multiplier: number
  duration: number // minutes
  expiresAt: number
  active: boolean
}

interface LimitedOffer {
  id: string
  title: string
  description: string
  discount: number
  originalPrice: number
  finalPrice: number
  endTime: number
  icon: string
  shown: boolean
  claimed: boolean
}

export function useRevenueOptimization() {
  const { state, dispatch } = useApp()
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    adViews: 0,
    referrals: 0,
    dailyStreak: 0,
    lastLoginDate: '',
    premiumFeatures: [],
    lifetimeValue: 0
  })

  const [activeMultipliers, setActiveMultipliers] = useState<CoinMultiplier[]>([])
  const [currentOffers, setCurrentOffers] = useState<LimitedOffer[]>([])


  // Load revenue data from localStorage
  useEffect(() => {
    const savedMetrics = localStorage.getItem('techkwiz_revenue_metrics')
    if (savedMetrics) {
      try {
        setRevenueMetrics(JSON.parse(savedMetrics))
      } catch (error) {
        console.error('Error loading revenue metrics:', error)
      }
    }

    const savedMultipliers = localStorage.getItem('techkwiz_multipliers')
    if (savedMultipliers) {
      try {
        const multipliers = JSON.parse(savedMultipliers)
        // Filter out expired multipliers
        const activeOnes = multipliers.filter((m: CoinMultiplier) => m.expiresAt > Date.now())
        setActiveMultipliers(activeOnes)
      } catch (error) {
        console.error('Error loading multipliers:', error)
      }
    }

    checkDailyBonus()
    generateLimitedTimeOffers()
  }, [])

  // Save revenue data whenever it changes
  useEffect(() => {
    localStorage.setItem('techkwiz_revenue_metrics', JSON.stringify(revenueMetrics))
  }, [revenueMetrics])

  useEffect(() => {
    localStorage.setItem('techkwiz_multipliers', JSON.stringify(activeMultipliers))
  }, [activeMultipliers])

  // Enhanced coin calculation with multipliers
  const calculateCoinsWithMultipliers = useCallback((baseCoins: number) => {
    let totalMultiplier = 1
    
    activeMultipliers.forEach(multiplier => {
      if (multiplier.active && multiplier.expiresAt > Date.now()) {
        totalMultiplier *= multiplier.multiplier
      }
    })

    return Math.floor(baseCoins * totalMultiplier)
  }, [activeMultipliers])

  // Award coins with enhanced system
  const awardCoins = useCallback((baseAmount: number, source: 'quiz' | 'daily' | 'referral' | 'ad' | 'bonus') => {
    const enhancedAmount = calculateCoinsWithMultipliers(baseAmount)
    
    // Update user coins
    dispatch({ type: 'UPDATE_COINS', payload: enhancedAmount })
    
    // Update revenue metrics
    setRevenueMetrics(prev => ({
      ...prev,
      totalCoinsEarned: prev.totalCoinsEarned + enhancedAmount,
      lifetimeValue: prev.lifetimeValue + (enhancedAmount * 0.01) // Assume 1 coin = $0.01 value
    }))

    return enhancedAmount
  }, [calculateCoinsWithMultipliers, dispatch])

  // Add multiplier
  const addMultiplier = useCallback((type: CoinMultiplier['type'], multiplier: number, durationMinutes: number) => {
    const newMultiplier: CoinMultiplier = {
      type,
      multiplier,
      duration: durationMinutes,
      expiresAt: Date.now() + (durationMinutes * 60 * 1000),
      active: true
    }

    setActiveMultipliers(prev => [...prev, newMultiplier])
    return newMultiplier
  }, [])

  // Track ad view and reward
  const trackAdView = useCallback((rewardCoins: number = 100) => {
    const enhancedReward = awardCoins(rewardCoins, 'ad')
    
    setRevenueMetrics(prev => ({
      ...prev,
      adViews: prev.adViews + 1
    }))

    // Add ad view multiplier for next quiz (if user watches multiple ads)
    if (revenueMetrics.adViews > 0 && revenueMetrics.adViews % 3 === 0) {
      addMultiplier('streak', 1.5, 30) // 1.5x multiplier for 30 minutes after every 3 ads
    }

    return enhancedReward
  }, [awardCoins, revenueMetrics.adViews, addMultiplier])

  // Check and show daily bonus
  const checkDailyBonus = useCallback(() => {
    const today = new Date().toDateString()
    const lastLogin = localStorage.getItem('techkwiz_last_login')
    
    if (lastLogin !== today) {
      // Calculate streak
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isConsecutive = lastLogin === yesterday.toDateString()
      
      const currentStreak = isConsecutive ? revenueMetrics.dailyStreak + 1 : 1
      
      setRevenueMetrics(prev => ({
        ...prev,
        dailyStreak: currentStreak,
        lastLoginDate: today
      }))
      
      localStorage.setItem('techkwiz_last_login', today)
      // Daily bonus modal removed - bonus automatically applied
      
      return currentStreak
    }
    
    return revenueMetrics.dailyStreak
  }, [revenueMetrics.dailyStreak])

  // Generate limited-time offers based on user behavior
  const generateLimitedTimeOffers = useCallback(() => {
    const now = Date.now()
    const userCoins = state.user?.coins || 0
    
    const offers: LimitedOffer[] = []

    // Low coins offer - only show if user has less than 50 coins
    if (userCoins < 50 && revenueMetrics.adViews < 5) {
      offers.push({
        id: 'coin_boost_starter',
        title: '🚀 Starter Coin Boost!',
        description: 'Get 500 coins instantly + 2x multiplier for 1 hour',
        discount: 60,
        originalPrice: 250,
        finalPrice: 100,
        endTime: now + (2 * 60 * 60 * 1000), // 2 hours
        icon: '💰',
        shown: false,
        claimed: false
      })
    }

    // High engagement offer - for users with good streak
    if (revenueMetrics.dailyStreak >= 3) {
      offers.push({
        id: 'streak_master_deal',
        title: '🔥 Streak Master Deal!',
        description: '3x coin multiplier for 24 hours + 1000 bonus coins',
        discount: 50,
        originalPrice: 1000,
        finalPrice: 500,
        endTime: now + (4 * 60 * 60 * 1000), // 4 hours
        icon: '👑',
        shown: false,
        claimed: false
      })
    }

    // Weekend special - only on weekends
    const dayOfWeek = new Date().getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
      offers.push({
        id: 'weekend_special',
        title: '🎉 Weekend Special!',
        description: 'Unlimited quiz attempts + premium features for 48h',
        discount: 70,
        originalPrice: 800,
        finalPrice: 240,
        endTime: now + (6 * 60 * 60 * 1000), // 6 hours
        icon: '🎁',
        shown: false,
        claimed: false
      })
    }

    setCurrentOffers(offers)
  }, [state.user?.coins, revenueMetrics])



  // Handle referral
  const processReferral = useCallback((referralCode: string) => {
    // Award referral bonus
    awardCoins(100, 'referral')
    
    setRevenueMetrics(prev => ({
      ...prev,
      referrals: prev.referrals + 1
    }))

    // Add referral multiplier
    addMultiplier('referral', 1.25, 120) // 1.25x multiplier for 2 hours
  }, [awardCoins, addMultiplier])

  // Get current total multiplier
  const getCurrentMultiplier = useCallback(() => {
    return activeMultipliers.reduce((total, multiplier) => {
      if (multiplier.active && multiplier.expiresAt > Date.now()) {
        return total * multiplier.multiplier
      }
      return total
    }, 1)
  }, [activeMultipliers])

  // Clean up expired multipliers
  useEffect(() => {
    const cleanup = setInterval(() => {
      setActiveMultipliers(prev => 
        prev.filter(multiplier => multiplier.expiresAt > Date.now())
      )
    }, 60000) // Check every minute

    return () => clearInterval(cleanup)
  }, [])

  // Revenue optimization recommendations
  const getRevenueRecommendations = useCallback(() => {
    const recommendations = []
    
    if (revenueMetrics.adViews < 5) {
      recommendations.push({
        type: 'ad_engagement',
        message: 'Watch ads to earn bonus coins and unlock multipliers!',
        priority: 'high'
      })
    }
    
    if (revenueMetrics.dailyStreak < 3) {
      recommendations.push({
        type: 'daily_engagement',
        message: 'Build your daily streak for bigger bonuses!',
        priority: 'medium'
      })
    }
    
    if (revenueMetrics.referrals === 0) {
      recommendations.push({
        type: 'referral',
        message: 'Invite friends to earn referral bonuses!',
        priority: 'medium'
      })
    }
    
    return recommendations
  }, [revenueMetrics])

  return {
    revenueMetrics,
    activeMultipliers,
    currentOffers,
    awardCoins,
    trackAdView,
    processReferral,
    addMultiplier,
    getCurrentMultiplier,
    calculateCoinsWithMultipliers,
    getRevenueRecommendations,
    generateLimitedTimeOffers
  }
}