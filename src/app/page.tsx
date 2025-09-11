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
import { UnifiedQuizInterface } from '../components/quiz'
import { ExitConfirmationModal } from '../components/modals'
import { useExitPrevention } from '../hooks/useExitPrevention'
import { quizDataManager } from '../utils/quizDataManager'
import { realTimeSyncService } from '../utils/realTimeSync'
import { CreateProfile } from '../components/user';
import { calculateCorrectAnswerReward, calculateQuizReward } from '../utils/rewardCalculator';
import { saveUser } from '../utils/auth';
import { getUnlockedAchievements } from '../utils/achievements';
import { getAvatarEmojiById } from '../utils/avatar';

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
  // 90-second redirect to categories (standardized)
  const [resultCountdown, setResultCountdown] = useState(90);
  const [srAnnouncement, setSrAnnouncement] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // ===================================================================
  // Auto-redirect Timer Effect (Homepage Results)
  // ===================================================================
  useEffect(() => {
    if (!(showResult && quizCompleted)) return;

    const interval = setInterval(() => {
      setResultCountdown(prev => {
        const next = Math.max(prev - 1, 0);
        // Update ARIA live region every 10 seconds to avoid spam
        if (next % 10 === 0) setSrAnnouncement(`Redirecting to categories in ${next} seconds`);
        return next;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      try {
        setIsNavigating(true);
        router.push('/start'); // preserve history
      } catch (e) {
        import('@sentry/nextjs').then(Sentry => Sentry.captureException(e as any));
        if (typeof window !== 'undefined') window.location.href = '/start';
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

  // Handle user selecting an answer (Homepage Quiz - Automatic Progression Flow)
  const handleAnswerSelect = (answerIndex: number) => {
    // Prevent multiple selections
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    // Apply immediate visual feedback styling (consistent with category quizzes)
    // Enhanced timing: 400ms visual feedback + 250ms natural pause before progression
    setTimeout(() => {
      const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer;
      const rewardResult = isCorrect ? calculateCorrectAnswerReward() : { coins: 0 };
      const coinsEarned = rewardResult.coins;

      // Update score and coins for correct answers
      if (isCorrect) {
        setScore(score + 1);
        // Award coins for correct answers on homepage quiz
        dispatch({ type: 'UPDATE_COINS', payload: coinsEarned });
        console.log(`✅ Correct answer! Earned ${coinsEarned} coins`);
      } else {
        console.log(`❌ Wrong answer, no coins earned`);
      }

      // Automatic progression after visual feedback + brief pause (no RewardPopup for homepage quiz)
      // Brief pause makes progression feel more natural while maintaining automatic flow
      if (currentQuestion < quickStartQuiz.length - 1) {
        // Move to next question automatically after natural pause
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Complete the quiz automatically after natural pause
        setQuizCompleted(true);
        setShowResult(true);

        // Calculate final stats for achievements and user updates
        const finalScore = score + (isCorrect ? 1 : 0);
        const quizRewardResult = calculateQuizReward(finalScore, quickStartQuiz.length);
        const totalCoinsEarned = quizRewardResult.totalCoins;

        // Create updated user with null safety
        const currentUser = state.user || {
          id: `guest_${Date.now()}`,
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
    }, 650); // Enhanced timing: 400ms visual feedback + 250ms natural pause = 650ms total
  };

  // ===================================================================
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

              {/* Standardized completion timer (90s) */}
              <div className="glass-effect p-4 rounded-xl mb-4">
                <p className="text-blue-200 text-base font-medium mb-3 text-center">
                  Redirecting to categories in {resultCountdown} seconds...
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((90 - resultCountdown) / 90) * 100))}%` }}
                  />
                </div>
              </div>

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