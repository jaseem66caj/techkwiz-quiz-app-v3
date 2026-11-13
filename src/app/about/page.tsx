import Link from 'next/link'
import { CONTACT_EMAIL } from '@/config/site'
import { QUIZ_CATEGORIES } from '@/data/quizDatabase'
import { LegalPageShell } from '@/components/seo/LegalPageShell'

const categoryNames = Object.values(QUIZ_CATEGORIES).map((category) => category.name)

export default function AboutPage() {
  return (
    <LegalPageShell title={<AboutTitle />}>
      <section className="text-center">
        <p className="text-xl text-blue-200 leading-relaxed">
          TechKwiz Play is a free browser quiz site for short rounds on technology and general
          knowledge.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">What you can play</h2>
        <p>
          Quizzes on this site currently cover: {categoryNames.slice(0, -1).join(', ')}, and{' '}
          {categoryNames.slice(-1)[0]}. Each category round draws five questions from that
          quiz&apos;s bank. Coins you earn are virtual and are not cash.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">How it works</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Play on the homepage or open a category from the catalog.</li>
          <li>Rounds have beginner, intermediate, and advanced questions where those exist.</li>
          <li>
            Questions are written or reviewed for this site. Some drafts may be prepared with AI
            assistance and checked before they go live.
          </li>
          <li>You can track a streak and see a leaderboard. There is no cash prize.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Get started</h2>
        <p>
          <Link href="/start" className="text-orange-400 hover:text-orange-300">
            Browse the quiz catalog
          </Link>{' '}
          or start a quick round from the homepage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Contact</h2>
        <p>
          Questions or feedback:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300">
            {CONTACT_EMAIL}
          </a>
          . See also the{' '}
          <Link href="/contact" className="text-orange-400 hover:text-orange-300">
            contact page
          </Link>
          ,{' '}
          <Link href="/privacy" className="text-orange-400 hover:text-orange-300">
            privacy policy
          </Link>
          , and{' '}
          <Link href="/terms" className="text-orange-400 hover:text-orange-300">
            terms
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}

function AboutTitle() {
  return (
    <>
      About <span className="text-orange-400">Tech</span>Kwiz
    </>
  )
}
