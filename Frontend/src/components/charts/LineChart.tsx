import { useState } from 'react'
import type { PointerEvent } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { pluralize } from '../../utils/format'
import ChartTooltip from './ChartTooltip'
import type { TooltipState } from './ChartTooltip'
import './LineChart.css'

export interface LinePoint {
  // Shkurtimi te boshti ("tet") dhe emri i plotë te kutia ("tetor 2026").
  label: string
  fullLabel: string
  value: number
}

const HEIGHT = 260
const MARGIN = { top: 32, right: 28, bottom: 34, left: 40 }

// Kufiri i sipërm dhe hapi i vijave të rrjetës me numra të rrumbullakët (0, 10, 20... ose 0, 5, 10...).
function niceScale(max: number): { yMax: number; step: number } {
  if (max <= 0) return { yMax: 4, step: 1 }
  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const fraction = rough / magnitude
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude
  return { yMax: Math.ceil(max / step) * step, step }
}

// Vijë e lëmuar që kalon nëpër çdo pikë pa dalë kurrë mbi ose nën to (nuk zbret nën 0 mes dy muajve me 0 raporte).
function smoothPath(points: { x: number; y: number }[]): string {
  const n = points.length
  if (n === 0) return ''
  if (n === 1) return `M${points[0].x},${points[0].y}`

  const dx: number[] = []
  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1].x - points[i].x)
    slope.push((points[i + 1].y - points[i].y) / dx[i])
  }

  const tangent: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2)
  }
  tangent.push(slope[n - 2])

  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const size = a * a + b * b
    if (size > 9) {
      const k = 3 / Math.sqrt(size)
      tangent[i] = k * a * slope[i]
      tangent[i + 1] = k * b * slope[i]
    }
  }

  let d = `M${points[0].x},${points[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i]
    d += ` C${points[i].x + h / 3},${points[i].y + (tangent[i] * h) / 3} ${points[i + 1].x - h / 3},${points[i + 1].y - (tangent[i + 1] * h) / 3} ${points[i + 1].x},${points[i + 1].y}`
  }
  return d
}

// Vija e raporteve sipas muajit. Vizatohet me gjerësinë e vërtetë të kartës. Kur kalon mausin shfaqet një vijë
// vertikale që "kap" muajin më të afërt dhe një kuti me numrin. Vlera e fundit shkruhet mbi pikën e fundit.
function LineChart({ points, ariaLabel }: { points: LinePoint[]; ariaLabel: string }) {
  const { ref, width } = useElementWidth<HTMLDivElement>()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [tip, setTip] = useState<TooltipState | null>(null)

  const n = points.length
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 0)
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
  const baseY = MARGIN.top + plotHeight
  const { yMax, step } = niceScale(Math.max(...points.map((p) => p.value), 0))

  const xAt = (i: number) => MARGIN.left + (n > 1 ? (i * plotWidth) / (n - 1) : plotWidth / 2)
  const yAt = (value: number) => baseY - (value / yMax) * plotHeight

  const coords = points.map((p, i) => ({ x: xAt(i), y: yAt(p.value) }))
  const linePath = smoothPath(coords)
  const areaPath = coords.length > 1 ? `${linePath} L${coords[n - 1].x},${baseY} L${coords[0].x},${baseY} Z` : ''

  const ticks: number[] = []
  for (let v = 0; v <= yMax; v += step) ticks.push(v)

  function handlePointer(event: PointerEvent<SVGRectElement>) {
    if (n === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const raw = n > 1 ? Math.round(((event.clientX - rect.left - MARGIN.left) / plotWidth) * (n - 1)) : 0
    const index = Math.min(Math.max(raw, 0), n - 1)
    const point = points[index]

    setActiveIndex(index)
    setTip({
      x: rect.left + xAt(index),
      y: rect.top + yAt(point.value),
      title: point.fullLabel,
      value: pluralize(point.value, 'raport', 'raporte'),
      color: 'var(--accent)',
    })
  }

  function clear() {
    setActiveIndex(null)
    setTip(null)
  }

  const last = n - 1

  return (
    <div ref={ref} className="line-chart">
      {width > 0 && n > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
          {/* Rrjeta dhe numrat e boshtit anash */}
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={yAt(tick)}
                y2={yAt(tick)}
                className={tick === 0 ? 'line-axis' : 'line-grid'}
              />
              <text x={MARGIN.left - 10} y={yAt(tick) + 4} textAnchor="end" className="line-tick">
                {tick}
              </text>
            </g>
          ))}

          {points.map((p, i) => (
            <text key={p.fullLabel} x={xAt(i)} y={HEIGHT - 10} textAnchor="middle" className={`line-tick${i === last ? ' line-tick--strong' : ''}`}>
              {p.label}
            </text>
          ))}

          {areaPath && <path d={areaPath} className="line-area" />}
          <path d={linePath} pathLength={1} className="line-stroke" />

          {/* Vija vertikale që ndjek mausin */}
          {activeIndex !== null && (
            <line x1={xAt(activeIndex)} x2={xAt(activeIndex)} y1={MARGIN.top} y2={baseY} className="line-cursor" />
          )}

          {/* Vlera e fundit shkruhet mbi pikën e fundit */}
          <text x={coords[last].x} y={coords[last].y - 14} textAnchor="middle" className="line-end-value">
            {points[last].value}
          </text>
          {activeIndex !== null && activeIndex !== last && (
            <circle cx={coords[activeIndex].x} cy={coords[activeIndex].y} r={5} className="line-dot" />
          )}
          <circle cx={coords[last].x} cy={coords[last].y} r={5} className="line-dot" />

          {/* Zonë e padukshme që kap mausin (mbulon gjithë grafikun, jo vetëm vijën 2px) */}
          <rect
            x={0}
            y={0}
            width={width}
            height={HEIGHT}
            fill="transparent"
            style={{ touchAction: 'pan-y' }}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={clear}
          />
        </svg>
      )}
      <ChartTooltip tip={tip} />
    </div>
  )
}

export default LineChart
