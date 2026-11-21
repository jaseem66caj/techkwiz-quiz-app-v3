import { QUIZ_DATABASE } from '@/data/quizDatabase'
import type { QuizQuestion } from '@/types/quiz'
import { QUESTIONS_PER_ROUND } from '@/config/quiz'

/** Daily challenge resets at midnight UTC. */
export function utcDateKey(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seeded(seed: number) {
  let s = seed || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Categories that have at least a full round of scored (non-personality) questions. */
export function dailyCategories(): string[] {
  return Object.keys(QUIZ_DATABASE)
    .filter(slug => QUIZ_DATABASE[slug].filter(q => q.correct_answer >= 0).length >= QUESTIONS_PER_ROUND)
    .sort()
}

export function getDailyChallenge(dateKey: string = utcDateKey()): {
  dateKey: string
  category: string
  questions: QuizQuestion[]
} {
  const cats = dailyCategories()
  const category = cats[hash(`cat:${dateKey}`) % cats.length]
  const rand = seeded(hash(`q:${dateKey}`))
  const pool = QUIZ_DATABASE[category].filter(q => q.correct_answer >= 0)
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return { dateKey, category, questions: shuffled.slice(0, QUESTIONS_PER_ROUND) }
}
