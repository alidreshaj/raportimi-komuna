import { useEffect, useState } from 'react'

// Kthen vlerën me vonesë: ndryshon vetëm pasi të ketë kaluar `delay` ms pa u ndryshuar. E përdorim te kërkimi,
// që të mos dërgojmë një kërkesë te serveri për çdo shkronjë që shkruhet.
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
