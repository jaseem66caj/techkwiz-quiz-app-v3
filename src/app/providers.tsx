// ===================================================================
// TechKwiz App State Management
// ===================================================================
// This file contains the global state management for the TechKwiz application
// using React Context API and useReducer for state updates.
// It manages user authentication, quiz progress, coins, and achievements.

'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { Achievement } from '@/types/reward';
import { getUnlockedAchievements } from '@/utils/achievements';
import {
    addQuizResult,
    getCurrentUser,
    saveUser,
    updateUserCoins,
    type User
} from '@/utils/auth';
import { getRewardConfig } from '@/utils/rewardCalculator';

// Types
// AppState represents the complete application state
interface AppState {
  user: User | null           // Current user data or null if not authenticated
  isAuthenticated: boolean    // Authentication status
  currentQuiz: any            // Currently active quiz data
  quizHistory: any[]          // History of completed quizzes
  loading: boolean            // Loading state during initialization
  notification: Achievement | null  // Active achievement notification
}

// AppContextType defines the structure of our context
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<any>
  ensureUser: () => void
}

// Initial state with default values
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentQuiz: null,
  quizHistory: [],
  loading: true,
  notification: null,
}

// Create the context to share state across components
const AppContext = createContext<AppContextType | undefined>(undefined)

function createGuestUser(): User {
  const guestUser: User = {
    id: `guest_${Date.now()}`,
    name: 'Guest',
    avatar: 'robot',
    coins: 0,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
    joinDate: new Date().toISOString(),
    quizHistory: [],
    streak: 0,
  }

  saveUser(guestUser)
  return guestUser
}

// Reducer function to handle state updates based on actions
// This function processes all state changes in a predictable way
function appReducer(state: AppState, action: any) {
  switch (action.type) {
    // Set loading state (used during app initialization)
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    // Handle successful user login/authentication
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }

    // Handle user logout
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentQuiz: null,
        quizHistory: [],
      }

    // Update user's coin balance
    case 'UPDATE_COINS':
      // Guard clause: only update coins if user exists
      if (!state.user) return state

      const currentCoins = state.user.coins
      let newCoins = currentCoins + action.payload

      // Ensure coins stay within valid range (minimum 0, no maximum cap)
      newCoins = Math.max(0, newCoins)

      // Create updated user object with new coin balance
      const updatedUser = { ...state.user, coins: newCoins }

      // Persist changes to localStorage
      saveUser(updatedUser)
      updateUserCoins(newCoins)

      console.info(`💰 COINS UPDATE: ${currentCoins} + ${action.payload} = ${newCoins}`)

      return {
        ...state,
        user: updatedUser,
      }

    // Start a quiz and deduct entry fee from user's coins
    case 'START_QUIZ':
      // Guard clause: only proceed if user exists
      if (!state.user) {
        console.warn('💰 START_QUIZ: No user found, cannot deduct entry fee');
        return state;
      }

      const { quiz, entryFee } = action.payload;

      // Guard clause: prevent duplicate quiz starts for the same category
      if (state.currentQuiz?.category === quiz.category) {
        console.warn(`💰 START_QUIZ: Quiz already started for category ${quiz.category}, preventing duplicate deduction`);
        return state;
      }

      // Check if user has enough coins to enter the quiz
      if (state.user.coins < entryFee) {
        console.warn(`💰 START_QUIZ: Insufficient coins (${state.user.coins} < ${entryFee})`);
        return state;
      }

      // Log the deduction for debugging
      console.info(`💰 START_QUIZ: Deducting ${entryFee} coins from ${state.user.coins} (user: ${state.user.id})`);

      // Deduct entry fee from user's coins
      const userAfterFee = { ...state.user, coins: state.user.coins - entryFee };

      // Persist changes to localStorage
      saveUser(userAfterFee);
      updateUserCoins(userAfterFee.coins);

      console.info(`💰 START_QUIZ: Deduction complete, new balance: ${userAfterFee.coins}`);

      return {
        ...state,
        user: userAfterFee,
        currentQuiz: quiz,
      };

    // Handle quiz completion and update user stats
    case 'END_QUIZ':
      // Guard clause: only proceed if user exists
      if (!state.user) return state

      const quizResult = action.payload

      // Update user statistics (coins are already awarded per correct answer via UPDATE_COINS)
      const updatedUserWithQuiz = {
        ...state.user,
        totalQuizzes: state.user.totalQuizzes + 1,
        correctAnswers: state.user.correctAnswers + quizResult.correctAnswers,
        // Update streak: increment if all answers correct, reset otherwise
        streak: quizResult.correctAnswers === quizResult.totalQuestions ? state.user.streak + 1 : 0
      }

      // Log quiz completion (coins already awarded individually per correct answer)
      const { coinValues } = getRewardConfig();
