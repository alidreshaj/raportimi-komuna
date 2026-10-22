import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CircleCheck, CircleX, Info, X } from 'lucide-react'
import { ToastContext } from './toast-context'
import type { ToastKind } from './toast-context'
import './ToastProvider.css'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

const ICONS = { success: CircleCheck, error: CircleX, info: Info }
const DURATION = { success: 4500, info: 4500, error: 7000 } // gabimet qëndrojnë më gjatë, që të lexohen

// Mban listën e njoftimeve dhe i shfaq në qoshen poshtë. Vendoset një herë, lart te aplikacioni.
// Rajoni ka aria-live, kështu lexuesit e ekranit i njoftojnë pa e lëvizur fokusin.
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const timers = useRef(new Map<number, number>())

  const dismiss = useCallback((id: number) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, kind: ToastKind = 'success') => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, message, kind }]) // maksimumi 4 njëherësh
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), DURATION[kind]),
      )
    },
    [dismiss],
  )

  // Kur aplikacioni mbyllet, pastrojmë kohëmatësit që kanë mbetur.
  useEffect(() => {
    const active = timers.current
    return () => active.forEach((timer) => window.clearTimeout(timer))
  }, [])

  const value = useMemo(() => ({ show }), [show])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-viewport" role="region" aria-label="Njoftime" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.kind]
          return (
            <div key={toast.id} className={`toast toast--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
              <Icon size={20} aria-hidden="true" />
              <span className="toast-message">{toast.message}</span>
              <button type="button" className="toast-close" onClick={() => dismiss(toast.id)} aria-label="Mbyll njoftimin">
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
