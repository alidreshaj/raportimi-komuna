import { Marker } from 'react-leaflet'
import { DEFAULT_CENTER } from '../components/maps/mapDefaults'
import MapView from '../components/maps/MapView'

// FAQE PËRKOHËSHME: vetëm për të parë hartën bazë te hapi 1. Fshihet te hapi 2, kur harta futet te forma e raportit.
function MapDemoPage() {
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
      <h1 className="page-title">Prova e hartës</h1>
      <p className="page-subtitle">Një shenjë në qendër (Pejë) që të kontrollojmë që ikona del.</p>
      <MapView label="Harta e provës">
        <Marker position={DEFAULT_CENTER} />
      </MapView>
    </main>
  )
}

export default MapDemoPage
