import { useEffect, useRef, useState } from 'react'

// Kthen seen = true sapo elementi afrohet te ekrani (një herë, 200px para se të hyjë). E përdorim që fotot e kartave
// të ngarkohen vetëm kur duhen: një listë me 40 raporte nuk shkarkon 40 foto menjëherë.
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || seen) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [seen])

  return { ref, seen }
}
