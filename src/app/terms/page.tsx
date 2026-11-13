import Link from 'next/link'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_URL } from '@/config/site'
import { LegalPageShell } from '@/components/seo/LegalPageShell'

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Service">
      <p className="text-center text-sm text-blue-300">Last updated: {LEGAL_LAST_UPDATED}</p>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">The service</h2>
        <p>
          TechKwiz Play ({SITE_URL}) is a free quiz site. By using it, you agree to these terms.
          If you do not agree, please do not use the site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Coins and rewards</h2>
        <p>
          Coins, streaks, multipliers, and similar items on this site are virtual and are not cash.
          They have no monetary value, cannot be withdrawn, and are not transferable. We may change
          or remove them at any time.
        </p>
        <p>
          We do not pay or reward anyone for clicking ads. If a rewarded video ad is offered later,
          it will be an optional in-game prompt to watch a short ad for virtual in-game coins only,
          granted after the ad is completed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Acceptable use</h2>
        <p>
          Use the site lawfully and fairly. Do not cheat, automate play, interfere with other
          users, or attempt to misuse the quizzes, accounts, or scoring.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Content</h2>
        <p>
          Quiz text and other site content are provided for personal, non-commercial use. We may
          update, correct, or remove quizzes. The site is provided as is, without a guarantee that
          it will always be available or error-free.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Privacy</h2>
        <p>
          How we handle information is described in our{' '}
          <Link href="/privacy" className="text-orange-400 hover:text-orange-300">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Contact</h2>
        <p>
          Questions about these terms: {' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}
