import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet e ndërton vetë adresën e ikonës (duke i ngjitur një rrugë të vetën para), dhe pas ndërtimit me Vite del e gabuar:
// shenja nuk shfaqet. Ia heqim atë funksion dhe i japim ne adresat e sakta, një herë, kur ngarkohet moduli.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})
