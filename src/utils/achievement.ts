// ===================================================================
// TechKwiz Enhanced Achievement Utility Functions
// ===================================================================
// This file contains utility functions for managing enhanced achievements
// in the TechKwiz application. These functions provide helper methods for
// achievement progress tracking, calculation, and management.

import { User } from './auth';
import { Achievement } from '../types/reward';
import { getAllAchievements, getUnlockedAchievements } from './achievements';

/**
 * Calculate achievement progress percentage
 * @param achievement - The achievement to calculate progress for
 * @param user - The user to calculate progress for
 * @returns Progress percentage (0-100)
 */
export const calculateAchievementProgress = (achievement: Achievement, user: User): number => {
  switch (achievement.requirement.type) {
    case 'questions_answered':
      const answered = user.totalQuizzes * 5; // Assuming 5 questions per quiz
      return Math.min(100, Math.round((answered / achievement.requirement.value) * 100));
    
    case 'correct_answers':
      return Math.min(100, Math.round((user.correctAnswers / achievement.requirement.value) * 100));
    
    case 'coins_earned':
      return Math.min(100, Math.round((user.coins / achievement.requirement.value) * 100));
    
    case 'streak_days':
      return Math.min(100, Math.round((user.streak / achievement.requirement.value) * 100));
    
    default:
      return 0;
  }
};

/**
 * Get achievements with progress information
 * @param user - The user to get achievements for
 * @returns Array of achievements with progress information
 */
export const getAchievementsWithProgress = (user: User): (Achievement & { progress: number; isClose: boolean })[] => {
  const allAchievements = getAllAchievements();
  const unlockedAchievements = getUnlockedAchievements(user);
  
  return allAchievements.map(achievement => {
    const isUnlocked = unlockedAchievements.some(unlocked => unlocked.id === achievement.id);
    const progress = isUnlocked ? 100 : calculateAchievementProgress(achievement, user);
    const isClose = progress >= 75 && progress < 100;
    
    return {
      ...achievement,
      progress,
      isClose
    };
  });
};

/**
 * Get user achievement statistics
 * @param user - The user to get statistics for
 * @returns Object containing achievement statistics
 */
export const getUserAchievementStats = (user: User): {
  total: number;
  unlocked: number;
  locked: number;
  closeToUnlocking: number;
  rareAchievements: number;
} => {
  const allAchievements = getAllAchievements();
  const unlockedAchievements = getUnlockedAchievements(user);
  
  const closeToUnlocking = allAchievements.filter(achievement => {
    if (unlockedAchievements.some(unlocked => unlocked.id === achievement.id)) return false;
    const progress = calculateAchievementProgress(achievement, user);
    return progress >= 75;
  }).length;
  
  // For now, we'll consider achievements with high requirements as "rare"
  const rareAchievements = allAchievements.filter(achievement => {
    switch (achievement.requirement.type) {
      case 'correct_answers':
        return achievement.requirement.value >= 100;
      case 'coins_earned':
        return achievement.requirement.value >= 1000;
      case 'streak_days':
        return achievement.requirement.value >= 7;
      default:
        return false;
    }
  }).length;
  
  return {
    total: allAchievements.length,
    unlocked: unlockedAchievements.length,
    locked: allAchievements.length - unlockedAchievements.length,
    closeToUnlocking,
    rareAchievements
  };
};

/**
 * Check if an achievement is rare
 * @param achievement - The achievement to check
 * @returns Boolean indicating if the achievement is rare
 */
export const isRareAchievement = (achievement: Achievement): boolean => {
  // For now, we'll consider achievements with high requirements as "rare"
  switch (achievement.requirement.type) {
    case 'correct_answers':
      return achievement.requirement.value >= 100;
    case 'coins_earned':
      return achievement.requirement.value >= 1000;
    case 'streak_days':
      return achievement.requirement.value >= 7;
    default:
      return false;
  }
};

/**
 * Generate social share text for an achievement
 * @param achievement - The achievement to generate share text for
 * @returns Share text for social media
 */
export const generateAchievementShareText = (achievement: Achievement): string => {
  return `I just unlocked the "${achievement.name}" achievement on TechKwiz! ${achievement.description} #TechKwiz #Achievement`;
};