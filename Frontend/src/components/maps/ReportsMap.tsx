import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { Link } from 'react-router'
import { Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import type { ReportPin, ReportStatus } from '../../types'
import { STATUS_LABELS, formatDate, pluralize } from '../../utils/format'
import { STATUS_COLORS } from '../../utils/statusColors'
import StatusBadge from '../StatusBadge'
import MapView from './MapView'
import { statusIcon } from './statusIcon'
import './ReportsMap.css'

const STATUSES: ReportStatus[] = ['New', 'InProgress', 'Resolved', 'Rejected']

// Kur ndryshon lista e pikave (filtra të rinj), hartën e përshtat që t'i shfaqë të gjitha. Nuk e përshtat kur lëviz ti me dorë.
function FitToPoints({ points }: { points: [number, number][] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 16 })
    }
  }, [map, points])

  return null
}

// Rrethi që bashkon shenjat e afërta. Ngjyrë neutrale (blu e errët), që të mos ngatërrohet me asnjë status.
function clusterIcon(cluster: { getChildCount: () => number }): L.DivIcon {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'cluster-bubble',
    iconSize: [40, 40],
  })
}

// Harta e adminit: të gjitha raportet që kanë pikë, me shenjën në ngjyrën e statusit. Shenjat e afërta grupohen dhe ndahen kur zmadhon.
// Kliko një shenjë: del një kartë e vogël me lidhjen te detajet. Raportet pa pikë nuk shfaqen (serveri i kthen vetëm ato me pikë),
// por numri i tyre jepet nga faqja (`missing`) dhe shfaqet poshtë hartës.
function ReportsMap({ pins, missing }: { pins: ReportPin[]; missing: number }) {
  const points = useMemo(() => pins.map((p) => [p.latitude, p.longitude] as [number, number]), [pins])

  return (
    <div className="reports-map">
      <MapView label="Harta me të gjitha raportet" className="reports-map-view">
        <FitToPoints points={points} />
        <MarkerClusterGroup chunkedLoading iconCreateFunction={clusterIcon} showCoverageOnHover={false}>
          {pins.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={statusIcon(report.status)}
              title={`${report.title} (${STATUS_LABELS[report.status]})`}
            >
              <Popup>
                <div className="map-popup">
                  <div className="map-popup-top">
                    <StatusBadge status={report.status} />
                    <span className="map-popup-category">{report.categoryName}</span>
                  </div>
                  <strong className="map-popup-title">{report.title}</strong>
                  <span className="map-popup-meta">
                    {report.location} · {formatDate(report.createdAt)}
                  </span>
                  <Link viewTransition to={`/admin/raportet/${report.id}`}>Hap raportin →</Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapView>

      <div className="reports-map-footer">
        <ul className="reports-map-legend" aria-label="Legjenda e ngjyrave">
          {STATUSES.map((status) => (
            <li key={status}>
              <i style={{ background: STATUS_COLORS[status] }} />
              {STATUS_LABELS[status]}
            </li>
          ))}
        </ul>

        <p className="reports-map-count" role="status">
          {pluralize(pins.length, 'raport', 'raporte')} në hartë
          {missing > 0 && ` · ${missing} pa vendndodhje (nuk shfaqen)`}
        </p>
      </div>
    </div>
  )
}

export default ReportsMap
