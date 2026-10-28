import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import './ErrorBoundary.css'

interface State {
  failed: boolean
}

// Nëse një faqe prishet gjatë vizatimit, shfaq këtë mesazh në vend të një ekrani të bardhë.
// (Në React kjo mund të bëhet vetëm me klasë.)
class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <main className="error-page" role="alert">
        <span className="error-page-icon">
          <TriangleAlert size={34} aria-hidden="true" />
        </span>
        <h1>Diçka shkoi keq</h1>
        <p>Faqja nuk mundi të shfaqej. Provo ta rifreskosh.</p>
        <div className="error-page-actions">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Rifresko faqen
          </button>
          <a href="/" className="btn btn-secondary">
            Në fillim
          </a>
        </div>
      </main>
    )
  }
}

export default ErrorBoundary
