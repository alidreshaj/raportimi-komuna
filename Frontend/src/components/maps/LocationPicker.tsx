import { useEffect, useState } from 'react'
import { Marker, useMap, useMapEvents } from 'react-leaflet'
import type { GeoPoint } from '../../types'
import { isInsideKosovo } from '../../utils/geo'
import { DEFAULT_CENTER } from './mapDefaults'
import MapView from './MapView'
import './LocationPicker.css'

// 6 shifra pas presjes janë afërsisht 10 cm: më shumë se mjaftueshëm, dhe nuk ruajmë numra të gjatë pa nevojë.
const round = (n: number) => Math.round(n * 1e6) / 1e6

// Mesazhet kur shfletuesi nuk e jep vendndodhjen. Kodet vijnë nga GeolocationPositionError.
const GEO_ERRORS: Record<number, string> = {
  1: 'Nuk e lejove vendndodhjen. Lejoje te cilësimet e shfletuesit për këtë faqe, ose kliko në hartë.',
  2: 'Nuk u gjet vendndodhja jote. Kliko në hartë ku është problemi.',
  3: 'Kërkesa zgjati shumë. Provo përsëri ose kliko në hartë.',
}

// Dëgjon klikimet në hartë dhe e vendos pikën aty ku klikoi përdoruesi. Nuk vizaton asgjë vetë.
function ClickToPlace({ onPick }: { onPick: (point: GeoPoint) => boolean }) {
  useMapEvents({
    click(event) {
      onPick({ latitude: round(event.latlng.lat), longitude: round(event.latlng.lng) })
    },
  })
  return null
}

// Kur vjen një kërkesë e re (vetëm nga butoni i vendndodhjes), e çon hartën te ajo pikë.
// Klikimet dhe tërheqja e shenjës nuk e lëvizin hartën, kështu nuk "ikën" nga nën duart.
function FlyToRequest({ request }: { request: GeoPoint | null }) {
  const map = useMap()

  useEffect(() => {
    if (request) {
      map.flyTo([request.latitude, request.longitude], Math.max(map.getZoom(), 16))
    }
  }, [map, request])

  return null
}

interface LocationPickerProps {
  value: GeoPoint | null
  onChange: (point: GeoPoint | null) => void
}

// Zgjedhja e vendit të problemit në hartë (opsionale): kliko për të vendosur pikën, tërhiqe shenjën për ta rregulluar,
// "Përdor vendndodhjen time" për GPS-in e shfletuesit, ose "Hiq pikën" për ta fshirë.
// Teksti i vendit mbetet fusha kryesore; harta e plotëson me pikën e saktë.
function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [locating, setLocating] = useState(false)
  const [flyTo, setFlyTo] = useState<GeoPoint | null>(null)
  // Mesazh pas kërkimit të vendndodhjes: gabim, ose këshillë kur saktësia është e ulët.
  const [notice, setNotice] = useState<{ text: string; isError: boolean } | null>(null)

  // Çdo ndryshim me dorë (klikim, tërheqje, heqje) e pastron mesazhin e vjetër.
  function change(point: GeoPoint | null) {
    setNotice(null)
    onChange(point)
  }

  // Pranon vetëm pika brenda Kosovës. Jashtë saj nuk ndryshon asgjë dhe tregon një mesazh. Kthen true kur e pranoi.
  function place(point: GeoPoint): boolean {
    if (!isInsideKosovo(point.latitude, point.longitude)) {
      setNotice({ text: 'Zgjidh një vend brenda Kosovës.', isError: true })
      return false
    }
    change(point)
    return true
  }

  // Shfletuesi pyet përdoruesin për leje vetëm kur klikohet butoni, jo kur hapet faqja.
  function locateMe() {
    if (!('geolocation' in navigator)) {
      setNotice({ text: 'Ky shfletues nuk e mbështet vendndodhjen. Kliko në hartë.', isError: true })
      return
    }

    setNotice(null)
    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { latitude: round(position.coords.latitude), longitude: round(position.coords.longitude) }
        setLocating(false)

        // Kush është jashtë Kosovës (p.sh. në udhëtim) merr mesazh dhe zgjedh me dorë.
        if (!isInsideKosovo(point.latitude, point.longitude)) {
          setNotice({
            text: 'Vendndodhja jote duket jashtë Kosovës. Kliko në hartë ku është problemi.',
            isError: true,
          })
          return
        }

        onChange(point)
        setFlyTo(point)

        // Laptopët japin vetëm një vend të përafërt (disa qindra metra): e themi, që të rregullohet shenja.
        if (position.coords.accuracy > 100) {
          setNotice({
            text: `Saktësia është rreth ${Math.round(position.coords.accuracy)} m. Tërhiqe shenjën nëse duhet.`,
            isError: false,
          })
        }
      },
      (error) => {
        setNotice({ text: GEO_ERRORS[error.code] ?? 'Nuk u gjet vendndodhja. Kliko në hartë.', isError: true })
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="location-picker">
      <p className="location-picker-title">Vendndodhja në hartë (opsionale)</p>
      <p className="field-hint">Kliko në hartë ku është problemi. Shenjën mund ta tërheqësh për ta rregulluar.</p>

      <div className="location-picker-map">
        {/* Harta fillon aty ku është pika (te ndryshimi i raportit), ose te qyteti i paracaktuar. */}
        <MapView
          label="Harta për të zgjedhur vendin e problemit"
          center={value ? [value.latitude, value.longitude] : DEFAULT_CENTER}
          zoom={value ? 16 : undefined}
        >
          <ClickToPlace onPick={place} />
          <FlyToRequest request={flyTo} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const { lat, lng } = event.target.getLatLng()
                  // Nëse e lëshove jashtë Kosovës, shenja kthehet aty ku ishte.
                  if (!place({ latitude: round(lat), longitude: round(lng) })) {
                    event.target.setLatLng([value.latitude, value.longitude])
                  }
                },
              }}
            />
          )}
        </MapView>
      </div>

      {notice && (
        <p className={notice.isError ? 'form-error' : 'field-hint'} role={notice.isError ? 'alert' : 'status'}>
          {notice.text}
        </p>
      )}

      <div className="location-picker-footer">
        <span className="field-hint" role="status">
          {value ? `Pika: ${value.latitude}, ${value.longitude}` : 'Nuk ke zgjedhur asnjë pikë.'}
        </span>
        <div className="location-picker-actions">
          <button type="button" className="btn-outline" onClick={locateMe} disabled={locating}>
            {locating ? 'Duke kërkuar vendndodhjen...' : 'Përdor vendndodhjen time'}
          </button>
          {value && (
            <button type="button" className="btn-outline" onClick={() => change(null)}>
              Hiq pikën
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationPicker
