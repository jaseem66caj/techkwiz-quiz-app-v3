'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

// Types
interface User {
  id: string
  name: string
  coins: number
  level: number
  totalQuizzes: number
  correctAnswers: number
}

interface AppState {
  user: User
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
  user: {
    id: 'user_1',
    name: 'Tech Enthusiast',
    coins: 0,
    level: 1,
    totalQuizzes: 0,
    correctAnswers: 0,
  },
  currentQuiz: null,
  quizHistory: [],
  loading: false,
}

// Context
const AppContext = createContext<AppContextType | undefined>(undefined)

// Reducer
function appReducer(state: AppState, action: any) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'UPDATE_COINS':
      return {
        ...state,
        user: {
          ...state.user,
          coins: state.user.coins + action.payload,
        },
      }
    
    case 'START_QUIZ':
      return {
        ...state,
        currentQuiz: action.payload,
      }
    
    case 'END_QUIZ':
      return {
        ...state,
        currentQuiz: null,
        quizHistory: [...state.quizHistory, action.payload],
        user: {
          ...state.user,
          totalQuizzes: state.user.totalQuizzes + 1,
          correctAnswers: state.user.correctAnswers + action.payload.correctAnswers,
        },
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