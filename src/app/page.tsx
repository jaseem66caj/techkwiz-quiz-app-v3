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

export default function HomePage() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  
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

  // Auto-redirect timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;
    
    if (showResult && quizCompleted) {
      // Auto-redirect to profile creation after 90 seconds
      timer = setTimeout(() => {
        setShowResult(false);
        setShowCreateProfile(true);
      }, 90000); // 90 seconds

      // Countdown timer
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

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [showResult, quizCompleted]);

  const { disablePrevention } = useExitPrevention({
    isActive: !quizCompleted && !showResult,
    onExitAttempt: () => {
      setShowExitConfirmation(true)
    },
    customMessage: "Are you sure you want to leave? Your progress will be lost!"
  })

  useEffect(() => {
    const loadQuizQuestions = () => {
      if (typeof window === 'undefined') {
        return
      }

      try {
        setIsLoadingQuestions(true)
        const gameSyncData = localStorage.getItem('game_quiz_data')
        let questions = []

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

        const homepageQuestions = questions.filter(q => q.section === 'homepage')
        const beginnerQuestions = questions.filter(q => q.difficulty === 'beginner')
        let questionsToUse = homepageQuestions.length >= 5 ? homepageQuestions : beginnerQuestions

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

    loadQuizQuestions()

    const handleQuizSync = () => {
      loadQuizQuestions()
    }

    try {
      realTimeSyncService.addEventListener('quiz_updated', handleQuizSync)
    } catch (error) {
      console.error('Error setting up quiz sync listener:', error)
    }

    return () => {
      try {
        realTimeSyncService.removeEventListener('quiz_updated', handleQuizSync)
      } catch (error) {
        console.error('Error removing quiz sync listener:', error)
      }
    }
  }, [])

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

  const quickStartQuiz = quizQuestions.length > 0 ? quizQuestions : getFallbackQuestions();

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIndex);

    const isCorrect = answerIndex === quickStartQuiz[currentQuestion].correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion < quickStartQuiz.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      }, 1000);
    } else {
      setQuizCompleted(true);
      setShowResult(true);
      const coinsEarned = score * 50 + (isCorrect ? 50 : 0); // Add coins for current answer
      const updatedUser = { 
        ...state.user, 
        totalQuizzes: state.user.totalQuizzes + 1, 
        correctAnswers: state.user.correctAnswers + score + (isCorrect ? 1 : 0),
        streak: isCorrect ? state.user.streak + 1 : 0,
        coins: state.user.coins + coinsEarned
      };
      
      const unlockedAchievements = getUnlockedAchievements(state.user);
      const newlyUnlocked = getUnlockedAchievements(updatedUser).filter(
        unlocked => !unlockedAchievements.some(a => a.id === unlocked.id)
      );

      if (newlyUnlocked.length > 0) {
        dispatch({ type: 'NEW_ACHIEVEMENT', payload: newlyUnlocked[0] });
      }

      dispatch({ type: 'UPDATE_COINS', payload: coinsEarned });
      dispatch({ type: 'END_QUIZ', payload: { correctAnswers: score + (isCorrect ? 1 : 0), totalQuestions: quickStartQuiz.length } });
      // Remove the automatic redirect to profile creation
      // The user will now stay on the result page with options to proceed
    }
  };

  const handleProfileCreated = (username: string, avatar: string) => {
    const coinsEarned = score * 50;
    const user = {
      ...state.user,
      name: username,
      avatar: avatar,
      coins: state.user.coins + coinsEarned, // Add earned coins to user's total
    };
    saveUser(user);
    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    setShowCreateProfile(false);
    router.push('/start');
  };

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
  
  if (showCreateProfile) {
    return <CreateProfile onProfileCreated={handleProfileCreated} />;
  }

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