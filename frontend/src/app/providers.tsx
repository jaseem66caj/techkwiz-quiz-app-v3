'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { 
  getCurrentUser, 
  saveUserToStorage, 
  updateUserCoins, 
  addQuizResult,
  isAuthenticated,
  type User 
} from '../utils/auth'
import { AdminProvider } from '../context/AdminContext'

// Types
interface AppState {
  user: User | null
  isAuthenticated: boolean
  currentQuiz: any
  quizHistory: any[]
  loading: boolean
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
      
      const newCoins = Math.max(0, state.user.coins + action.payload)
      const updatedUser = { ...state.user, coins: newCoins }
      
      // Save to localStorage
      saveUserToStorage(updatedUser)
      updateUserCoins(updatedUser.id, newCoins)
      
      return {
        ...state,
        user: updatedUser,
      }
    
    case 'START_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload,
      }
    
    case 'END_QUIZ':
      if (!state.user) return state
      
      const quizResult = action.payload
      const updatedUserWithQuiz = {
        ...state.user,
        totalQuizzes: state.user.totalQuizzes + 1,
        correctAnswers: state.user.correctAnswers + quizResult.correctAnswers,
      }
      
      // Calculate new level (every 5 quizzes)
      const newLevel = Math.floor(updatedUserWithQuiz.totalQuizzes / 5) + 1
      updatedUserWithQuiz.level = newLevel
      
      // Save quiz result and user data
      addQuizResult(state.user.id, quizResult)
      saveUserToStorage(updatedUserWithQuiz)
      
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
    
    default:
      return state
  }
}

// Provider component
export function Providers({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      if (isAuthenticated()) {
        const user = getCurrentUser()
        if (user) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
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