import type { Metadata } from 'next'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { getCategoryMetadata, generateStructuredData } from '@/utils/seo'
import { QuizLandingTop, QuizLandingBottom } from '@/components/seo/QuizLanding'

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
  const breadcrumbJsonLd = generateStructuredData.breadcrumb(category)

  return (
    <>
      {quizJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <QuizLandingTop slug={category} />
      <div id="play-quiz">{children}</div>
      <QuizLandingBottom slug={category} />
    </>
  )
}
