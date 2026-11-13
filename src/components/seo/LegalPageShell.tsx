import type { ReactNode } from 'react'
import { UnifiedNavigation } from '@/components/navigation'

export function LegalPageShell({
  title,
  children,
}: {
  title: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <UnifiedNavigation mode="simple" />
      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <article className="glass-effect p-8 rounded-2xl">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">{title}</h1>
          <div className="space-y-6 text-blue-100 leading-relaxed">{children}</div>
        </article>
      </main>
    </div>
  )
}
