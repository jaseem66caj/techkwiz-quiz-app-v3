import Link from 'next/link'
import { listPublicCategories } from '@/content/quizLandings'

export function QuizCatalog({ heading = 'All quizzes' }: { heading?: string }) {
  const categories = listPublicCategories()

  return (
    <nav aria-label="Quiz categories" className="px-4 py-4 text-white">
      <h2 className="text-sm font-semibold tracking-wide text-blue-300">{heading}</h2>
      <ul className="mt-2 space-y-2">
        {categories.map(category => (
          <li key={category.slug}>
            <Link
              href={`/quiz/${category.slug}`}
              className="block rounded-lg px-1 py-1 text-sm text-white underline decoration-blue-400 underline-offset-2 hover:text-blue-200"
            >
              {category.name}
            </Link>
            <p className="text-xs leading-5 text-gray-300">{category.description}</p>
          </li>
        ))}
      </ul>
    </nav>
  )
}
