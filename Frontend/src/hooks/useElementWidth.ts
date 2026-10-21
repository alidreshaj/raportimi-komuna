import { useEffect, useRef, useState } from 'react'

// Mat gjerësinë e një elementi dhe e përditëson kur ndryshon (p.sh. kur zvogëlohet dritarja).
// Grafiku vizatohet me gjerësinë e vërtetë, kështu teksti nuk zvogëlohet kur faqja është e ngushtë.
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // ResizeObserver e thërret funksionin menjëherë kur fillon vëzhgimin, pra edhe matja e parë vjen prej tij.
    const observer = new ResizeObserver((entries) => setWidth(Math.floor(entries[0].contentRect.width)))
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return { ref, width }
}
