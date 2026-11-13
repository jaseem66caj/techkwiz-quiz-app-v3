import Link from 'next/link'
import { CONTACT_EMAIL, GA_MEASUREMENT_ID, LEGAL_LAST_UPDATED, SITE_URL } from '@/config/site'
import { LegalPageShell } from '@/components/seo/LegalPageShell'

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy">
      <p className="text-center text-sm text-blue-300">Last updated: {LEGAL_LAST_UPDATED}</p>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Who we are</h2>
        <p>
          This policy describes how TechKwiz Play (
          <a href={SITE_URL} className="text-orange-400 hover:text-orange-300">{SITE_URL}</a>
          ) handles information when you use this quiz site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Information we collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            Quiz activity stored in your browser, such as coins, streaks, and progress.
            Coins are virtual and are not cash.
          </li>
          <li>If you sign in, the account details you provide, such as a display name or email address.</li>
          <li>
            Usage data through Google Analytics 4 (measurement ID {GA_MEASUREMENT_ID}), which may
            include pages viewed, approximate location, and device information, using cookies or
            similar identifiers.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Advertising and cookies</h2>
        <p>
          We may use Google AdSense or other Google advertising services to show ads. Ads are not
          currently displayed on this site. When ads are shown, the following applies.
        </p>
        <p>
          Third party vendors, including Google, use cookies to serve ads based on a user&apos;s
          prior visits to this website or other websites.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to your
          users based on their visit to your sites and/or other sites on the Internet.
        </p>
        <p>
          Users may opt out of personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            className="text-orange-400 hover:text-orange-300"
            rel="noopener noreferrer"
            target="_blank"
          >
            Ads Settings
          </a>
          . Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for
          personalized advertising by visiting{' '}
          <a
            href="https://www.aboutads.info"
            className="text-orange-400 hover:text-orange-300"
            rel="noopener noreferrer"
            target="_blank"
          >
            www.aboutads.info
          </a>
          .
        </p>
        <p>
          You can also read{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className="text-orange-400 hover:text-orange-300"
            rel="noopener noreferrer"
            target="_blank"
          >
            how Google uses data on partner sites or apps
          </a>
          .
        </p>
        <p>
          We do not reward anyone for clicking ads. If we later offer a rewarded video ad, it will
          be an optional in-game prompt: you choose to watch a short ad in exchange for virtual,
          non-transferable in-game coins, granted only after the ad is completed. That is not a
          payment and is not cash.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">How we use information</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>To run the quizzes, remember progress, and improve the site</li>
          <li>To understand how the site is used (via Google Analytics 4)</li>
          <li>To respond if you email us</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Data retention</h2>
        <p>
          Browser-stored quiz data stays on your device until you clear it. Analytics data is kept
          according to our Google Analytics settings. We do not sell your personal information.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Contact</h2>
        <p>
          Questions about this policy: {' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300">
            {CONTACT_EMAIL}
          </a>
          . You can also use our {' '}
          <Link href="/contact" className="text-orange-400 hover:text-orange-300">
            contact page
          </Link>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}
