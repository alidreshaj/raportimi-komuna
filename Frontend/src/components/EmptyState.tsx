import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import './EmptyState.css'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  text: string
  // Një veprim opsional poshtë tekstit (p.sh. butoni "Dërgo raportin e parë").
  children?: ReactNode
}

// Kur nuk ka çfarë të shfaqet: një ilustrim i vogël (rreth i çelët me ikonë dhe pika dekorative), titull, tekst dhe veprim.
function EmptyState({ icon: Icon, title, text, children }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-art" aria-hidden="true">
        <Icon size={40} strokeWidth={1.7} />
      </div>
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-text">{text}</p>
      {children}
    </div>
  )
}

export default EmptyState
