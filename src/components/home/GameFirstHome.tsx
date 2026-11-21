'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'
import { ExitConfirmationModal } from '@/components/modals'
import { CreateProfile } from '@/components/user/CreateProfile'
import { useExitPrevention } from '@/hooks/useExitPrevention'
import { useHomepageQuizProgression } from '@/hooks/useHomepageQuizProgression'
import { useDailyStreak, DAILY_UPDATED_EVENT } from '@/hooks/useDailyStreak'
import { saveUser } from '@/utils/auth'
import { calculateQuizReward } from '@/utils/rewardCalculator'
import { getDailyChallenge, utcDateKey } from '@/utils/dailyChallenge'
import { secondsUntilUtcMidnight, formatHMS } from '@/utils/dailyStreak'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import type { QuizQuestion } from '@/types/quiz'
import { trackEvent, readAbContext } from '@/lib/ga4'
import { Confetti } from './Confetti'
import { FlameIcon } from './CategoryIcons'
import './home-motion.css'

const UnifiedQuizInterface = dynamic(
  () => import('@/components/quiz/UnifiedQuizInterface').then(m => m.UnifiedQuizInterface),
  { loading: () => <div className="h-64 animate-pulse rounded-lg bg-white/10" /> }
)

export const SECONDS_PER_QUESTION = 20
const TIMEOUT_ANSWER = -2

