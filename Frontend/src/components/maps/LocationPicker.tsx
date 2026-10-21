import { Marker, useMapEvents } from 'react-leaflet'
import type { GeoPoint } from '../../types'
import { DEFAULT_CENTER } from './mapDefaults'
import MapView from './MapView'
import './LocationPicker.css'

// 6 shifra pas presjes janë afërsisht 10 cm: më shumë se mjaftueshëm, dhe nuk ruajmë numra të gjatë pa nevojë.
const round = (n: number) => Math.round(n * 1e6) / 1e6

// Dëgjon klikimet në hartë dhe e vendos pikën aty ku klikoi përdoruesi. Nuk vizaton asgjë vetë.
function ClickToPlace({ onPick }: { onPick: (point: GeoPoint) => void }) {
  useMapEvents({
    click(event) {
      onPick({ latitude: round(event.latlng.lat), longitude: round(event.latlng.lng) })
    },
  })
  return null
}

interface LocationPickerProps {
  value: GeoPoint | null
  onChange: (point: GeoPoint | null) => void
}

// Zgjedhja e vendit të problemit në hartë (opsionale): kliko për të vendosur pikën, tërhiqe shenjën për ta rregulluar,
// ose "Hiq pikën" për ta fshirë. Teksti i vendit mbetet fusha kryesore; harta e plotëson me pikën e saktë.
function LocationPicker({ value, onChange }: LocationPickerProps) {
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
          <ClickToPlace onPick={onChange} />
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const { lat, lng } = event.target.getLatLng()
                  onChange({ latitude: round(lat), longitude: round(lng) })
                },
              }}
            />
          )}
        </MapView>
      </div>

      <div className="location-picker-footer">
        <span className="field-hint" role="status">
          {value ? `Pika: ${value.latitude}, ${value.longitude}` : 'Nuk ke zgjedhur asnjë pikë.'}
        </span>
        {value && (
          <button type="button" className="btn-outline" onClick={() => onChange(null)}>
            Hiq pikën
          </button>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
