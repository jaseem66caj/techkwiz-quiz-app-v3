import type { Metadata } from 'next'
import { buildPageMetadata } from '@/utils/seo'
import { QuizCatalog } from '@/components/seo/QuizCatalog'

export const metadata: Metadata = buildPageMetadata({
  title: 'Quiz Categories | TechKwiz',
  description:
    'Browse free TechKwiz quizzes: programming, AI, trivia, pop culture, and personality rounds. Five questions per round.',
  path: '/start',
  imagePath: '/og/default.png',
})

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <QuizCatalog heading="All quizzes on TechKwiz Play" />
    </>
  )
}