function Round({
  questions,
  onExit,
  onPlayAgain,
  category,
}: {
  questions: QuizQuestion[]
  onExit: () => void
  onPlayAgain: () => void
  category: string
}) {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const streak = useDailyStreak()
  const { currentQuestion, selectedAnswer, score, showResult, quizCompleted, handleAnswerSelect } =
    useHomepageQuizProgression(questions)
  const [timer, setTimer] = useState({ q: 0, left: SECONDS_PER_QUESTION })
  const [showExit, setShowExit] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [shareNote, setShareNote] = useState('')
  const startedRef = useRef(false)
  const completedRef = useRef(false)

  const answer = useCallback(
    (idx: number) => {
      if (!startedRef.current) {
        startedRef.current = true
        const ctx = readAbContext('game_first')
        trackEvent('quiz_start', {
          category,
          source: 'daily_challenge',
          experiment_variant: ctx.variant,
          experiment_group: ctx.group,
        })
      }
      handleAnswerSelect(idx)
    },
    [category, handleAnswerSelect]
  )

  const secondsLeft = timer.q === currentQuestion ? timer.left : SECONDS_PER_QUESTION

  useEffect(() => {
    if (quizCompleted || selectedAnswer !== null) return
    if (secondsLeft <= 0) {
      answer(TIMEOUT_ANSWER)
      return
    }
    const t = setTimeout(() => setTimer({ q: currentQuestion, left: secondsLeft - 1 }), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, selectedAnswer, quizCompleted, answer, currentQuestion])

  useEffect(() => {
    if (!(quizCompleted && showResult) || completedRef.current) return
    completedRef.current = true
    const ctx = readAbContext('game_first')
    trackEvent('quiz_complete', {
      category,
      source: 'daily_challenge',
      score,
      total: questions.length,
      experiment_variant: ctx.variant,
      experiment_group: ctx.group,
    })
    try {
      localStorage.setItem(`tk_daily_done_${utcDateKey()}`, String(score))
      window.dispatchEvent(new Event(DAILY_UPDATED_EVENT))
    } catch {
      /* storage unavailable */
    }
  }, [quizCompleted, showResult, score, questions.length, category])

  useExitPrevention({
    isActive: !quizCompleted && !showResult,
    onExitAttempt: () => setShowExit(true),
  })

  const reward = calculateQuizReward(score, questions.length).totalCoins
  const cat = QUIZ_CATEGORIES[category]
  const totalQuizzes = state.user?.totalQuizzes ?? 0
  const level = state.user?.level ?? 1
  const quizzesTowardNext = totalQuizzes % 5
  const pctCorrect = Math.round((score / questions.length) * 100)

  const share = async () => {
    const text = `I scored ${score}/${questions.length} on today's TechKwiz daily challenge. Can you beat it?`
    const url = 'https://play.techkwiz.com'
    let method = 'copy'
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        method = 'native'
        await navigator.share({ text, url })
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`)
        setShareNote('Copied to clipboard')
      }
      trackEvent('share', { method, content_type: 'daily_result', score, total: questions.length })
    } catch {
      /* user cancelled */
    }
  }

  const handleProfileCreated = (username: string, avatar: string) => {
    const user = {
      id: state.user?.id || `user_${Date.now()}`,
      name: username,
      avatar,
      coins: state.user?.coins || 0,
      level: state.user?.level || 1,
      totalQuizzes: state.user?.totalQuizzes || 0,
      correctAnswers: state.user?.correctAnswers || 0,
      joinDate: state.user?.joinDate || new Date().toISOString(),
      quizHistory: state.user?.quizHistory || [],
      streak: state.user?.streak || 0,
    }
    saveUser(user)
    dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    router.push('/start')
  }

  if (showProfile) return <CreateProfile onProfileCreated={handleProfileCreated} />

  if (quizCompleted && showResult) {
    return (
      <div className="relative pt-6" data-testid="game-first-result">
        <Confetti />
        <div className="relative z-10 rounded-2xl border border-white/10 bg-[rgba(30,60,114,.8)] p-6 text-center shadow backdrop-blur-[10px]">
          <h2 className="text-2xl font-bold text-white">Nice round!</h2>
          <p className="mt-3 text-5xl font-extrabold text-white">
            {score} / {questions.length}
          </p>
          <p className="mt-1 text-sm text-gray-300">{cat?.name ?? category} daily challenge</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-orange-400 bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">+{reward} coins</span>
            {streak > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-orange-400 bg-orange-500/20 px-3 py-1 text-sm font-semibold text-orange-300">
                <FlameIcon /> {streak}-day streak
              </span>
            )}
          </div>
          <div className="mt-5 grid gap-3">
            <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-3">
              <p className="text-xs font-semibold uppercase text-green-300">Score</p>
              <p className="mt-1 text-lg font-bold text-white">{score} of {questions.length} correct, {pctCorrect}%</p>
            </div>
            <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-3">
              <p className="text-xs font-semibold uppercase text-orange-300">Reward</p>
              <p className="mt-1 text-lg font-bold text-white">+{reward} coins earned</p>
            </div>
            <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3">
              <p className="text-xs font-semibold uppercase text-blue-300">Next</p>
              <p className="mt-1 text-lg font-bold text-white">Level {level}: {quizzesTowardNext} of 5 quizzes to Level {level + 1}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${(quizzesTowardNext / 5) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={onPlayAgain}
              className="min-h-[48px] rounded-xl bg-orange-500 px-4 font-bold text-white transition-colors hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Play another quiz
            </button>
            <button
              onClick={share}
              className="min-h-[48px] rounded-xl border border-white/20 px-4 font-semibold text-white transition-colors hover:border-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
            >
              Share my score
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="min-h-[48px] rounded-xl border border-white/20 px-4 font-semibold text-white transition-colors hover:border-purple-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
            >
              Save progress: create profile
            </button>
          </div>
          <p role="status" className="mt-2 min-h-[20px] text-xs text-gray-300">
            {shareNote}
          </p>
        </div>
      </div>
    )
  }

  const pct = Math.max(0, (secondsLeft / SECONDS_PER_QUESTION) * 100)
  const urgent = secondsLeft <= 5

  return (
    <>
      <div className="pt-4">
        <div className="mb-3 flex items-center justify-between text-sm text-white">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span
            className={`font-semibold tabular-nums ${urgent ? 'text-red-300' : 'text-white'}`}
            data-testid="timer"
          >
            {selectedAnswer === null ? `${secondsLeft}s` : 'Locked in'}
          </span>
        </div>
        <div
          className="mb-4 h-2 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-label="Time left for this question"
          aria-valuemin={0}
          aria-valuemax={SECONDS_PER_QUESTION}
          aria-valuenow={secondsLeft}
        >
          <div
            className={`h-full rounded-full ${urgent ? 'bg-purple-300' : 'bg-blue-400'} transition-[width] duration-1000 ease-linear motion-reduce:transition-none`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <UnifiedQuizInterface
          question={questions[currentQuestion]}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={answer}
          questionAnswered={selectedAnswer !== null}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          showProgress={false}
          encouragementMessages={false}
          mode="enhanced"
        />
        <button onClick={() => setShowExit(true)} className="mt-4 min-h-[44px] text-sm text-gray-300 underline">
          Leave quiz
        </button>
      </div>
      <ExitConfirmationModal
        isOpen={showExit}
        onConfirm={onExit}
        onCancel={() => setShowExit(false)}
        currentProgress={{
          questionNumber: currentQuestion + 1,
          totalQuestions: questions.length,
          coinsAtRisk: reward,
        }}
      />
    </>
  )
}

export function GameFirstHero() {
  const [round, setRound] = useState(0)
  const [daily] = useState(() => getDailyChallenge())
  const [countdown, setCountdown] = useState('--:--:--')
  const [mounted, setMounted] = useState(false)
  const streak = useDailyStreak()

  useEffect(() => {
    setMounted(true)
    const update = () => {
      setCountdown(formatHMS(secondsUntilUtcMidnight(new Date())))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const cat = QUIZ_CATEGORIES[daily.category]

  const start = () => {
    const ctx = readAbContext('game_first')
    trackEvent('homepage_quiz_cta', { category: daily.category, source: 'start_button', experiment_variant: ctx.variant })
    trackEvent('daily_challenge_start', {
      category: daily.category,
      source: 'start_button',
      experiment_variant: ctx.variant,
      experiment_group: ctx.group,
    })
    setRound(r => r + 1)
  }

  if (round > 0) {
    return (
      <Round
        key={round}
        questions={daily.questions}
        category={daily.category}
        onExit={() => setRound(0)}
        onPlayAgain={start}
      />
    )
  }

  return (
    <section aria-labelledby="daily-heading" className="pt-3 lg:pt-0">
      <div className="rounded-2xl border border-white/10 bg-[rgba(30,60,114,.8)] p-5 shadow backdrop-blur-[10px]">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-200">Daily challenge</p>
        <h2 id="daily-heading" className="mt-2 text-3xl font-bold text-orange-400">
          {cat?.name ?? daily.category}
        </h2>
        <p className="mt-1 text-sm text-gray-200">
          5 questions, {SECONDS_PER_QUESTION} seconds each.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200">
            <span className="sr-only">Resets at 00:00 UTC. Time remaining: </span>
            <span aria-hidden="true">Resets in {mounted ? countdown : '--:--:--'} (00:00 UTC)</span>
          </span>
          {streak > 0 && (
            <span className="flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-300">
              <FlameIcon /> {streak}-day streak
            </span>
          )}
        </div>
        <button
          onClick={start}
          data-testid="start-quiz"
          className="tk-start-bounce mt-4 min-h-[56px] w-full rounded-xl bg-orange-500 px-4 text-xl font-extrabold text-white transition-colors hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Start quiz
        </button>
        <p className="mt-2 text-xs text-gray-300">Free to play. Coins are virtual, not cash.</p>
      </div>
    </section>
  )
}
