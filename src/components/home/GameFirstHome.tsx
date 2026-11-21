'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useApp } from '@/app/providers'
import { ExitConfirmationModal } from '@/components/modals'
import { CreateProfile } from '@/components/user/CreateProfile'
import { useExitPrevention } from '@/hooks/useExitPrevention'
import { useHomepageQuizProgression } from '@/hooks/useHomepageQuizProgression'
import { saveUser } from '@/utils/auth'
import { calculateQuizReward } from '@/utils/rewardCalculator'
import { getDailyChallenge, utcDateKey } from '@/utils/dailyChallenge'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import type { QuizQuestion } from '@/types/quiz'
import { trackEvent, readAbContext } from '@/lib/ga4'

const UnifiedQuizInterface = dynamic(
  () => import('@/components/quiz/UnifiedQuizInterface').then(m => m.UnifiedQuizInterface),
  { loading: () => <div className="h-64 animate-pulse rounded-lg bg-[#2A2A2D]" /> }
)

/** Seconds per question. The timer is always on; running out counts as a wrong answer. */
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
  const { currentQuestion, selectedAnswer, score, showResult, quizCompleted, handleAnswerSelect } =
    useHomepageQuizProgression(questions)
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION)
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

  // Per-question countdown, reset whenever the question changes.
  useEffect(() => {
    if (quizCompleted) return
    setSecondsLeft(SECONDS_PER_QUESTION)
  }, [currentQuestion, quizCompleted])

  useEffect(() => {
    if (quizCompleted || selectedAnswer !== null) return
    if (secondsLeft <= 0) {
      answer(TIMEOUT_ANSWER)
      return
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secondsLeft, selectedAnswer, quizCompleted, answer])

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
    } catch {
      /* storage unavailable */
    }
  }, [quizCompleted, showResult, score, questions.length, category])

  useExitPrevention({
    isActive: !quizCompleted && !showResult,
    onExitAttempt: () => setShowExit(true),
  })

  const reward = calculateQuizReward(score, questions.length).totalCoins

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
      <div className="px-4 pt-6" data-testid="game-first-result">
        <div className="rounded-lg border border-[#3A3A3D] bg-[#2A2A2D] p-5 text-center">
          <h2 className="text-xl font-bold text-[#F2EFE8]">Daily challenge done</h2>
          <p className="mt-3 text-4xl font-bold text-[#F2EFE8]">
            {score}/{questions.length}
          </p>
          <p className="mt-1 text-sm text-[#ADADA6]">+{reward} virtual coins</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              onClick={onPlayAgain}
              className="min-h-[48px] rounded-md bg-[#1F77D0] px-4 font-semibold text-white hover:bg-[#4DB2FF] hover:text-[#100F0F]"
            >
              Play again
            </button>
            <button
              onClick={share}
              className="min-h-[48px] rounded-md border border-[#3A3A3D] px-4 font-semibold text-[#F2EFE8] hover:border-[#4DB2FF]"
            >
              Share result
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="min-h-[48px] rounded-md border border-[#3A3A3D] px-4 font-semibold text-[#F2EFE8] hover:border-[#4DB2FF]"
            >
              Save progress: create profile
            </button>
          </div>
          <p role="status" className="mt-2 min-h-[20px] text-xs text-[#ADADA6]">
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
      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between text-sm text-[#E6E3DC]">
          <span>
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span
            className={`font-semibold tabular-nums ${urgent ? 'text-[#FCA5A5]' : 'text-[#E6E3DC]'}`}
            data-testid="timer"
          >
            {selectedAnswer === null ? `${secondsLeft}s` : 'Locked in'}
          </span>
        </div>
        <div
          className="mb-4 h-2 overflow-hidden rounded-full bg-[#242426]"
          role="progressbar"
          aria-label="Time left for this question"
          aria-valuemin={0}
          aria-valuemax={SECONDS_PER_QUESTION}
          aria-valuenow={secondsLeft}
        >
          <div
            className={`h-full rounded-full ${urgent ? 'bg-[#FCA5A5]' : 'bg-[#0091F9]'} transition-[width] duration-1000 ease-linear motion-reduce:transition-none`}
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
        <button onClick={() => setShowExit(true)} className="mt-4 min-h-[44px] text-sm text-[#ADADA6] underline">
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

/** Above-the-fold hero: daily challenge card + big Start quiz button. */
export function GameFirstHero() {
  const [round, setRound] = useState(0) // 0 = not started
  const [daily] = useState(() => getDailyChallenge())
  const [doneScore, setDoneScore] = useState<string | null>(null)

  useEffect(() => {
    try {
      setDoneScore(localStorage.getItem(`tk_daily_done_${utcDateKey()}`))
    } catch {
      /* ignore */
    }
  }, [round])

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
    <section aria-labelledby="daily-heading" className="px-4 pt-3">
      <div className="rounded-lg border border-[#3A3A3D] bg-[#2A2A2D] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#EF7300]">Daily challenge</p>
        <h2 id="daily-heading" className="mt-1 text-xl font-bold leading-7 text-[#F2EFE8]">
          <span aria-hidden="true">{cat?.icon} </span>
          {cat?.name ?? daily.category}
        </h2>
        <p className="mt-1 text-sm text-[#E6E3DC]">
          5 questions, {SECONDS_PER_QUESTION} seconds each. New challenge every day at midnight UTC.
        </p>
        {doneScore !== null && (
          <p className="mt-2 text-sm text-[#2EA48B]">Today&apos;s best on this device: {doneScore}/5</p>
        )}
        <button
          onClick={start}
          data-testid="start-quiz"
          className="mt-4 min-h-[56px] w-full rounded-md bg-[#1F77D0] px-4 text-lg font-bold text-white transition-colors hover:bg-[#4DB2FF] hover:text-[#100F0F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4DB2FF]"
        >
          Start quiz
        </button>
        <p className="mt-2 text-xs text-[#ADADA6]">Free to play. Coins are virtual, not cash.</p>
      </div>
    </section>
  )
}
