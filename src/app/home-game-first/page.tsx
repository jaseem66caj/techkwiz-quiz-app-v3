import type { Metadata } from 'next'
import { QuizCatalog } from '@/components/seo/QuizCatalog'
import { GameFirstHero } from '@/components/home/GameFirstHome'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { HomeExposure } from '@/components/home/HomeExposure'
import { TopBar } from '@/components/home/TopBar'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { listPublicCategories } from '@/content/quizLandings'
import { SITE_URL } from '@/config/site'

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: true },
}

export default function GameFirstHomePage() {
  const tiles = listPublicCategories().map(c => ({
    slug: c.slug,
    name: QUIZ_CATEGORIES[c.slug]?.name ?? c.name,
  }))

  return (
    <div data-wide-layout className="mx-auto w-full max-w-[1280px] px-4 py-4 text-white lg:px-12 lg:py-8">
      <HomeExposure variant="game_first" />
      <header className="flex items-center justify-between gap-4">
        <h1 className="whitespace-nowrap text-lg font-bold leading-7 text-white sm:text-xl">TechKwiz Play</h1>
        <TopBar />
      </header>
      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start">
        <div className="lg:sticky lg:top-6">
          <GameFirstHero />
        </div>
        <CategoryTiles categories={tiles} variant="game_first" />
      </div>
      <p className="pt-6 text-sm leading-6 text-gray-300">
        Short, free quizzes in the browser. Play a quick round on the homepage, or
        open a category below. Coins are virtual and are not cash. Each category
        round draws five questions from that quiz&apos;s bank.
      </p>
      <div className="-mx-4"><QuizCatalog heading="Browse quizzes" /></div>
    </div>
  )
}
