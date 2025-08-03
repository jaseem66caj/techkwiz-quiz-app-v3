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
      
      // Calculate new coin amount
      const currentCoins = state.user.coins
      let newCoins = currentCoins + action.payload
      
      // Never go below 0 coins
      newCoins = Math.max(0, newCoins)
      
      // Cap coins at reasonable maximum (500 coins max)
      newCoins = Math.min(500, newCoins)
      
      const updatedUser = { ...state.user, coins: newCoins }
      
      // Save to session storage (not localStorage)
      saveUserToStorage(updatedUser)
      updateUserCoins(updatedUser.id, newCoins)
      
      console.log(`💰 COINS UPDATE: ${currentCoins} + ${action.payload} = ${newCoins}`)
      
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
      
      // Award coins based on quiz performance (25 coins per correct answer)
      const coinsEarned = quizResult.coinsEarned || 0
      updatedUserWithQuiz.coins = state.user.coins + coinsEarned
      
      console.log(`🎉 Quiz completed! Earned ${coinsEarned} coins (${quizResult.correctAnswers} correct × 25)`)
      
      // Calculate new level (every 5 quizzes)
      const newLevel = Math.floor(updatedUserWithQuiz.totalQuizzes / 5) + 1
      updatedUserWithQuiz.level = newLevel
      
      // Save quiz result and user data (including coins)
      addQuizResult(state.user.id, quizResult)
      saveUserToStorage(updatedUserWithQuiz)
      updateUserCoins(updatedUserWithQuiz.id, updatedUserWithQuiz.coins)
      
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
    const initializeAuth = async () => {
      console.log('🚀 Initializing auth with session-based coins...')
      
      try {
        // Check if user is authenticated
        const currentUser = getCurrentUser()
        
        if (currentUser) {
          // User exists, load with session-based coins (will be 0 if new session)
          console.log(`👤 Found user: ${currentUser.name} with ${currentUser.coins} session coins`)
          dispatch({ type: 'LOGIN_SUCCESS', payload: currentUser })
        } else {
          console.log('👤 No authenticated user found - creating guest user')
          
          // Create a guest user automatically
          const guestUser = {
            id: `guest_${Date.now()}`,
            name: 'Guest User',
            email: `guest_${Date.now()}@techkwiz.com`,
            coins: 0,
            level: 1,
            totalQuizzes: 0,
            correctAnswers: 0,
            joinDate: new Date().toISOString(),
            quizHistory: [],
            achievements: []
          }
          
          // Set auth token
          localStorage.setItem('techkwiz_auth', 'dummy_token_' + guestUser.id)
          
          // Save user
          const allUsers = JSON.parse(localStorage.getItem('techkwiz_user') || '[]')
          allUsers.push(guestUser)
          localStorage.setItem('techkwiz_user', JSON.stringify(allUsers))
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: guestUser })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
      
      // Always ensure loading is false after auth check
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