// Simple browser-only user management utilities

export interface User {
  id: string
  name: string
  avatar: string
  coins: number
  level: number
  totalQuizzes: number
  correctAnswers: number
  joinDate: string
  quizHistory: any[]
  streak: number
}

const STORAGE_KEY = 'techkwiz_user';

// Get current user from localStorage
export const getCurrentUser = (): User => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error parsing stored user:', error);
  }

  // If no user, create a guest user
  const guestUser: User = {
    id: 'guest',
    name: 'Guest',
    avatar: '🤖',
    coins: 0,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0
  };
  saveUser(guestUser);
  return guestUser;
};

// Save user data to localStorage
export const saveUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

// Update user coins
export const updateUserCoins = (coins: number): void => {
  const user = getCurrentUser();
  user.coins = coins;
  saveUser(user);
};

// Add quiz result to user history
export const addQuizResult = (quizResult: any): void => {
  const user = getCurrentUser();
  user.quizHistory.push(quizResult);
  user.totalQuizzes += 1;
  user.correctAnswers += quizResult.correctAnswers || 0;
  user.level = Math.floor(user.totalQuizzes / 5) + 1;
  saveUser(user);
};

// Get all users (in this case, just the one)
export const getAllUsers = (): User[] => {
  return [getCurrentUser()];
};
