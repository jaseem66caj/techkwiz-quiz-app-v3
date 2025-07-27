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
      
      // FORCE 0 COINS ECONOMY: Only allow earning coins through rewarded ads, cap at max needed for one quiz
      let newCoins = 0 // Always enforce 0 coins unless it's a reward
      
      // Only allow positive coin additions from rewards (reward popup gives 200 coins)
      if (action.payload > 0 && action.payload <= 200) {
        // This is likely a reward, allow it but cap at 200
        newCoins = Math.min(200, action.payload)
      } else if (action.payload < 0) {
        // This is a deduction (quiz entry fee), always allow to stay at 0
        newCoins = 0
      }
      // All other cases: keep at 0
      
      const updatedUser = { ...state.user, coins: newCoins }
      
      // Save to localStorage
      saveUserToStorage(updatedUser)
      updateUserCoins(updatedUser.id, newCoins)
      
      console.log(`COINS UPDATE: ${state.user.coins} -> ${newCoins} (payload: ${action.payload})`)
      
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
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        const user = getCurrentUser()
        if (user) {
          // FORCE 0 COINS: Ensure all users start with 0 coins for rewarded ads
          const userWith0Coins = {
            ...user,
            coins: 0 // Force 0 coins for all existing and new users
          }
          
          // Save the updated user back to localStorage
          const { saveUserToStorage } = await import('./../../utils/auth')
          saveUserToStorage(userWith0Coins)
          
          console.log('User loaded and reset to 0 coins:', userWith0Coins)
          dispatch({ type: 'LOGIN_SUCCESS', payload: userWith0Coins })
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
    <AdminProvider>
      <AppContext.Provider value={{ state, dispatch }}>
        {children}
      </AppContext.Provider>
    </AdminProvider>
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