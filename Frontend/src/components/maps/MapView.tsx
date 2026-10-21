import type { ReactNode } from 'react'
import { LayerGroup, LayersControl, MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './leafletSetup'
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './mapDefaults'
import './MapView.css'

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  // Shenjat, ngjarjet e klikimit etj. që vendosen brenda hartës nga faqja që e përdor.
  children?: ReactNode
  // Teksti për lexuesit e ekranit.
  label: string
  // Rrota e mausit zmadhon hartën. Te faqet me scroll (detajet) e fikim, përndryshe harta e "kap" rrotën kur kalon sipër saj.
  scrollWheelZoom?: boolean
  // Klasë shtesë, që faqja ta ndryshojë lartësinë.
  className?: string
}

// Harta bazë me dy pamje që ndërrohen me çelësin lart djathtas: "Harta" (OpenStreetMap) dhe "Satelit" (foto nga lart).
// Të dyja janë pa çelës API. Atribuimi poshtë djathtas është kusht i tyre, prandaj nuk hiqet.
// Komponentët e tjerë (zgjedhja e pikës, harta e detajeve, harta e adminit) e përdorin këtë dhe shtojnë vetëm përmbajtjen e vet.
function MapView({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  children,
  label,
  scrollWheelZoom = true,
  className,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      maxZoom={18}
      scrollWheelZoom={scrollWheelZoom}
      className={className ? `map-view ${className}` : 'map-view'}
      aria-label={label}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Harta">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Satelit">
          {/* Fotografia nga lart, plus emrat e vendeve sipër, që të kuptohet ku je. */}
          <LayerGroup>
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />
          </LayerGroup>
        </LayersControl.BaseLayer>
      </LayersControl>

      {children}
    </MapContainer>
  )
}

export default MapView
