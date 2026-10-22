import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, currentTheme } from '../utils/theme'
import './ThemeToggle.css'

// Butoni që ndërron mes temës së çelët dhe asaj të errët. Ikona tregon çfarë do të marrësh, jo çfarë ke tani.
function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme)
  const next = theme === 'dark' ? 'light' : 'dark'

  function toggle() {
    applyTheme(next)
    setTheme(next)
  }

  const label = next === 'dark' ? 'Kalo te tema e errët' : 'Kalo te tema e çelët'

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
      {next === 'dark' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  )
}

export default ThemeToggle
