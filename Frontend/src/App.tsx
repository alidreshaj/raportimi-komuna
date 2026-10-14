import { useEffect, useState } from 'react'
import { getCategories } from './api/categories'
import type { Category } from './types'

// FAQE PROVË E PËRKOHSHME (8.3): shfaq kategoritë nga backend-i, për të provuar shtresën e API-t.
// Zëvendësohet me faqet e vërteta në 8.4.
function App() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getCategories()
      .then((list) => {
        if (!cancelled) setCategories(list)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <h1>Raportimi në komunë</h1>
      <h2>Kategoritë (nga API)</h2>

      {error && <p role="alert">Gabim: {error}</p>}
      {!error && !categories && <p>Po ngarkohet...</p>}
      {categories && (
        <ul>
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
