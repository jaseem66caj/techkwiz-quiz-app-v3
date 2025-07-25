// Simple browser-only authentication utilities

export interface User {
  id: string
  email: string
  name: string
  coins: number
  level: number
  totalQuizzes: number
  correctAnswers: number
  joinDate: string
  quizHistory: any[]
}

const STORAGE_KEYS = {
  USER: 'techkwiz_user',
  AUTH_TOKEN: 'techkwiz_auth',
  QUIZ_HISTORY: 'techkwiz_quiz_history'
}

// Generate a simple user ID
const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9)
}

// Extract name from email
const getNameFromEmail = (email: string) => {
  return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').trim() || 'Tech Enthusiast'
}

// Create a new user profile
export const createUserProfile = (email: string, password: string): User => {
  const user: User = {
    id: generateUserId(),
    email: email.toLowerCase(),
    name: getNameFromEmail(email),
    coins: 500, // Starting coins for new users
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: []
  }
  
  return user
}

// Dummy login - accepts any email/password combination
export const login = (email: string, password: string): User => {
  // Check if user exists in localStorage
  const existingUser = getUserFromStorage(email)
  
  if (existingUser) {
    // User exists, return their data
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'dummy_token_' + existingUser.id)
    return existingUser
  } else {
    // New user, create profile
    const newUser = createUserProfile(email, password)
    saveUserToStorage(newUser)
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'dummy_token_' + newUser.id)
    return newUser
  }
}

// Dummy signup - same as login, just creates new user
export const signup = (email: string, password: string, name?: string): User => {
  const user = createUserProfile(email, password)
  if (name) {
    user.name = name
  }
  
  saveUserToStorage(user)
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'dummy_token_' + user.id)
  return user
}

// Logout
export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
  if (!token) return null
  
  const userId = token.replace('dummy_token_', '')
  const allUsers = getAllUsersFromStorage()
  return allUsers.find(user => user.id === userId) || null
}

// Save user data to localStorage
export const saveUserToStorage = (user: User): void => {
  const allUsers = getAllUsersFromStorage()
  const existingIndex = allUsers.findIndex(u => u.id === user.id || u.email === user.email)
  
  if (existingIndex >= 0) {
    allUsers[existingIndex] = user
  } else {
    allUsers.push(user)
  }
  
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(allUsers))
}

// Get user by email from localStorage
export const getUserFromStorage = (email: string): User | null => {
  const allUsers = getAllUsersFromStorage()
  return allUsers.find(user => user.email === email.toLowerCase()) || null
}

// Get all users from localStorage
const getAllUsersFromStorage = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error parsing stored users:', error)
    return []
  }
}

// Update user coins
export const updateUserCoins = (userId: string, coins: number): void => {
  const allUsers = getAllUsersFromStorage()
  const userIndex = allUsers.findIndex(user => user.id === userId)
  
  if (userIndex >= 0) {
    allUsers[userIndex].coins = coins
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(allUsers))
  }
}

// Add quiz result to user history
export const addQuizResult = (userId: string, quizResult: any): void => {
  const allUsers = getAllUsersFromStorage()
  const userIndex = allUsers.findIndex(user => user.id === userId)
  
  if (userIndex >= 0) {
    allUsers[userIndex].quizHistory.push(quizResult)
    allUsers[userIndex].totalQuizzes += 1
    allUsers[userIndex].correctAnswers += quizResult.correctAnswers || 0
    
    // Level up logic (every 5 quizzes)
    const newLevel = Math.floor(allUsers[userIndex].totalQuizzes / 5) + 1
    allUsers[userIndex].level = newLevel
    
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(allUsers))
  }
}

// Clear all user data (for testing)
export const clearUserData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY)
}