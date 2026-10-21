import { useState } from 'react'
import { percentOf, pluralize } from '../../utils/format'
import './DonutChart.css'

export interface DonutSlice {
  key: string
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  slices: DonutSlice[]
  total: number
  // Teksti nën numrin në mes kur nuk ka asgjë të zgjedhur, p.sh. "raporte gjithsej".
  totalCaption: string
}

const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 84
const THICKNESS = 26
const GAP = 3 // boshllëku i bardhë mes pjesëve (vetë boshllëku i ndan, jo një kontur)
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// Rrethi me "vrimë" në mes: tregon si ndahet totali. Në mes shfaqet totali, dhe kur kalon mausin mbi një pjesë
// (ose mbi rreshtin e saj te legjenda) në mes shfaqet vlera e asaj pjese. Numrat shkruhen edhe te legjenda.
function DonutChart({ slices, total, totalCaption }: DonutChartProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const active = slices.find((s) => s.key === activeKey) ?? null

  // Pjesët me vlerë > 0, secila me gjatësinë e harkut dhe ku fillon.
  const arcs: { slice: DonutSlice; length: number; start: number }[] = []
  let cursor = 0
  for (const slice of slices) {
    if (slice.value <= 0) continue
    const length = (slice.value / total) * CIRCUMFERENCE
    arcs.push({ slice, length, start: cursor })
    cursor += length
  }
  const single = arcs.length === 1

  return (
    <div className="donut">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="donut-svg" role="img" aria-label={`${total} ${totalCaption}`}>
        {/* Unaza e zbehtë poshtë: shfaqet e vetme kur s'ka asnjë raport. */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" strokeWidth={THICKNESS} className="donut-track" />

        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {arcs.map(({ slice, length, start }) => {
            const dash = single ? CIRCUMFERENCE : Math.max(length - GAP, 0.5)
            const isActive = slice.key === activeKey
            return (
              <circle
                key={slice.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                style={{ stroke: slice.color }}
                strokeWidth={isActive ? THICKNESS + 6 : THICKNESS}
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={-(start + (single ? 0 : GAP / 2))}
                className={`donut-slice${activeKey && !isActive ? ' donut-slice--dim' : ''}`}
                tabIndex={0}
                aria-label={`${slice.label}: ${pluralize(slice.value, 'raport', 'raporte')}, ${percentOf(slice.value, total)}%`}
                onPointerEnter={() => setActiveKey(slice.key)}
                onPointerLeave={() => setActiveKey(null)}
                onFocus={() => setActiveKey(slice.key)}
                onBlur={() => setActiveKey(null)}
              />
            )
          })}
        </g>

        <text x={CENTER} y={CENTER + 2} textAnchor="middle" className="donut-number">
          {active ? active.value : total}
        </text>
        <text x={CENTER} y={CENTER + 26} textAnchor="middle" className="donut-caption">
          {active ? `${active.label} · ${percentOf(active.value, total)}%` : totalCaption}
        </text>
      </svg>

      <ul className="donut-legend">
        {slices.map((slice) => (
          <li
            key={slice.key}
            tabIndex={0}
            className={`donut-legend-row${slice.key === activeKey ? ' donut-legend-row--active' : ''}`}
            onPointerEnter={() => setActiveKey(slice.key)}
            onPointerLeave={() => setActiveKey(null)}
            onFocus={() => setActiveKey(slice.key)}
            onBlur={() => setActiveKey(null)}
          >
            <i className="donut-swatch" style={{ background: slice.color }} />
            <span className="donut-label">{slice.label}</span>
            <span className="donut-count">{slice.value}</span>
            <span className="donut-percent">{percentOf(slice.value, total)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DonutChart
