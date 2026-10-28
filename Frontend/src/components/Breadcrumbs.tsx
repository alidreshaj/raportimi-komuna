import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import './Breadcrumbs.css'

export interface Crumb {
  label: string
  // Pa `to` = faqja aktuale (e fundit).
  to?: string
}

// Rruga e faqes ("Raportet e mia › Titulli i raportit"): njerëzit shohin ku janë dhe kthehen me një klikim.
function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Rruga e faqes">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.to ? (
              <Link viewTransition to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="breadcrumbs-current">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <ChevronRight size={15} aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
