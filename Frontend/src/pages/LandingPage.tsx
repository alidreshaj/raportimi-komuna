import { Camera, CheckCircle2, Landmark, MapPin } from 'lucide-react'
import { Link, Navigate } from 'react-router'
import KosovoArt from '../components/KosovoArt'
import Reveal from '../components/Reveal'
import ThemeToggle from '../components/ThemeToggle'
import { useAuth } from '../context/useAuth'
import { homePathFor } from '../utils/roles'
import './LandingPage.css'

const FEATURES = [
  { icon: Camera, title: 'Përshkruaj dhe shto foto', text: 'Gropa, drita të prishura, mbeturina: shkruaj çfarë po sheh dhe shto deri në 5 foto.' },
  { icon: MapPin, title: 'Shëno vendin në hartë', text: 'Zgjidh pikën e saktë në hartën e Kosovës, që komuna ta gjejë menjëherë.' },
  { icon: CheckCircle2, title: 'Ndiq çdo hap', text: 'Shiko kur raporti merret në trajtim dhe kur zgjidhet, dhe bisedo me komunën.' },
]

// Faqja e parë për vizitorët: shpjegon çfarë bën sistemi dhe të çon te hyrja ose regjistrimi.
function LandingPage() {
  const { user, loading } = useAuth()

  if (!loading && user) {
    return <Navigate to={homePathFor(user.role)} replace />
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <span className="landing-brand">
          <Landmark size={22} aria-hidden="true" />
          Raportimi në komunë
        </span>
        <div className="landing-actions">
          <ThemeToggle />
          <Link viewTransition to="/login" className="landing-link">
            Hyr
          </Link>
        </div>
      </header>

      <main id="main">
        <section className="landing-hero">
          <div className="landing-hero-text">
            <h1>Raporto një problem. Ndiq çfarë ndodh me të.</h1>
            <p>Dërgo raportin nga shtëpia dhe ndiq përgjigjen e komunës, hap pas hapi.</p>
            <div className="landing-cta">
              <Link viewTransition to="/regjistrohu" className="btn btn-light">
                Krijo llogari
              </Link>
              <Link viewTransition to="/login" className="landing-ghost">
                Kam llogari
              </Link>
            </div>
          </div>
          <div className="landing-art" aria-hidden="true">
            <KosovoArt />
          </div>
        </section>

        <section className="landing-features" aria-label="Si funksionon">
          <h2>Si funksionon</h2>
          <ol>
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 90} className="landing-card">
                  <span className="landing-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
