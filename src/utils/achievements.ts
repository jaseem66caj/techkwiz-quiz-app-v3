import { User } from './auth';
import { Achievement } from '../types/reward';

export const achievements: Omit<Achievement, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'First Quiz',
    description: 'Complete your first quiz',
    icon: '🏆',
    requirement: {
      type: 'questions_answered',
      value: 5
    },
    reward: {
      coins: 50,
      badge: true
    },
    hidden: false
  },
  {
    name: 'Streak Starter',
    description: 'Answer 3 questions correctly in a row',
    icon: '🔥',
    requirement: {
      type: 'streak_days',
      value: 3
    },
    reward: {
      coins: 75,
      badge: true
    },
    hidden: false
  },
  {
    name: 'Quiz Master',
    description: 'Answer 50 questions correctly',
    icon: '🧠',
    requirement: {
      type: 'correct_answers',
      value: 50
    },
    reward: {
      coins: 200,
      badge: true
    },
    hidden: false
  },
  {
    name: 'Coin Collector',
    description: 'Earn 1000 coins',
    icon: '💰',
    requirement: {
      type: 'coins_earned',
      value: 1000
    },
    reward: {
      coins: 150,
      badge: true
    },
    hidden: false
  }
];

export const getAllAchievements = (): Achievement[] => {
  return achievements.map((achievement, index) => ({
    ...achievement,
    id: `achievement_${index}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }));
};

export const getUnlockedAchievements = (user: User): Achievement[] => {
  const allAchievements = getAllAchievements();
  return allAchievements.filter(achievement => {
    switch (achievement.requirement.type) {
      case 'questions_answered':
        return user.totalQuizzes * 5 >= achievement.requirement.value;
      case 'correct_answers':
        return user.correctAnswers >= achievement.requirement.value;
      case 'coins_earned':
        return user.coins >= achievement.requirement.value;
      // TODO: Implement streak tracking
      case 'streak_days':
        return user.streak >= achievement.requirement.value;
      default:
        return false;
    }
  });
};