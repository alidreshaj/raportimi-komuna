import { useEffect, useState } from 'react'
import { getCategories } from '../api/categories'
import type { Category } from '../types'

// Ngarkon kategoritë. categories = null derisa po ngarkohen; error mban mesazhin nëse dështon; retry e provon përsëri.
export function useCategories() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Rritet kur thërritet retry(), që efekti të ngarkojë përsëri.
  const [attempt, setAttempt] = useState(0)

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
  }, [attempt])

  function retry() {
    setError(null)
    setAttempt((n) => n + 1)
  }

  return { categories, error, retry }
}
