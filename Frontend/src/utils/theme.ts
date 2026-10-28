export type Theme = 'light' | 'dark'

const KEY = 'theme'

// Tema aktuale, siç e ka vendosur skripti te index.html (ose çelësi më poshtë) te <html data-theme="...">.
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// Ngjyra e shiritit të shfletuesit (telefon): njëlloj si sfondi i kartave të temës aktuale.
export function syncThemeColor(): void {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim()
  if (!color) return
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute('content', color))
}

// E vendos temën dhe e ruan zgjedhjen e përdoruesit (localStorage mund të mos jetë i lejuar, prandaj try/catch).
// Për 300 ms vendoset klasa "theme-switching", që ngjyrat të kalojnë butë në vend që të ndërrohen menjëherë.
export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  root.classList.add('theme-switching')
  root.dataset.theme = theme
  syncThemeColor()
  window.setTimeout(() => root.classList.remove('theme-switching'), 350)

  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Pa ruajtje, tema vlen vetëm për këtë faqe: nuk është gabim.
  }
}
