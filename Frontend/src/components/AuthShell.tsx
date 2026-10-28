import type { ReactNode } from 'react'
import KosovoArt from './KosovoArt'
import ThemeToggle from './ThemeToggle'
import './AuthShell.css'

// Faqja e përbashkët e hyrjes dhe e regjistrimit: paneli blu majtas dhe vendi i kartës djathtas.
// Karta (forma) vendoset si "children".
function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main id="main" className="auth">
      <section className="auth-brand">
        {/* Stoli: silueta e Kosovës me pika në qytetet kryesore */}
        <div className="auth-art">
          <KosovoArt />
        </div>

        <div className="auth-logo">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 21h18" />
            <path d="M5 21V10l7-5 7 5v11" />
            <path d="M9 21v-6h6v6" />
          </svg>
          <span>Raportimi në komunë</span>
        </div>

        <div className="auth-pitch">
          <h1>Raporto një problem. Ndiq çfarë ndodh me të.</h1>
          <p>
            Gropa në rrugë, drita të prishura, mbeturina: dërgo raportin nga shtëpia dhe ndiq
            përgjigjen e komunës.
          </p>
        </div>

        <ol className="auth-steps">
          <li>
            <span className="auth-step-number" aria-hidden="true">
              1
            </span>
            Përshkruaj problemin dhe shto foto
          </li>
          <li>
            <span className="auth-step-number" aria-hidden="true">
              2
            </span>
            Komuna e shqyrton dhe e merr në trajtim
          </li>
          <li>
            <span className="auth-step-number" aria-hidden="true">
              3
            </span>
            Merr përgjigje dhe shiko kur zgjidhet
          </li>
        </ol>
      </section>

      <div className="auth-form-side">
        <div className="auth-theme">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </main>
  )
}

export default AuthShell
