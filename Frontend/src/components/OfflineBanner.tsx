import { WifiOff } from 'lucide-react'
import { useOnline } from '../hooks/useOnline'
import './OfflineBanner.css'

// Shirit i vogël kur shkëputet interneti, që përdoruesi të dijë pse dështojnë kërkesat.
function OfflineBanner() {
  const online = useOnline()
  if (online) {
    return null
  }

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={16} aria-hidden="true" />
      Nuk ke lidhje me internetin. Ndryshimet nuk ruhen derisa të kthehet.
    </div>
  )
}

export default OfflineBanner