const expectedCoins = quizResult.correctAnswers * coinValues.correct; // For logging only
      console.info(`🎉 Quiz completed! ${quizResult.correctAnswers} correct answers (${expectedCoins} coins already awarded). Current balance: ${state.user.coins}`)

      // Calculate and update user level (1 level per 5 quizzes)
      const newLevel = Math.floor(updatedUserWithQuiz.totalQuizzes / 5) + 1
      updatedUserWithQuiz.level = newLevel

      // Check for newly unlocked achievements
      const unlockedAchievements = getUnlockedAchievements(state.user)
      const newlyUnlocked = getUnlockedAchievements(updatedUserWithQuiz).filter(
        unlocked => !unlockedAchievements.some(a => a.id === unlocked.id)
      );

      // If new achievements were unlocked, they'll be handled by the component
      if (newlyUnlocked.length > 0) {
        // The component will dispatch the NEW_ACHIEVEMENT action
      }

      // Save quiz result to user history
      addQuizResult(quizResult)

      // Persist updated user data
      saveUser(updatedUserWithQuiz)
      updateUserCoins(updatedUserWithQuiz.coins)

      return {
        ...state,
        user: updatedUserWithQuiz,
        currentQuiz: null,
        quizHistory: [...state.quizHistory, quizResult],
      }

    // Reset user to initial state
    case 'RESET_USER':
      return {
        ...state,
        user: initialState.user,
      }

    // Set a new achievement notification
    case 'NEW_ACHIEVEMENT':
      return { ...state, notification: action.payload };

    // Hide current notification
    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };

    // Default case returns current state unchanged
    default:
      return state
  }
}

// Provider component that wraps the entire application
// Makes the app state available to all child components
export function Providers({ children }: { children: ReactNode }) {
  // Initialize state reducer with initial state
  const [state, dispatch] = useReducer(appReducer, initialState)

  const ensureUser = useCallback(() => {
    if (state.user) return

    const guest = createGuestUser()
    dispatch({ type: 'LOGIN_SUCCESS', payload: guest })
  }, [state.user, dispatch])

  // Effect to initialize authentication on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.info('🚀 Initializing auth with session-based coins...')

      try {
        // Attempt to get current user from localStorage
        const currentUser = getCurrentUser()

        if (currentUser) {
          console.info(`👤 Found user: ${currentUser.name} with ${currentUser.coins} session coins`)
          // Dispatch login success action with user data
          dispatch({ type: 'LOGIN_SUCCESS', payload: currentUser })
        } else {
          console.info('👤 No authenticated user found - creating guest user for session continuity')
          const guest = createGuestUser()
          dispatch({ type: 'LOGIN_SUCCESS', payload: guest })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Set loading to false in case of error
        dispatch({ type: 'SET_LOADING', payload: false })
        const guest = createGuestUser()
        dispatch({ type: 'LOGIN_SUCCESS', payload: guest })
      }

      // Always set loading to false after initialization attempt
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    initializeAuth()
  }, [])

  // Provide state and dispatch to all child components
  return (
    <AppContext.Provider value={{ state, dispatch, ensureUser }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook to access the app context
// Provides a safe way to consume the context in components
export function useApp() {
  const context = useContext(AppContext)

  // Ensure hook is used within Providers component
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers')
  }

  return context
}
