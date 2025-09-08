// ===================================================================
// TechKwiz Home Page Component
// ===================================================================
// This is the main entry point for the TechKwiz application. It renders the
// homepage with an interactive quiz experience, user profile creation, and
// exit prevention functionality. The component manages the complete quiz flow
// including question display, answer selection, scoring, and result handling.

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from './providers'
import { EnhancedQuizInterface } from '../components/EnhancedQuizInterface'
import { ExitConfirmationModal } from '../components/ExitConfirmationModal'
import { useExitPrevention } from '../hooks/useExitPrevention'
import { quizDataManager } from '../utils/quizDataManager'
import { realTimeSyncService } from '../utils/realTimeSync'
import { CreateProfile } from '../components/CreateProfile';
import { saveUser } from '../utils/auth';
import { getUnlockedAchievements } from '../utils/achievements';

// Main Home Page component that serves as the primary user interface
export default function HomePage() {
  // Access global application state and dispatch function
  const { state, dispatch } = useApp()
  // Next.js router for navigation
  const router = useRouter()
  
  // State management for UI components and quiz flow
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [resultCountdown, setResultCountdown] = useState(90);
  const [isNavigating, setIsNavigating] = useState(false);

  // ===================================================================
  // Auto-redirect Timer Effect
  // ===================================================================
  // Effect to handle automatic redirection after quiz completion

  // Effect to manage auto-redirect timer after quiz completion
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    // Set up auto-redirect and countdown when quiz is completed and results are shown
    if (showResult && quizCompleted) {
      // Auto-redirect to profile creation after 90 seconds
      timer = setTimeout(() => {
        setShowResult(false);
        setShowCreateProfile(true);
      }, 90000); // 90 seconds

      // Countdown timer for UI display
      interval = setInterval(() => {
        setResultCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup timers on component unmount or state change
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [showResult, quizCompleted]);

  // ===================================================================
  // Exit Prevention Hook
  // ===================================================================
  // Hook to prevent accidental exit during quiz

  // Setup exit prevention to warn users about losing progress
  const { disablePrevention } = useExitPrevention({
    isActive: !quizCompleted && !showResult,
    onExitAttempt: () => {
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? Your progress will be lost!"
  })

  // ===================================================================
  // Quiz Question Loading Effect
  // ===================================================================
  // Effect to load quiz questions on component mount

  // Effect to load quiz questions when component mounts
  useEffect(() => {
    // Function to load quiz questions from various sources
    const loadQuizQuestions = () => {
      // Guard clause for server-side rendering
      if (typeof window === 'undefined') {
        return
      }

      try {
        setIsLoadingQuestions(true)
        // Try to get game sync data from localStorage
        const gameSyncData = localStorage.getItem('game_quiz_data')
        let questions = []

        // Load questions from localStorage or fallback to data manager
        if (gameSyncData) {
          questions = JSON.parse(gameSyncData)
        } else {
          try {
            questions = quizDataManager.getQuestions() || []
          } catch (error) {
            console.error('Error loading admin questions:', error)
            questions = []
          }
        }

        // Filter questions for homepage display
        const homepageQuestions = questions.filter(q => q.section === 'homepage')
        const beginnerQuestions = questions.filter(q => q.difficulty === 'beginner')
        let questionsToUse = homepageQuestions.length >= 5 ? homepageQuestions : beginnerQuestions

        // Set quiz questions or fallback to default questions
        if (questionsToUse.length >= 5) {
          const convertedQuestions = questionsToUse.slice(0, 5).map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correct_answer: q.correct_answer ?? 0,
            difficulty: q.difficulty,
            fun_fact: q.fun_fact || "Thanks for playing!",
            category: q.category,
            subcategory: q.subcategory || q.category
          }))
          setQuizQuestions(convertedQuestions)
        } else {
          setQuizQuestions(getFallbackQuestions())
        }
      } catch (error) {
        console.error('❌ Error loading quiz questions:', error)
        setQuizQuestions(getFallbackQuestions())
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    // Load questions when component mounts
    loadQuizQuestions()

    // Handler for real-time quiz updates
    const handleQuizSync = () => {
      loadQuizQuestions()
    }

    // Setup real-time sync listener
    try {
      realTimeSyncService.addEventListener('quiz_updated', handleQuizSync)
    } catch (error) {
      console.error('Error setting up quiz sync listener:', error)
    }

    // Cleanup listener on component unmount
    return () => {
      try {
        realTimeSyncService.removeEventListener('quiz_updated', handleQuizSync)
      } catch (error) {
        console.error('Error removing quiz sync listener:', error)
      }
    }
  }, [])

  // ===================================================================
  // Fallback Questions
  // ===================================================================
  // Default questions to use when no other questions are available

  // Provide fallback questions when no questions are available
  const getFallbackQuestions = () => [
    {
      id: 'fallback-1',
      question: "Which social media platform is known for short-form videos?",
      options: ["Instagram", "TikTok", "Twitter", "Snapchat"],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: "TikTok was originally called Musical.ly!",
      category: "social-media",
      subcategory: "social-media"
    },
    {
      id: 'fallback-2',
      question: "What does 'AI' stand for?",
      options: ["Artificial Intelligence", "Automated Internet", "Advanced Interface", "Algorithmic Integration"],
      correct_answer: 0,
      difficulty: 'beginner',
      fun_fact: "The term 'Artificial Intelligence' was first coined in 1956!",
      category: "technology",
      subcategory: "technology"
    },
    {
      id: 'fallback-3',
      question: "Which company created the iPhone?",
      options: ["Google", "Samsung", "Apple", "Microsoft"],
      correct_answer: 2,
      difficulty: 'beginner',
      fun_fact: "The first iPhone was released in 2007!",
      category: "technology",
      subcategory: "technology"
    },
    {
      id: 'fallback-4',
      question: "What does 'URL' stand for?",
      options: ["Universal Resource Locator", "Uniform Resource Locator", "Unified Resource Locator", "Unique Resource Locator"],
      correct_answer: 1,
      difficulty: 'beginner',
      fun_fact: "The first website was created in 1991 by Tim Berners-Lee!",
      category: "technology",
      subcategory: "technology"
    },
    {
      id: 'fallback-5',
      question: "Which of these is NOT a programming language?",
      options: ["Python", "Java", "Cobra", "Snake"],
      correct_answer: 3,
      difficulty: 'beginner',
      fun_fact: "Python was named after the comedy group Monty Python!",
      category: "technology",
      subcategory: "technology"
    }
  ];

  // Quick start quiz with available questions or fallback
  const quickStartQuiz = quizQuestions.length > 0 ? quizQuestions : getFallbackQuestions();

  // ===================================================================
  // Quiz Answer Handling
  // ===================================================================
  // Functions to handle user interactions during the quiz

  // Handle user selecting an answer
  const handleAnswerSelect = (answerIndex: number) => {
    // Prevent multiple selections
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    // Delay to show answer feedback
    setTimeout(() => {
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer;
      const coinsEarned = isCorrect ? 25 : 0; // 25 coins per correct answer

      // Update score and coins for correct answers
      if (isCorrect) {
        setScore(score + 1);
        // Award coins for correct answers on homepage quiz
        dispatch({ type: 'UPDATE_COINS', payload: coinsEarned });
        console.log(`✅ Correct answer! Earned ${coinsEarned} coins`);
      } else {
        console.log(`❌ Wrong answer, no coins earned`);
      }

      // Show answer feedback for 1 second, then proceed
      setTimeout(() => {
        if (currentQuestion < quickStartQuiz.length - 1) {
          // Move to next question
          setCurrentQuestion(currentQuestion + 1);
          setSelectedAnswer(null);
        } else {
          // Complete the quiz
          setQuizCompleted(true);
          setShowResult(true);

          // Calculate final stats for achievements and user updates
          const finalScore = score + (isCorrect ? 1 : 0);
          const totalCoinsEarned = finalScore * 25; // Total coins from all correct answers

          // Create updated user with null safety
          const currentUser = state.user || {
            id: `guest_${Date.now()}`,
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

          const updatedUser = {
            ...currentUser,
            totalQuizzes: currentUser.totalQuizzes + 1,
            correctAnswers: currentUser.correctAnswers + finalScore,
            streak: isCorrect ? currentUser.streak + 1 : 0,
            coins: currentUser.coins + totalCoinsEarned
          };

          const unlockedAchievements = getUnlockedAchievements(currentUser);
          const newlyUnlocked = getUnlockedAchievements(updatedUser).filter(
            unlocked => !unlockedAchievements.some(a => a.id === unlocked.id)
          );

          if (newlyUnlocked.length > 0) {
            dispatch({ type: 'NEW_ACHIEVEMENT', payload: newlyUnlocked[0] });
          }

          dispatch({ type: 'END_QUIZ', payload: { correctAnswers: finalScore, totalQuestions: quickStartQuiz.length } });
        }
      }, 1500); // Show answer feedback for 1.5 seconds
    }, 1000); // Wait 1 second after selection to show answer
  };

  // ===================================================================
  // Profile Creation Handling
  // ===================================================================
  // Functions to handle user profile creation after quiz completion

  // Handle user creating a profile after quiz completion
  const handleProfileCreated = (username: string, avatar: string) => {
    const coinsEarned = score * 50;

    // Create user object with fallback for null state.user, matching User interface
    const currentCoins = state.user?.coins || 0;
    const user = {
      id: state.user?.id || `user_${Date.now()}`,
      name: username,
      avatar: avatar,
      coins: currentCoins + coinsEarned,
      level: state.user?.level || 1,
      totalQuizzes: (state.user?.totalQuizzes || 0) + 1, // Increment quiz count
      correctAnswers: (state.user?.correctAnswers || 0) + score, // Add correct answers from this quiz
      joinDate: state.user?.joinDate || new Date().toISOString(),
      quizHistory: state.user?.quizHistory || [],
      streak: state.user?.streak || 0
    };

    saveUser(user);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });

    // Set navigation state to prevent quiz interface from showing
    setIsNavigating(true);
    setShowCreateProfile(false);

    // Navigate to start page
    router.push('/start');
  };

  // ===================================================================
  // UI Rendering
  // ===================================================================
  // Conditional rendering based on component state

  // Show loading screen while questions are loading
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading TechKwiz...</p>
          </div>
        </main>
      </div>
    )
  }
  
  // Show profile creation screen after quiz completion
  if (showCreateProfile) {
    return <CreateProfile onProfileCreated={handleProfileCreated} />;
  }

  // Show loading screen during navigation to prevent quiz interface flash
  if (isNavigating) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <main className="flex-1 flex items-center justify-center">
          <div className="glass-effect p-8 rounded-2xl text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mx-auto mb-4"></div>
            <p className="text-white">Redirecting to categories...</p>
          </div>
        </main>
      </div>
    )
  }

  // Show quiz result screen after quiz completion
  if (showResult && quizCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-8 rounded-2xl text-center max-w-md w-full"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Quiz Completed!
            </h2>
            <div className="space-y-3 mb-6">
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-400/30">
                <p className="text-green-300 text-sm font-medium">Score</p>
                <p className="text-white text-2xl font-bold">{score}/{quickStartQuiz.length}</p>
              </div>
              
              <div className="bg-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-400/30">
                <p className="text-orange-300 text-sm font-medium">Coins Earned</p>
                <p className="text-white text-2xl font-bold">{score * 50}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-blue-200 mb-4">
                You've earned {score * 50} coins! This is the only way to get free coins in TechKwiz.
              </p>
              
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 mb-6">
                <p className="text-blue-300 text-sm font-medium">Next Step</p>
                <p className="text-white">
                  Create your profile to save your progress and compete on the leaderboard!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowResult(false);
                    setShowCreateProfile(true);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  Create Profile Now
                </button>
              </div>

              <p className="text-gray-400 text-sm mt-4">
                Auto-redirecting to profile setup in {resultCountdown} seconds...
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  // Show quiz interface for active quiz
  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <main className="flex-1 p-4 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              🎉 Welcome to <span className="text-orange-400">TechKwiz!</span>
            </h1>
            <p className="text-blue-200 text-base mb-2">
              Test your knowledge with this quick quiz!
            </p>
            <p className="text-green-300 text-sm font-medium">
              👆 Click an answer below to start earning coins!
            </p>
          </motion.div>

          <div className="w-full max-w-md">
            <EnhancedQuizInterface
              question={quickStartQuiz[currentQuestion]}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              questionAnswered={selectedAnswer !== null}
              questionNumber={currentQuestion + 1}
              totalQuestions={quickStartQuiz.length}
              showProgress={true}
              encouragementMessages={true}
            />
          </div>
        </main>
      </div>
      
      <ExitConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={() => router.push('/start')}
        onCancel={() => setShowExitConfirmation(false)}
        currentProgress={{
          questionNumber: currentQuestion + 1,
          totalQuestions: quickStartQuiz.length,
          coinsAtRisk: score * 50
        }}
      />


    </>
  )
}