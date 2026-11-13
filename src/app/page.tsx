import { QuizCatalog } from '@/components/seo/QuizCatalog'
import HomePageClient from './HomePageClient'

export default function HomePage() {
  return (
    <>
      <header className="px-4 pt-4 pb-2 text-white">
        <h1 className="text-xl font-semibold leading-7">TechKwiz Play</h1>
        <p className="mt-2 text-sm leading-6 text-gray-200">
          Short, free quizzes in the browser. Play a quick round on the homepage, or
          open a category below. Coins are virtual and are not cash. Each category
          round draws five questions from that quiz&apos;s bank.
        </p>
      </header>
      <QuizCatalog heading="Browse quizzes" />
      <HomePageClient />
    </>
  )
}
