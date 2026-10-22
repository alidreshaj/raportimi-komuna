import { KOSOVO_BOUNDARY } from '../data/kosovoBoundary'
import './KosovoArt.css'

// Qytetet kryesore ku shfaqen pikat e shkëlqyera, me një ngjyrë të çelët të secilës (njësoj si ngjyrat e statuseve).
const CITIES: { lat: number; lng: number; color: string }[] = [
  { lat: 42.6593, lng: 20.2887, color: '#f0c675' }, // Pejë
  { lat: 42.6629, lng: 21.1655, color: '#8fc2f5' }, // Prishtinë
  { lat: 42.2139, lng: 20.7397, color: '#7fd8a8' }, // Prizren
  { lat: 42.3803, lng: 20.4308, color: '#8fc2f5' }, // Gjakovë
  { lat: 42.8914, lng: 20.866, color: '#ff9b9b' }, // Mitrovicë
  { lat: 42.4635, lng: 21.4694, color: '#7fd8a8' }, // Gjilan
  { lat: 42.3702, lng: 21.1483, color: '#f0c675' }, // Ferizaj
]

// Kthen gjerësinë/gjatësinë gjeografike në pika të vizatimit. Gjatësia shkurtohet me cos(gjerësia), që forma të mos zgjatet.
const lats = KOSOVO_BOUNDARY.map(([lat]) => lat)
const lngs = KOSOVO_BOUNDARY.map(([, lng]) => lng)
const MIN_LNG = Math.min(...lngs)
const MAX_LAT = Math.max(...lats)
const SCALE = 100
const COS = Math.cos((((Math.min(...lats) + MAX_LAT) / 2) * Math.PI) / 180)

const project = (lat: number, lng: number): [number, number] => [(lng - MIN_LNG) * COS * SCALE, (MAX_LAT - lat) * SCALE]

const WIDTH = (Math.max(...lngs) - MIN_LNG) * COS * SCALE
const HEIGHT = (MAX_LAT - Math.min(...lats)) * SCALE
const OUTLINE = KOSOVO_BOUNDARY.map(([lat, lng], i) => `${i === 0 ? 'M' : 'L'}${project(lat, lng).map((n) => n.toFixed(1)).join(',')}`).join(' ') + ' Z'

// Silueta e Kosovës me pika të shkëlqyera në qytetet kryesore: stoli për panelin e hyrjes (nuk ka të dhëna të vërteta).
function KosovoArt() {
  return (
    <svg className="kosovo-art" viewBox={`-6 -6 ${WIDTH + 12} ${HEIGHT + 12}`} aria-hidden="true" focusable="false">
      <path d={OUTLINE} className="kosovo-art-shape" />
      {CITIES.map((city, i) => {
        const [x, y] = project(city.lat, city.lng)
        return (
          <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <circle r="4" className="kosovo-art-pulse" style={{ fill: city.color, animationDelay: `${i * 0.45}s` }} />
            <circle r="2.6" className="kosovo-art-dot" style={{ fill: city.color }} />
          </g>
        )
      })}
    </svg>
  )
}

export default KosovoArt
