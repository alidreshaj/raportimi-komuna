import type { ReactNode } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './leafletSetup'
import KosovoMask from './KosovoMask'
import { DEFAULT_CENTER, DEFAULT_ZOOM, KOSOVO_BOUNDS, MIN_ZOOM } from './mapDefaults'
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

// Harta bazë: vetëm pamja satelitore (foto nga lart, Esri, pa çelës API). Atribuimi poshtë djathtas është kusht i tyre, prandaj nuk hiqet.
// (Stilin e zakonshëm CARTO e hoqëm: kërkon çelës API dhe kthen pllakën "API KEY REQUIRED".)
// Harta është e kufizuar te Kosova: nuk lëviz dhe nuk zmadhohet mbrapsht përtej saj, dhe gjithçka jashtë kufirit të saj është e errësuar.
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
      minZoom={MIN_ZOOM}
      maxZoom={18}
      maxBounds={KOSOVO_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={scrollWheelZoom}
      className={className ? `map-view ${className}` : 'map-view'}
      aria-label={label}
    >
      {/* Fotografia nga lart (Esri) dhe emrat e vendeve sipër, që të kuptohet ku je. */}
      <TileLayer
        attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

      {/* Errësimi jashtë Kosovës dhe vija e kufirit (te të gjitha hartat) */}
      <KosovoMask />

      {children}
    </MapContainer>
  )
}

export default MapView
