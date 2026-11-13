import Link from 'next/link'
import { CONTACT_EMAIL } from '@/config/site'

const LEGAL_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
] as const

export function LegalFooter() {
  return (
    <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-blue-200">
      <nav aria-label="Legal" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {LEGAL_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-orange-400 hover:text-orange-300 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <p className="mt-3 text-xs text-blue-300/80">
        Questions?{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-orange-400 hover:text-orange-300">
          {CONTACT_EMAIL}
        </a>
      </p>
    </footer>
  )
}
