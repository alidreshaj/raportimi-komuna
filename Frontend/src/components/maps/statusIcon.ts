import L from 'leaflet'
import type { ReportStatus } from '../../types'
import { STATUS_COLORS } from '../../utils/statusColors'

const cache = new Map<ReportStatus, L.DivIcon>()

// Shenja në formë pike (pin) me ngjyrën e statusit. E ndërtojmë një herë për çdo status dhe e ripërdorim, që hartat me shumë
// shenja të mos krijojnë qindra ikona të njëjta. Ngjyra vjen nga variablat CSS, kështu është njësoj si te grafikët.
export function statusIcon(status: ReportStatus): L.DivIcon {
  const cached = cache.get(status)
  if (cached) return cached

  const icon = L.divIcon({
    html: `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39C15 39 28 24.5 28 14.5C28 7 22.2 1.5 15 1.5C7.8 1.5 2 7 2 14.5C2 24.5 15 39 15 39Z" style="fill:${STATUS_COLORS[status]}" stroke="#fff" stroke-width="2.5"/><circle cx="15" cy="14.5" r="5" fill="#fff"/></svg>`,
    // className i vetë e heq katrorin e bardhë që Leaflet ia vendos çdo divIcon.
    className: 'status-pin',
    iconSize: [30, 40],
    iconAnchor: [15, 39],
    popupAnchor: [0, -34],
  })

  cache.set(status, icon)
  return icon
}
