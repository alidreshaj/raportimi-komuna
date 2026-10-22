import { Pane, Polygon } from 'react-leaflet'
import { KOSOVO_BOUNDARY } from '../../data/kosovoBoundary'
import { KOSOVO_BOUNDS } from './mapDefaults'

// Një drejtkëndësh më i madh se zona e lejuar, që mbulon gjithçka rreth Kosovës.
const [[south, west], [north, east]] = KOSOVO_BOUNDS
const MARGIN = 2
const OUTER: [number, number][] = [
  [south - MARGIN, west - MARGIN],
  [south - MARGIN, east + MARGIN],
  [north + MARGIN, east + MARGIN],
  [north + MARGIN, west - MARGIN],
]

// Errëson gjithçka jashtë Kosovës dhe vizaton kufirin e saj: Kosova duket e ndritur, fqinjët zbehen.
// Poligoni i errët ka Kosovën si "vrimë" (dy unaza: e jashtmja dhe kufiri i Kosovës).
// Shtresa është mbi pllakat por nën shenjat dhe kartat, dhe nuk kap klikime (interactive=false), kështu harta punon njësoj.
function KosovoMask() {
  return (
    <Pane name="kosovo-mask" style={{ zIndex: 250 }}>
      <Polygon
        positions={[OUTER, KOSOVO_BOUNDARY]}
        pathOptions={{ stroke: false, fillColor: '#14202e', fillOpacity: 0.42 }}
        interactive={false}
      />
      <Polygon
        positions={KOSOVO_BOUNDARY}
        pathOptions={{ color: '#1f4e79', weight: 2.5, opacity: 0.95, fill: false }}
        interactive={false}
      />
    </Pane>
  )
}

export default KosovoMask
