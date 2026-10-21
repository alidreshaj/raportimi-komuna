import { Marker } from 'react-leaflet'
import MapView from './MapView'
import './ReportMap.css'

interface ReportMapProps {
  latitude: number
  longitude: number
  title: string
}

// Karta me hartën e një raporti: shenja aty ku e ka vendosur qytetari. Vetëm për shikim (nuk ndryshon asgjë).
// E përdorin detajet e qytetarit dhe ato të adminit. Raportet pa pikë nuk e shfaqin fare këtë kartë.
function ReportMap({ latitude, longitude, title }: ReportMapProps) {
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`

  return (
    <section className="detail-card report-map">
      <h2 className="detail-side-title">Vendndodhja në hartë</h2>

      <MapView
        label={`Harta me vendin e raportit "${title}"`}
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        className="report-map-view"
      >
        <Marker position={[latitude, longitude]} />
      </MapView>

      <a href={openStreetMapUrl} target="_blank" rel="noreferrer" className="report-map-link">
        Hape në OpenStreetMap
      </a>
    </section>
  )
}

export default ReportMap
