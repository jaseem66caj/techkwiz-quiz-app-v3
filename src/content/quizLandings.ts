import { QUIZ_CATEGORIES, QUIZ_DATABASE, type QuizQuestion } from '@/data/quizDatabase'
import { QUESTIONS_PER_ROUND } from '@/config/quiz'

export { QUESTIONS_PER_ROUND }

export interface QuizLandingContent {
  slug: string
  eyebrow: string
  intro: string
  metaDescription: string
  audience: string
  faqs: { question: string; answer: string }[]
  related: string[]
}

const LANDINGS: Record<string, Omit<QuizLandingContent, 'slug'>> = {
  programming: {
    eyebrow: 'Technical quiz',
    intro:
      'This programming quiz is for people who write or read code — in a job, in class, or on the side. Rounds cover JavaScript, Python, Git, CSS, HTTP, and SQL. Questions are multiple choice, in plain English, and stay specific (for example a language or protocol version) when the answer depends on it.',
    metaDescription:
      'A free programming quiz covering JavaScript, Python, Git, CSS, HTTP, and SQL. Five questions per round, with a short explanation after you answer.',
    audience: 'Developers and students who want a short, concrete coding check — not an exam dump.',
    faqs: [
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'How does a round work?', answer: 'Each round draws five multiple-choice questions from the programming bank. You earn coins for correct answers. A short explanation is shown after you answer.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest. A profile is optional if you want to keep coins and a streak on this device.' },
    ],
    related: ['ai', 'micro-trivia', 'future-you'],
  },
  ai: {
    eyebrow: 'Technical quiz',
    intro:
      'This AI quiz is for people who want a clear check on machine learning, neural nets, language models, and computer vision. It covers ideas you will meet in product and research write-ups — training versus inference, tokens and context windows, transformers, and why models sometimes invent facts — without hype or made-up benchmarks.',
    metaDescription:
      'A free artificial intelligence quiz on machine learning, language models, and computer vision. Five questions per round, with a short explanation after you answer.',
    audience: 'Readers who follow current AI and want accurate basics, not marketing copy.',
    faqs: [
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'How does a round work?', answer: 'Each round draws five multiple-choice questions from the AI bank. You earn coins for correct answers. A short explanation is shown after you answer.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest. A profile is optional if you want to keep coins and a streak on this device.' },
    ],
    related: ['programming', 'future-you', 'micro-trivia'],
  },
  'swipe-personality': {
    eyebrow: 'Personality quiz',
    intro:
      'This is a short preference quiz, not a scored exam. You pick between options to sketch a style or habit. There is no single correct answer, and the result is for fun — it is not a psychological assessment.',
    metaDescription:
      'A short, free personality quiz made of quick either-or choices. No single correct answers. Play in the browser on TechKwiz Play.',
    audience: 'Anyone who wants a quick, light personality round to share or replay.',
    faqs: [
      { question: 'Is there a right answer?', answer: 'No. These items describe preferences. Your choices are not marked right or wrong.' },
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['social-identity', 'trend-vibes', 'future-you'],
  },
  'pop-culture-flash': {
    eyebrow: 'Trivia quiz',
    intro:
      'A short pop-culture round on music, viral moments, and the references people actually share. Questions are multiple choice. Each round draws five items from the bank, and a brief note follows your answer.',
    metaDescription:
      'A free pop-culture quiz on music, trends, and viral moments. Five questions per round on TechKwiz Play.',
    audience: 'People who follow entertainment and internet culture.',
    faqs: [
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'How does a round work?', answer: 'Each round draws five multiple-choice questions. You earn coins for correct answers.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['micro-trivia', 'trend-vibes', 'swipe-personality'],
  },
  'micro-trivia': {
    eyebrow: 'Trivia quiz',
    intro:
      'Micro-trivia is a short general-knowledge round: a few facts, a timer, and four options. Each play draws five questions from the bank. It is meant to be finished in a couple of minutes, not as a long exam.',
    metaDescription:
      'A free, short general-knowledge quiz. Five questions per round, with a brief explanation after you answer.',
    audience: 'Anyone who wants a quick trivia round.',
    faqs: [
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'How does a round work?', answer: 'Each round draws five multiple-choice questions. A short explanation is shown after you answer. You earn coins for correct answers.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['pop-culture-flash', 'programming', 'ai'],
  },
  'social-identity': {
    eyebrow: 'Personality quiz',
    intro:
      'This quiz asks how you tend to show up online — the kind of posts you make, the tone you prefer, the persona that feels closest. There is no single correct answer. It is a light profile, not a diagnosis.',
    metaDescription:
      'A free social-identity quiz about how you present yourself online. Preference questions, not a scored exam.',
    audience: 'People curious about their online style, not a clinical test.',
    faqs: [
      { question: 'Is there a right answer?', answer: 'No. These items describe preferences and habits. They are not marked right or wrong.' },
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['swipe-personality', 'trend-vibes', 'future-you'],
  },
  'trend-vibes': {
    eyebrow: 'Culture quiz',
    intro:
      'A short round on slang, viral habits, and the phrases that move through feeds. Some items have a clear meaning; others are preference prompts. Each play is a five-question slice of the bank.',
    metaDescription:
      'A free quiz on slang, viral habits, and current internet culture. Short rounds on TechKwiz Play.',
    audience: 'People who want a quick check on current slang and trends.',
    faqs: [
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'How does a round work?', answer: 'Each round draws five questions from the bank. Where there is a factual answer, a short explanation follows.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['pop-culture-flash', 'social-identity', 'micro-trivia'],
  },
  'future-you': {
    eyebrow: 'Personality and tech quiz',
    intro:
      'This mix of preference prompts and tech-trend questions is about paths you might take and tools you might use — not a prediction of your life. Preference items have no single correct answer. Factual items are marked and explained.',
    metaDescription:
      'A free quiz on career paths and tech trends. A mix of preference prompts and factual questions on TechKwiz Play.',
    audience: 'People thinking about skills, tools, and what they might do next.',
    faqs: [
      { question: 'Is every question scored?', answer: 'No. Preference items are not marked right or wrong. Factual tech questions are scored and include a short explanation.' },
      { question: 'Is this quiz free?', answer: 'Yes. You can play in the browser without paying. Coins on TechKwiz Play are virtual and are not cash.' },
      { question: 'Do I need an account?', answer: 'No. You can play as a guest.' },
    ],
    related: ['ai', 'programming', 'swipe-personality'],
  },
}

export function getBankSize(slug: string): number {
  return QUIZ_DATABASE[slug]?.length ?? 0
}

export function getLanding(slug: string): QuizLandingContent | null {
  const base = LANDINGS[slug]
  if (!base || !QUIZ_CATEGORIES[slug]) return null
  return { slug, ...base }
}

export function getSampleQuestions(slug: string, limit = 2): QuizQuestion[] {
  const bank = QUIZ_DATABASE[slug] || []
  const explained = bank.filter(q => q.correct_answer >= 0 && q.fun_fact)
  const source = explained.length >= limit ? explained : bank
  return source.slice(0, limit)
}

export function listPublicCategories(): { slug: string; name: string; description: string }[] {
  return Object.keys(QUIZ_CATEGORIES).map(slug => ({
    slug,
    name: QUIZ_CATEGORIES[slug].name,
    description: LANDINGS[slug]?.metaDescription || QUIZ_CATEGORIES[slug].description,
  }))
}
