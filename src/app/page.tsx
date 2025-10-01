// ===================================================================
// TechKwiz Home Page Component
// ===================================================================
// This is the main entry point for the TechKwiz application. It renders the
// homepage with an interactive quiz experience, user profile creation, and
// exit prevention functionality. The component manages the complete quiz flow
// including question display, answer selection, scoring, and result handling.

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApp } from './providers'
import { ExitConfirmationModal } from '@/components/modals'
import { CreateProfile } from '@/components/user/CreateProfile'
import { useExitPrevention } from '@/hooks/useExitPrevention'
import { saveUser } from '@/utils/auth'
import { calculateQuizReward } from '@/utils/rewardCalculator'
import { useHomepageQuizQuestions } from '@/hooks/useHomepageQuizQuestions'
import { useHomepageQuizProgression } from '@/hooks/useHomepageQuizProgression'

const UnifiedQuizInterface = dynamic(() => import('@/components/quiz/UnifiedQuizInterface').then(mod => mod.UnifiedQuizInterface), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
});

// Main Home Page component that serves as the primary user interface
export default function HomePage() {
  // Access global application state and dispatch function
  const { state, dispatch } = useApp()
  // Next.js router for navigation
  const router = useRouter()
  
  // State management for UI components and quiz flow
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  // 90-second redirect to categories (standardized)
  const [, setResultCountdown] = useState(90)
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const { quickStartQuiz, isLoading: isLoadingQuestions } = useHomepageQuizQuestions()
  const {
    currentQuestion,
    selectedAnswer,
    score,
    showResult,
    quizCompleted,
    setShowResult,
    handleAnswerSelect,
  } = useHomepageQuizProgression(quickStartQuiz)

  // ===================================================================
  // Auto-redirect Timer Effect (Homepage Results)
  // ===================================================================
  useEffect(() => {
    if (!(showResult && quizCompleted)) return;

    const interval = setInterval(() => {
      setResultCountdown(prev => {
        const next = Math.max(prev - 1, 0);
        // Update ARIA live region every 10 seconds to avoid spam
        if (next % 10 === 0) setSrAnnouncement(`Redirecting to profile creation in ${next} seconds`);
        return next;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      try {
        setIsNavigating(true);
        // Changed from router.push('/start') to setShowCreateProfile(true) as requested
        setShowResult(false);
        setShowCreateProfile(true);
      } catch (e) {
        import('@sentry/nextjs').then(Sentry => Sentry.captureException(e as any));
        // Fallback to profile creation
        setShowResult(false);
        setShowCreateProfile(true);
      }
    }, 90000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [showResult, quizCompleted, router]);

  // ===================================================================
  // Exit Prevention Hook
  // ===================================================================
  // Hook to prevent accidental exit during quiz

  // Setup exit prevention to warn users about losing progress
  useExitPrevention({
    isActive: !quizCompleted && !showResult,
    onExitAttempt: () => {
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? Your progress will be lost!"
  })

  // Profile Creation Handling
  // ===================================================================
  // Functions to handle user profile creation after quiz completion

  // Handle user creating a profile after quiz completion
  const handleProfileCreated = (username: string, avatar: string) => {
    // Create user object preserving existing coins and statistics (already updated via quiz flow)
    const user = {
      id: state.user?.id || `user_${Date.now()}`,
      name: username,
      avatar: avatar,
      coins: state.user?.coins || 0, // Preserve existing coins (already awarded during quiz)
      level: state.user?.level || 1,
      totalQuizzes: state.user?.totalQuizzes || 0, // Preserve existing stats (already updated via END_QUIZ)
      correctAnswers: state.user?.correctAnswers || 0, // Preserve existing stats (already updated via END_QUIZ)
      joinDate: state.user?.joinDate || new Date().toISOString(),
      quizHistory: state.user?.quizHistory || [],
      streak: state.user?.streak || 0
    };

    saveUser(user);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });

    // Set navigation state to prevent quiz interface from showing
    setIsNavigating(true);
    setShowCreateProfile(false);

    // Navigate to start page with error handling
    try {
      router.push('/start');
    } catch (error) {
      console.error('Error navigating to start page:', error);
      // Report to Sentry
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          tags: { component: 'HomePage', action: 'navigateToStart' }
        });
      });
      // Fallback: try window.location as backup
      window.location.href = '/start';
    }
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
            {/* Accessible timer live region (updates every 10s) */}
            <div aria-live="polite" role="timer" className="sr-only">{srAnnouncement}</div>

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
                <p className="text-white text-2xl font-bold">{calculateQuizReward(score, quickStartQuiz.length).totalCoins}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-blue-200 mb-4">
                You've earned {calculateQuizReward(score, quickStartQuiz.length).totalCoins} coins! This is the only way to get free coins in TechKwiz.
              </p>
              
              <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-400/30 mb-6">
                <p className="text-blue-300 text-sm font-medium">Next Step</p>
                <p className="text-white">
                  Create your profile to save your progress and compete on the leaderboard!
                </p>
              </div>

              {/* Standardized completion timer (90s) - runs in background */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowResult(false);
                    setShowCreateProfile(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Create Profile Now
                </button>
              </div>
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
            <UnifiedQuizInterface
              question={quickStartQuiz[currentQuestion]}
              selectedAnswer={selectedAnswer}
              onAnswerSelect={handleAnswerSelect}
              questionAnswered={selectedAnswer !== null}
              questionNumber={currentQuestion + 1}
              totalQuestions={quickStartQuiz.length}
              showProgress={true}
              encouragementMessages={true}
              mode="enhanced"
            />
          </div>
        </main>
      </div>
      
      <ExitConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={() => {
          try {
            router.push('/start');
          } catch (error) {
            console.error('Error navigating from exit confirmation:', error);
            // Report to Sentry
            import('@sentry/nextjs').then(Sentry => {
              Sentry.captureException(error, {
                tags: { component: 'HomePage', action: 'exitConfirmNavigation' }
              });
            });
            // Fallback navigation
            window.location.href = '/start';
          }
        }}
        onCancel={() => setShowExitConfirmation(false)}
        currentProgress={{
          questionNumber: currentQuestion + 1,
          totalQuestions: quickStartQuiz.length,
          coinsAtRisk: calculateQuizReward(score, quickStartQuiz.length).totalCoins
        }}
      />


    </>
  )
}
