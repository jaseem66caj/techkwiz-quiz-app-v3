// ===================================================================
// TechKwiz Achievements System
// ===================================================================
// This file manages the achievement system for the TechKwiz application.
// It defines predefined achievements that users can unlock based on their
// quiz performance, coin earnings, and other activities. The system tracks
// user progress and determines which achievements have been unlocked.

import { Achievement } from '@/types/reward';
import { User } from '@/utils/auth';

// ===================================================================
// Predefined Achievement Templates
// ===================================================================
// Collection of achievement templates that define the criteria for unlocking
// various rewards in the application. Each achievement has specific requirements
// related to user activities like answering questions, earning coins, or maintaining streaks.

export const achievements: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    // Achievement for completing the first quiz
    name: 'First Quiz',
    description: 'Complete your first quiz',
    icon: '🏆',
    requirement: {
      type: 'questions_answered',
      value: 5  // Requires answering 5 questions
    },
    reward: {
      coins: 50,   // Reward of 50 coins
      badge: true  // Also grants a badge
    },
    hidden: false  // Visible to users
  },
  {
    // Achievement for maintaining a streak of correct answers
    name: 'Streak Starter',
    description: 'Answer 3 questions correctly in a row',
    icon: '🔥',
    requirement: {
      type: 'streak_days',
      value: 3  // Requires a 3-day streak
    },
    reward: {
      coins: 75,   // Reward of 75 coins
      badge: true  // Also grants a badge
    },
    hidden: false  // Visible to users
  },
  {
    // Achievement for demonstrating quiz mastery
    name: 'Quiz Master',
    description: 'Answer 50 questions correctly',
    icon: '🧠',
    requirement: {
      type: 'correct_answers',
      value: 50  // Requires 50 correct answers
    },
    reward: {
      coins: 200,  // Reward of 200 coins
      badge: true  // Also grants a badge
    },
    hidden: false  // Visible to users
  },
  {
    // Achievement for collecting coins
    name: 'Coin Collector',
    description: 'Earn 1000 coins',
    icon: '💰',
    requirement: {
      type: 'coins_earned',
      value: 1000  // Requires earning 1000 coins
    },
    reward: {
      coins: 150,  // Reward of 150 coins
      badge: true  // Also grants a badge
    },
    hidden: false  // Visible to users
  }
];

// ===================================================================
// Achievement Management Functions
// ===================================================================
// Functions to retrieve achievements and determine which ones a user has unlocked

// Convert achievement templates to full achievement objects with IDs and timestamps
export const getAllAchievements = (): Achievement[] => {
  return achievements.map((achievement, index) => ({
    ...achievement,
    id: `achievement_${index}`,  // Generate unique ID for each achievement
    createdAt: Date.now(),       // Set creation timestamp
    updatedAt: Date.now(),       // Set update timestamp
  }));
};

// Determine which achievements a user has unlocked based on their activity
export const getUnlockedAchievements = (user: User): Achievement[] => {
  // Get all available achievements
  const allAchievements = getAllAchievements();
  
  // Filter to only include achievements the user has unlocked
  return allAchievements.filter(achievement => {
    // Check achievement requirements based on type
    switch (achievement.requirement.type) {
      case 'questions_answered':
        // User must have answered enough questions (assuming 5 questions per quiz)
        return user.totalQuizzes * 5 >= achievement.requirement.value;
      case 'correct_answers':
        // User must have enough correct answers
        return user.correctAnswers >= achievement.requirement.value;
      case 'coins_earned':
        // User must have earned enough coins
        return user.coins >= achievement.requirement.value;
      // TODO: Implement streak tracking
      case 'streak_days':
        // User must have maintained a streak of sufficient length
        return user.streak >= achievement.requirement.value;
      default:
        // Unknown requirement type - achievement not unlocked
        return false;
    }
  });
};
