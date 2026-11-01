import { useEffect } from 'react'

const BASE_TITLE = 'Raportimi në komunë'

// Vendos titullin e skedës së shfletuesit për faqen aktuale, p.sh. "Llogaria ime · Raportimi në komunë".
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · ${BASE_TITLE}`
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
