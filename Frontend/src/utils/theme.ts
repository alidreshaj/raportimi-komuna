export type Theme = 'light' | 'dark'

const KEY = 'theme'

// Tema aktuale, siç e ka vendosur skripti te index.html (ose çelësi më poshtë) te <html data-theme="...">.
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// E vendos temën dhe e ruan zgjedhjen e përdoruesit (localStorage mund të mos jetë i lejuar, prandaj try/catch).
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Pa ruajtje, tema vlen vetëm për këtë faqe: nuk është gabim.
  }
}
