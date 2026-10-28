import { useCallback, useEffect, useRef, useState } from 'react'
import { getUnreadCount } from '../api/notifications'

// Numri i njoftimeve të palexuara. Pyet serverin sapo hapet, çdo 30 sekonda (vetëm kur faqja është e dukshme) dhe sa herë
// kthehesh te dritarja. null = ende nuk kemi përgjigjen e parë (që nuk e njoftojmë si "të re" kur hapet aplikacioni).
// Gabimet i injorojmë në heshtje: zilja është dytësore dhe pyetja e radhës e provon përsëri.
export function useUnreadCount(intervalMs = 30_000) {
  const [count, setCount] = useState<number | null>(null)
  // Sa herë ka ardhur njoftim i ri që nga hapja (zilja e përdor për ta bërë të dridhet).
  const [bumps, setBumps] = useState(0)
  const last = useRef<number | null>(null)

  const refresh = useCallback(() => {
    getUnreadCount()
      .then((result) => {
        if (last.current !== null && result.count > last.current) setBumps((n) => n + 1)
        last.current = result.count
        setCount(result.count)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refresh()

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, intervalMs)
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh, intervalMs])

  return { count, setCount, bumps }
}
