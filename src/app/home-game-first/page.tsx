import type { Metadata } from 'next'
import { QuizCatalog } from '@/components/seo/QuizCatalog'
import { GameFirstHero } from '@/components/home/GameFirstHome'
import { CategoryTiles } from '@/components/home/CategoryTiles'
import { HomeExposure } from '@/components/home/HomeExposure'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { listPublicCategories } from '@/content/quizLandings'
import { SITE_URL } from '@/config/site'

// Served at "/" by middleware for the game_first variant. Direct visits are for review only.
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  robots: { index: false, follow: true },
}

export default function GameFirstHomePage() {
  const tiles = listPublicCategories().map(c => ({
    slug: c.slug,
    name: QUIZ_CATEGORIES[c.slug]?.name ?? c.name,
    icon: QUIZ_CATEGORIES[c.slug]?.icon ?? '🎯',
  }))

  return (
    <div className="min-h-screen bg-[#1C1C1E] pb-8 text-[#E6E3DC]">
      <HomeExposure variant="game_first" />
      <header className="px-4 pt-4">
        <h1 className="text-xl font-bold leading-7 text-[#F2EFE8]">TechKwiz Play</h1>
      </header>
      <GameFirstHero />
      <CategoryTiles categories={tiles} variant="game_first" />
      {/* Same text and links as the current homepage (content parity), moved below the game. */}
      <p className="px-4 pt-6 text-sm leading-6 text-[#ADADA6]">
        Short, free quizzes in the browser. Play a quick round on the homepage, or
        open a category below. Coins are virtual and are not cash. Each category
        round draws five questions from that quiz&apos;s bank.
      </p>
      <QuizCatalog heading="Browse quizzes" />
    </div>
  )
}
