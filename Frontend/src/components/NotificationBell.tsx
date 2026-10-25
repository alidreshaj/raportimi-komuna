import { useEffect, useRef, useState } from 'react'
import { Bell, FilePlus, MessageSquare, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api/notifications'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/useToast'
import { useUnreadCount } from '../hooks/useUnreadCount'
import type { NotificationItem, NotificationType } from '../types'
import { timeAgo } from '../utils/format'
import { reportPathFor } from '../utils/roles'
import './NotificationBell.css'

const ICONS: Record<NotificationType, LucideIcon> = {
  StatusChanged: RefreshCw,
  NewComment: MessageSquare,
  NewReport: FilePlus,
}

// Zilja te menyja me numrin e njoftimeve të palexuara. Kliko dhe hapet një panel me listën; kliko një njoftim dhe të çon te raporti
// (dhe e shënon si të lexuar). Numri përditësohet vetë çdo 30 sekonda, dhe kur vjen diçka e re del një njoftim i vogël.
function NotificationBell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { count, setCount } = useUnreadCount()

  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Kur numri rritet (vjen njoftim i ri), shfaqim një njoftim të vogël. Hapja e parë e aplikacionit nuk llogaritet si "e re".
  const previous = useRef<number | null>(null)
  useEffect(() => {
    if (count === null) return
    if (previous.current !== null && count > previous.current) {
      const added = count - previous.current
      toast.show(added === 1 ? 'Ke një njoftim të ri.' : `Ke ${added} njoftime të reja.`, 'info')
    }
    previous.current = count
  }, [count, toast])

  // Kur hapet paneli, merr listën e fundit.
  useEffect(() => {
    if (!open) return

    let cancelled = false

    getNotifications(20)
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setCount(data.unreadCount)
        setError(null)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [open, setCount])

  // Paneli mbyllet me Esc ose kur klikon jashtë tij.
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [open])

  function openItem(item: NotificationItem) {
    setOpen(false)

    if (!item.isRead) {
      // E shënojmë menjëherë te ekrani; kërkesa te serveri vazhdon në sfond (nëse dështon, pyetja e radhës e korrigjon numrin).
      setItems((list) => list?.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)) ?? null)
      setCount((c) => Math.max(0, (c ?? 1) - 1))
      markNotificationRead(item.id).catch(() => {})
    }

    if (user) navigate(reportPathFor(user.role, item.reportId))
  }

  async function readAll() {
    try {
      await markAllNotificationsRead()
      setItems((list) => list?.map((n) => ({ ...n, isRead: true })) ?? null)
      setCount(0)
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Nuk u shënuan njoftimet. Provo përsëri.', 'error')
    }
  }

  const unread = count ?? 0

  return (
    <div className="notif" ref={wrapRef}>
      <button
        type="button"
        className="notif-bell"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unread > 0 ? `Njoftimet (${unread} të palexuara)` : 'Njoftimet'}
        title="Njoftimet"
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} aria-hidden="true" />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-panel" role="dialog" aria-label="Njoftimet">
          <div className="notif-head">
            <h2 className="notif-title">Njoftimet</h2>
            <button type="button" className="notif-readall" disabled={unread === 0} onClick={readAll}>
              Shëno të gjitha si të lexuara
            </button>
          </div>

          {error && (
            <p className="form-error notif-message" role="alert">
              {error}
            </p>
          )}

          {!items && !error && (
            <p className="notif-message" role="status">
              Po ngarkohen...
            </p>
          )}

          {items && items.length === 0 && (
            <div className="notif-empty">
              <Bell size={28} aria-hidden="true" />
              <p>Nuk ke njoftime ende.</p>
              <span>Do të njoftohesh kur komuna ndryshon statusin ose të përgjigjet.</span>
            </div>
          )}

          {items && items.length > 0 && (
            <ul className="notif-list">
              {items.map((item) => {
                const Icon = ICONS[item.type]
                return (
                  <li key={item.id}>
                    <button type="button" className={`notif-item${item.isRead ? '' : ' notif-item--unread'}`} onClick={() => openItem(item)}>
                      <span className="notif-icon">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="notif-body">
                        <span className="notif-text">{item.message}</span>
                        <span className="notif-time">{timeAgo(item.createdAt)}</span>
                      </span>
                      {!item.isRead && <span className="notif-dot" aria-label="I palexuar" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell
