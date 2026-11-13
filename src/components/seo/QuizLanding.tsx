import Link from 'next/link'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import {
  QUESTIONS_PER_ROUND,
  getBankSize,
  getLanding,
  getSampleQuestions,
} from '@/content/quizLandings'

function CategoryName({ slug }: { slug: string }) {
  return <>{QUIZ_CATEGORIES[slug]?.name ?? slug}</>
}

export function QuizLandingTop({ slug }: { slug: string }) {
  const landing = getLanding(slug)
  const category = QUIZ_CATEGORIES[slug]
  if (!landing || !category) return null

  const bankSize = getBankSize(slug)
  const roundSize = Math.min(QUESTIONS_PER_ROUND, bankSize || QUESTIONS_PER_ROUND)

  return (
    <header className="px-4 pt-4 pb-3 text-white">
      <p className="text-xs uppercase tracking-wide text-blue-300">{landing.eyebrow}</p>
      <h1 className="mt-1 text-xl font-semibold leading-7">{category.name} Quiz</h1>
      <p className="mt-2 text-sm leading-6 text-gray-200">{landing.intro}</p>
      <p className="mt-2 text-sm leading-6 text-gray-300">
        The bank currently has {bankSize} {bankSize === 1 ? 'question' : 'questions'}. Each round draws {roundSize}. {landing.audience}
      </p>
      <p className="mt-3">
        <a
          href="#play-quiz"
          className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          Play this quiz
        </a>
      </p>
    </header>
  )
}

export function QuizLandingBottom({ slug }: { slug: string }) {
  const landing = getLanding(slug)
  const category = QUIZ_CATEGORIES[slug]
  if (!landing || !category) return null

  const samples = getSampleQuestions(slug, 2)

  return (
    <section className="px-4 pb-8 pt-4 text-white">
      {samples.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold tracking-wide text-blue-300">Sample questions</h2>
          <p className="mt-1 text-xs leading-5 text-gray-400">
            These examples are from the bank so you can see how a question is explained. A
            live round draws from the full set and may or may not include them.
          </p>
          <ol className="mt-3 space-y-4">
            {samples.map((item, index) => {
              const hasAnswer = item.correct_answer >= 0 && item.options[item.correct_answer]
              return (
                <li key={item.id} className="rounded-xl border border-white/10 p-3">
                  <p className="text-sm font-medium leading-6">
                    {index + 1}. {item.question}
                  </p>
                  {hasAnswer ? (
                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      Answer: {item.options[item.correct_answer]}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-gray-200">
                      This item has no single correct answer.
                    </p>
                  )}
                  {item.fun_fact && (
                    <p className="mt-1 text-sm leading-6 text-gray-300">{item.fun_fact}</p>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-sm font-semibold tracking-wide text-blue-300">Questions people ask</h2>
        <dl className="mt-2 space-y-3">
          {landing.faqs.map(faq => (
            <div key={faq.question}>
              <dt className="text-sm font-medium leading-6">{faq.question}</dt>
              <dd className="text-sm leading-6 text-gray-300">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div>
        <h2 className="text-sm font-semibold tracking-wide text-blue-300">Related quizzes</h2>
        <ul className="mt-2 space-y-1">
          {landing.related.map(relatedSlug => (
            <li key={relatedSlug}>
              <Link
                href={`/quiz/${relatedSlug}`}
                className="text-sm text-white underline decoration-blue-400 underline-offset-2 hover:text-blue-200"
              >
                <CategoryName slug={relatedSlug} /> Quiz
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
