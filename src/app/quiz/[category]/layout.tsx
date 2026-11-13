import type { Metadata } from 'next'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { getCategoryMetadata, generateStructuredData } from '@/utils/seo'

export function generateStaticParams() {
  return Object.keys(QUIZ_CATEGORIES).map(category => ({ category }))
}

// Unknown category slugs must 404, not render with fallback content
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  return getCategoryMetadata(category)
}

export default async function QuizCategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const quizJsonLd = generateStructuredData.quiz(category)

  return (
    <>
      {quizJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
        />
      )}
      {children}
    </>
  )
}
