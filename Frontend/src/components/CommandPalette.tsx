import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { BarChart3, ClipboardList, FileText, List, LogOut, Moon, PlusCircle, Search, Sun, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { getAllReports, getMyReports } from '../api/reports'
import { useAuth } from '../context/useAuth'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { usePopover } from '../hooks/usePopover'
import type { Report } from '../types'
import { reportPathFor } from '../utils/roles'
import { applyTheme, currentTheme } from '../utils/theme'
import StatusBadge from './StatusBadge'
import './CommandPalette.css'

interface Command {
  id: string
  label: string
  icon: LucideIcon
  run: () => void
}

// Pa shkronja të mëdha dhe pa shenja mbi shkronja ("Pejë" → "peje"), që filtrimi të gjejë edhe kur shkruan pa to.
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

// Paleta e komandave (Ctrl ose Cmd + K): shkruan dhe kërcen te çdo faqe, ndërron temën, ose gjen një raport. Shigjetat zgjedhin, Enter hap, Esc mbyll.
function CommandPalette() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { phase, isOpen, open, close, ref } = usePopover(160)

  const [query, setQuery] = useState('')
  // Tema aktuale lexohet sa herë hapet paleta, që etiketa "Kalo te tema..." të jetë e saktë.
  const [theme, setTheme] = useState(currentTheme)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Hapja nga shkurtesa e tastierës (Ctrl ose Cmd + K) ose nga butoni lart.
  function openPalette() {
    setQuery('')
    setActive(0)
    setTheme(currentTheme())
    open()
  }

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (phase === 'open') close()
        else openPalette()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // openPalette përdor vetëm funksione të qëndrueshme; rilidhim vetëm kur ndryshon faza.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, close])

  useEffect(() => {
    if (phase === 'open') inputRef.current?.focus()
  }, [phase])

  // ---- Komandat sipas rolit ----
  const commands: Command[] = useMemo(() => {
    if (!user) return []
    const go = (path: string) => () => navigate(path, { viewTransition: true })

    const list: Command[] =
      user.role === 'Admin'
        ? [
            { id: 'reports', label: 'Të gjitha raportet', icon: List, run: go('/admin/raportet') },
            { id: 'stats', label: 'Statistika', icon: BarChart3, run: go('/admin/statistika') },
          ]
        : [
            { id: 'mine', label: 'Raportet e mia', icon: ClipboardList, run: go('/raportet') },
            { id: 'new', label: 'Raporto një problem', icon: PlusCircle, run: go('/raportet/i-ri') },
          ]

    list.push(
      { id: 'account', label: 'Llogaria ime', icon: UserRound, run: go('/llogaria') },
      {
        id: 'theme',
        label: theme === 'dark' ? 'Kalo te tema e çelët' : 'Kalo te tema e errët',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
      },
      {
        id: 'logout',
        label: 'Dil nga llogaria',
        icon: LogOut,
        run: () => {
          logout()
          navigate('/login', { replace: true, viewTransition: true })
        },
      },
    )
    return list
  }, [user, navigate, logout, theme])

  // ---- Kërkimi i raporteve (nga serveri, pas një vonese të shkurtër) ----
  const debounced = useDebouncedValue(query.trim(), 250)
  const [found, setFound] = useState<{ key: string; items: Report[] } | null>(null)

  useEffect(() => {
    if (!isOpen || debounced.length < 2 || !user) return

    let cancelled = false
    const search = user.role === 'Admin' ? getAllReports : getMyReports

    search({ search: debounced, pageSize: 5 })
      .then((page) => {
        if (!cancelled) setFound({ key: debounced, items: page.items })
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [debounced, isOpen, user])

  const reports = debounced.length >= 2 && found?.key === debounced ? found.items : []
  const folded = fold(query.trim())
  const visibleCommands = commands.filter((c) => !folded || fold(c.label).includes(folded))

  // Një listë e vetme për zgjedhjen me tastierë: komandat, pastaj raportet.
  const total = visibleCommands.length + reports.length

  function runAt(index: number) {
    if (index < visibleCommands.length) {
      visibleCommands[index].run()
    } else if (user) {
      const report = reports[index - visibleCommands.length]
      if (report) navigate(reportPathFor(user.role, report.id), { viewTransition: true })
    }
    close()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => (total ? (i + 1) % total : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => (total ? (i - 1 + total) % total : 0))
    } else if (event.key === 'Enter' && total > 0) {
      event.preventDefault()
      runAt(Math.min(active, total - 1))
    }
  }

  // Zgjedhja aktive mbahet e dukshme kur lista është e gjatë.
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, total])

  return (
    <>
      <button
        type="button"
        className="palette-trigger"
        onClick={openPalette}
        aria-label="Kërko dhe navigo (Ctrl K)"
        aria-haspopup="dialog"
        data-tooltip="Kërko dhe navigo (Ctrl K)"
        data-tooltip-pos="bottom"
      >
        <Search size={18} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="palette-overlay" data-phase={phase}>
          <div className="palette" role="dialog" aria-modal="true" aria-label="Paleta e komandave" data-phase={phase} ref={ref}>
            <div className="palette-input">
              <Search size={18} aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                placeholder="Kërko një faqe ose një raport..."
                aria-label="Kërko një faqe ose një raport"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={handleKeyDown}
              />
              <kbd>Esc</kbd>
            </div>

            <ul className="palette-list" role="listbox" ref={listRef}>
              {visibleCommands.map((command, i) => {
                const Icon = command.icon
                return (
                  <li key={command.id} role="option" aria-selected={active === i}>
                    <button type="button" className={`palette-item${active === i ? ' palette-item--active' : ''}`} onMouseMove={() => setActive(i)} onClick={() => runAt(i)}>
                      <Icon size={17} aria-hidden="true" />
                      {command.label}
                    </button>
                  </li>
                )
              })}

              {reports.length > 0 && <li className="palette-group" role="presentation">Raporte</li>}
              {reports.map((report, r) => {
                const i = visibleCommands.length + r
                return (
                  <li key={report.id} role="option" aria-selected={active === i}>
                    <button type="button" className={`palette-item${active === i ? ' palette-item--active' : ''}`} onMouseMove={() => setActive(i)} onClick={() => runAt(i)}>
                      <FileText size={17} aria-hidden="true" />
                      <span className="palette-item-title">{report.title}</span>
                      <StatusBadge status={report.status} />
                    </button>
                  </li>
                )
              })}

              {total === 0 && <li className="palette-empty">Asgjë nuk u gjet për "{query.trim()}".</li>}
            </ul>

            <div className="palette-foot">
              <span>↑↓ zgjidh</span>
              <span>Enter hap</span>
              <span>Esc mbyll</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CommandPalette
