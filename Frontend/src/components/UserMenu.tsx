import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { ChevronDown, LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/useAuth'
import { usePopover } from '../hooks/usePopover'
import { initialsOf } from '../utils/format'
import { applyTheme, currentTheme } from '../utils/theme'
import './UserMenu.css'

// Menyja e përdoruesit (avatar → Llogaria ime, tema, dil). Tastiera: shigjetat lart/poshtë, Home, End, Esc (kthen fokusin te avatari), Tab e mbyll.
function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { phase, isOpen, close, toggle, ref } = usePopover()
  const [theme, setTheme] = useState(currentTheme)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Kur hapet, fokusi shkon te zgjedhja e parë (që tastiera të punojë menjëherë).
  useEffect(() => {
    if (phase === 'open') menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [phase])

  function items(): HTMLElement[] {
    return Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const list = items()
    const index = list.indexOf(document.activeElement as HTMLElement)

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        list[(index + 1) % list.length]?.focus()
        break
      case 'ArrowUp':
        event.preventDefault()
        list[(index - 1 + list.length) % list.length]?.focus()
        break
      case 'Home':
        event.preventDefault()
        list[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        list[list.length - 1]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        event.stopPropagation()
        close()
        triggerRef.current?.focus()
        break
      case 'Tab':
        close()
        break
    }
  }

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }

  function goToAccount() {
    close()
    navigate('/llogaria', { viewTransition: true })
  }

  function handleLogout() {
    close()
    logout()
    navigate('/login', { replace: true, viewTransition: true })
  }

  const roleLabel = user?.role === 'Admin' ? 'Administrator' : 'Qytetar'

  return (
    <div className="user-menu" ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        className="user-trigger"
        aria-haspopup="menu"
        aria-expanded={phase === 'open'}
        aria-label="Menyja e përdoruesit"
        onClick={toggle}
      >
        <span className="app-avatar" aria-hidden="true">
          {initialsOf(user?.name ?? '')}
        </span>
        <span className="app-user-text">
          <span className="app-user-name">{user?.name}</span>
          <span className="app-user-role">{roleLabel}</span>
        </span>
        <ChevronDown size={16} aria-hidden="true" className="user-chevron" />
      </button>

      {isOpen && (
        <div className="user-panel popover-panel" data-phase={phase} role="menu" aria-label="Llogaria" ref={menuRef} onKeyDown={handleKeyDown}>
          <div className="user-panel-head">
            <span className="user-panel-name">{user?.name}</span>
            <span className="user-panel-email">{user?.email}</span>
          </div>

          <button type="button" role="menuitem" className="user-item" onClick={goToAccount}>
            <UserRound size={17} aria-hidden="true" />
            Llogaria ime
          </button>

          <button type="button" role="menuitem" className="user-item" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            {theme === 'dark' ? 'Tema e çelët' : 'Tema e errët'}
          </button>

          <div className="user-sep" role="separator" />

          <button type="button" role="menuitem" className="user-item user-item--danger" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            Dil
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
