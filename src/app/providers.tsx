'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { 
  getCurrentUser, 
  saveUser, 
  updateUserCoins, 
  addQuizResult,
  type User 
} from '../utils/auth'
import { getUnlockedAchievements } from '../utils/achievements';
import { Achievement } from '../types/reward';

// Types
interface AppState {
  user: User | null
  isAuthenticated: boolean
  currentQuiz: any
  quizHistory: any[]
  loading: boolean
  notification: Achievement | null
}

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<any>
}

// Initial state
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  currentQuiz: null,
  quizHistory: [],
  loading: true,
  notification: null,
}

// Context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Reducer
function appReducer(state: AppState, action: any) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        currentQuiz: null,
        quizHistory: [],
      }
    
    case 'UPDATE_COINS':
      if (!state.user) return state
      
      const currentCoins = state.user.coins
      let newCoins = currentCoins + action.payload
      
      newCoins = Math.max(0, newCoins)
      newCoins = Math.min(500, newCoins)
      
      const updatedUser = { ...state.user, coins: newCoins }
      
      saveUser(updatedUser)
      updateUserCoins(newCoins)
      
      console.log(`💰 COINS UPDATE: ${currentCoins} + ${action.payload} = ${newCoins}`)
      
      return {
        ...state,
        user: updatedUser,
      }
    
    case 'START_QUIZ':
      if (!state.user) return state;
      const { quiz, entryFee } = action.payload;
      if (state.user.coins < entryFee) {
        // Or handle this in the UI
        return state;
      }
      const userAfterFee = { ...state.user, coins: state.user.coins - entryFee };
      saveUser(userAfterFee);
      updateUserCoins(userAfterFee.coins);
      return {
        ...state,
        user: userAfterFee,
        currentQuiz: quiz,
      };
    
    case 'END_QUIZ':
      if (!state.user) return state
      
      const quizResult = action.payload
      const updatedUserWithQuiz = {
        ...state.user,
        totalQuizzes: state.user.totalQuizzes + 1,
        correctAnswers: state.user.correctAnswers + quizResult.correctAnswers,
        streak: quizResult.correctAnswers === quizResult.totalQuestions ? state.user.streak + 1 : 0
      }
      
      const coinsEarned = quizResult.correctAnswers * 50;
      updatedUserWithQuiz.coins = state.user.coins + coinsEarned
      
      console.log(`🎉 Quiz completed! Earned ${coinsEarned} coins (${quizResult.correctAnswers} correct × 50)`)
      
      const newLevel = Math.floor(updatedUserWithQuiz.totalQuizzes / 5) + 1
      updatedUserWithQuiz.level = newLevel
      
      const unlockedAchievements = getUnlockedAchievements(state.user)
      const newlyUnlocked = getUnlockedAchievements(updatedUserWithQuiz).filter(
        unlocked => !unlockedAchievements.some(a => a.id === unlocked.id)
      );

      if (newlyUnlocked.length > 0) {
        // The component will dispatch the NEW_ACHIEVEMENT action
      }

      addQuizResult(quizResult)
      saveUser(updatedUserWithQuiz)
      updateUserCoins(updatedUserWithQuiz.coins)
      
      return {
        ...state,
        user: updatedUserWithQuiz,
        currentQuiz: null,
        quizHistory: [...state.quizHistory, quizResult],
      }
    
    case 'RESET_USER':
      return {
        ...state,
        user: initialState.user,
      }

    case 'NEW_ACHIEVEMENT':
      return { ...state, notification: action.payload };

    case 'HIDE_NOTIFICATION':
      return { ...state, notification: null };
    
    default:
      return state
  }
}

// Provider component
export function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth with session-based coins...')
      
      try {
        const currentUser = getCurrentUser()
        
        if (currentUser) {
          console.log(`👤 Found user: ${currentUser.name} with ${currentUser.coins} session coins`)
          dispatch({ type: 'LOGIN_SUCCESS', payload: currentUser })
        } else {
          console.log('👤 No authenticated user found - will let page components handle guest creation and onboarding')
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
      
      dispatch({ type: 'SET_LOADING', payload: false })
    }

    initializeAuth()
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use app context
export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers')
  }
  return context
}
