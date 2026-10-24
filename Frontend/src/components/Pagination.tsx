import { ChevronLeft, ChevronRight } from 'lucide-react'
import { pluralize } from '../utils/format'
import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  totalCount: number
  onChange: (page: number) => void
}

// Faqet që shfaqen: e para, e fundit, e tanishmja dhe ato afër saj; boshllëqet shënohen me "…".
function visiblePages(page: number, totalPages: number): (number | 'gap')[] {
  const wanted = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...wanted].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b)

  const result: (number | 'gap')[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) result.push('gap')
    result.push(n)
  })
  return result
}

// Kontrolli i faqeve poshtë listës: ‹ Mbrapa, numrat e faqeve, Para ›, dhe një rresht "Faqja 2 nga 8 · 40 raporte".
// Nuk shfaqet fare kur ka vetëm një faqe.
function Pagination({ page, totalPages, totalCount, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Faqet e listës">
      <div className="pagination-buttons">
        <button type="button" className="pagination-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Faqja e mëparshme">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        {visiblePages(page, totalPages).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className="pagination-gap" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`pagination-btn${item === page ? ' pagination-btn--active' : ''}`}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Faqja ${item}`}
              onClick={() => onChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button type="button" className="pagination-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Faqja tjetër">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="pagination-info">
        Faqja {page} nga {totalPages} · {pluralize(totalCount, 'raport', 'raporte')}
      </p>
    </nav>
  )
}

export default Pagination
