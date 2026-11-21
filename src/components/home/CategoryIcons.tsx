import type { ReactNode } from 'react'

type IconProps = {
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 48 48',
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 2.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function SwipeIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="6" y="10" width="24" height="28" rx="2" transform="rotate(-8,6,10)" />
      <rect x="8" y="12" width="24" height="28" rx="2" transform="rotate(4,8,12)" />
      <rect x="10" y="14" width="24" height="28" rx="2" />
      <path d="M38 28c4-3 4-9 0-12s-9-3-12 0" />
    </svg>
  )
}

function PopCultureIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="6" y="12" width="36" height="24" rx="2" />
      <line x1="12" y1="18" x2="12" y2="30" />
      <line x1="18" y1="18" x2="18" y2="30" />
      <line x1="24" y1="18" x2="24" y2="30" />
      <line x1="30" y1="18" x2="30" y2="30" />
      <line x1="36" y1="18" x2="36" y2="30" />
      <path d="M36 8l1.5 3H42l-3.5 2 1 3.5-3.5-2-3.5 2 1-3.5-3.5-2h4.5z" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function TournamentIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <line x1="6" y1="6" x2="24" y2="20" />
      <line x1="42" y1="6" x2="24" y2="20" />
      <line x1="24" y1="20" x2="24" y2="34" />
      <path d="M24 42v-8" />
      <path d="M18 42c0-4 6-4 6-8s-6-4-6-8" />
      <path d="M30 42c0-4-6-4-6-8s6-4 6-8" />
      <path d="M24 34l3-3h-6z" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function IdentityIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="6" y="10" width="24" height="28" rx="2" transform="rotate(-6,18,24)" />
      <rect x="14" y="10" width="24" height="28" rx="2" transform="rotate(6,26,24)" />
      <circle cx="18" cy="20" r="4" />
      <path d="M10 32c2-4 8-4 10 0" />
      <circle cx="30" cy="20" r="4" fill="currentColor" opacity="0.25" />
      <path d="M22 32c2-4 8-4 10 0" />
    </svg>
  )
}

function TrendIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M24 42c0-8-4-12-12-12" />
      <circle cx="24" cy="24" r="8" />
      <polyline points="20,28 28,20 34,26" />
      <polygon points="34,24 36,30 30,28" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function FutureIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4" />
      <path d="M24 14v6l4 3M24 28v6l-4 3" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="32" y1="16" x2="28" y2="20" />
      <line x1="16" y1="32" x2="20" y2="28" />
      <line x1="32" y1="32" x2="28" y2="28" />
      <path d="M12 12l3 3M36 12l-3 3M12 36l3-3M36 36l-3-3" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function CodeIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <polyline points="18,12 6,24 18,36" />
      <polyline points="30,12 42,24 30,36" />
      <line x1="28" y1="10" x2="20" y2="38" />
      <polygon points="24,21 27,24 24,27 21,24" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function AiIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="24" cy="24" r="6" />
      <circle cx="24" cy="8" r="2" />
      <circle cx="40" cy="16" r="2" />
      <circle cx="40" cy="32" r="2" />
      <circle cx="24" cy="40" r="2" />
      <circle cx="8" cy="32" r="2" />
      <circle cx="8" cy="16" r="2" />
      <line x1="24" y1="18" x2="24" y2="10" />
      <line x1="29" y1="20" x2="38" y2="18" />
      <line x1="29" y1="28" x2="38" y2="30" />
      <line x1="24" y1="30" x2="24" y2="38" />
      <line x1="19" y1="28" x2="10" y2="30" />
      <line x1="19" y1="20" x2="10" y2="18" />
      <circle cx="24" cy="8" r="3" fill="currentColor" opacity="0.25" />
    </svg>
  )
}

function FallbackIcon(props: IconProps) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="24" cy="24" r="18" />
      <path d="M24 12v4M24 32v4M12 24h4M32 24h4" />
    </svg>
  )
}

export const CATEGORY_ICONS: Record<string, { svg: (props: IconProps) => ReactNode; color: string }> = {
  'swipe-personality': { svg: SwipeIcon, color: '#fb923c' },
  'pop-culture-flash': { svg: PopCultureIcon, color: '#60a5fa' },
  'micro-trivia': { svg: TournamentIcon, color: '#4ade80' },
  'social-identity': { svg: IdentityIcon, color: '#c084fc' },
  'trend-vibes': { svg: TrendIcon, color: '#e5e7eb' },
  'future-you': { svg: FutureIcon, color: '#60a5fa' },
  'programming': { svg: CodeIcon, color: '#e5e7eb' },
  'ai': { svg: AiIcon, color: '#c084fc' },
}

export function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const config = CATEGORY_ICONS[slug]
  const Icon = config?.svg ?? FallbackIcon
  return <Icon className={className} aria-hidden />
}

export function CoinIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="10" fill="#f97316" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}

export function LevelIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z" fill="#fb923c" />
    </svg>
  )
}
