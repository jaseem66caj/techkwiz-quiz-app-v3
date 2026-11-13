import Link from 'next/link'
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from '@/config/site'
import { LegalPageShell } from '@/components/seo/LegalPageShell'

export default function ContactPage() {
  return (
    <LegalPageShell title="Contact">
      <p className="text-center text-sm text-blue-300">Last updated: {LEGAL_LAST_UPDATED}</p>

      <section className="space-y-3">
        <p>
          For questions about TechKwiz Play, privacy, or these terms, email{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300">
            {CONTACT_EMAIL}
          </a>
          . This is the same contact address used on the TechKwiz blog.
        </p>
        <p>
          We do not publish a business street address. Please use the email above.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-orange-400">Policies</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <Link href="/privacy" className="text-orange-400 hover:text-orange-300">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-orange-400 hover:text-orange-300">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/about" className="text-orange-400 hover:text-orange-300">
              About TechKwiz Play
            </Link>
          </li>
        </ul>
      </section>
    </LegalPageShell>
  )
}
