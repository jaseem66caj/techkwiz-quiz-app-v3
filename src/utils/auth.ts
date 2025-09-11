// ===================================================================
// TechKwiz User Authentication and Management Utilities
// ===================================================================
// This file contains utility functions for managing user authentication
// and data persistence using browser localStorage. It handles user creation,
// login/logout, and data storage for the client-side only application.

import { getAvatarEmojiById, getDefaultAvatar } from './avatar';

// User interface defining the structure of user data
export interface User {
  id: string              // Unique user identifier
  name: string            // User's display name
  avatar: string          // User's avatar identifier
  coins: number           // User's current coin balance
  level: number           // User's current level (based on quizzes completed)
  totalQuizzes: number    // Total number of quizzes completed
  correctAnswers: number  // Total number of correct answers across all quizzes
  joinDate: string        // Date when user account was created
  quizHistory: any[]      // History of completed quizzes
  streak: number          // Current consecutive days of quiz completion
}

// localStorage key for storing user data
const STORAGE_KEY = 'techkwiz_user';

// Get current user from localStorage
// If no user exists, creates and returns a guest user
export const getCurrentUser = (): User => {
  try {
    // Attempt to retrieve user data from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Parse and normalize stored user data (handle older schemas safely)
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed.quizHistory)) parsed.quizHistory = [];
      if (typeof parsed.coins !== 'number') parsed.coins = 0;
      if (typeof parsed.level !== 'number') parsed.level = 1;
      if (typeof parsed.totalQuizzes !== 'number') parsed.totalQuizzes = 0;
      if (typeof parsed.correctAnswers !== 'number') parsed.correctAnswers = 0;
      if (!parsed.joinDate) parsed.joinDate = new Date().toISOString();
      if (typeof parsed.streak !== 'number') parsed.streak = 0;
      
      // Handle avatar migration from emoji to ID
      if (parsed.avatar && parsed.avatar.length > 10) {
        // This is likely an emoji, convert to default avatar ID
        parsed.avatar = 'robot';
      } else if (!parsed.avatar) {
        // No avatar set, use default
        parsed.avatar = 'robot';
      }
      
      return parsed as User;
    }
  } catch (error) {
    // Log error if parsing fails
    console.error('Error parsing stored user:', error);
  }

  // If no user found or parsing failed, create a guest user
  const guestUser: User = {
    id: 'guest',
    name: 'Guest',
    avatar: 'robot',
    coins: 0,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0
  };
  
  // Save the new guest user to localStorage
  saveUser(guestUser);
  return guestUser;
};

// Save user data to localStorage
// Serializes user object and stores it in browser's localStorage
export const saveUser = (user: User): void => {
  try {
    // Convert user object to JSON string and save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    // Log error if saving fails
    console.error('Error saving user:', error);
  }
};

// Update user's coin balance
// Retrieves current user, updates coins, and saves back to localStorage
export const updateUserCoins = (coins: number): void => {
  // Get current user data
  const user = getCurrentUser();
  
  // Update coin balance
  user.coins = coins;
  
  // Save updated user data
  saveUser(user);
};

// Add quiz result to user's history
// Updates user statistics and level based on quiz performance
export const addQuizResult = (quizResult: any): void => {
  // Get current user data
  const user = getCurrentUser();
  
  // Add quiz result to history (guard against undefined from legacy data)
  if (!Array.isArray(user.quizHistory)) user.quizHistory = [];
  user.quizHistory.push(quizResult);
  
  // Update user statistics
  user.totalQuizzes += 1;
  user.correctAnswers += quizResult.correctAnswers || 0;
  
  // Recalculate and update user level (1 level per 5 quizzes)
  user.level = Math.floor(user.totalQuizzes / 5) + 1;
  
  // Save updated user data
  saveUser(user);
};

// Get all users (in this case, just the one)
// Returns array containing current user for compatibility
export const getAllUsers = (): User[] => {
  return [getCurrentUser()];
};

// Login function (for compatibility with authentication systems)
// In a real app, this would authenticate with a server
export const login = async (email: string, password: string): Promise<User> => {
  // For now, just return the current user or create a new one
  const user = getCurrentUser();
  return user;
};

// Signup function (for compatibility with authentication systems)
// In a real app, this would create a new user on the server
export const signup = async (name: string, email: string, password: string): Promise<User> => {
  // Create a new user with provided name
  const newUser: User = {
    id: `user_${Date.now()}`,           // Unique ID based on timestamp
    name,                               // User's chosen name
    avatar: 'robot',                    // Default avatar
    coins: 100,                         // Welcome bonus coins
    level: 1,                           // Starting level
    totalQuizzes: 0,                    // No quizzes completed yet
    correctAnswers: 0,                  // No correct answers yet
    joinDate: new Date().toISOString(), // Current timestamp as join date
    quizHistory: [],                    // Empty quiz history
    streak: 0                           // No streak yet
  };
  
  // Save new user to localStorage
  saveUser(newUser);
  return newUser;
};

// Logout function (for compatibility with authentication systems)
// Removes user data from localStorage
export const logout = (): void => {
  try {
    // Remove user data from localStorage
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Log error if removal fails
    console.error('Error during logout:', error);
  }
};