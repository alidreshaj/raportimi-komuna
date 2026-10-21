import { useState } from 'react'
import type { CSSProperties } from 'react'
import { percentOf, pluralize } from '../../utils/format'
import ChartTooltip from './ChartTooltip'
import type { TooltipState } from './ChartTooltip'
import './BarChart.css'

export interface BarItem {
  key: string | number
  label: string
  value: number
}

interface BarChartProps {
  items: BarItem[]
  // Totali i të gjitha raporteve, për përqindjen te kutia e hover-it.
  total: number
}

// Shirita horizontalë: një rresht për çdo kategori, me numrin shkruar në majë të shiritit.
// Kategoritë nuk kanë renditje natyrore, prandaj të gjithë shiritat kanë të njëjtën ngjyrë (gjatësia e tregon numrin).
function BarChart({ items, total }: BarChartProps) {
  const [tip, setTip] = useState<TooltipState | null>(null)
  const max = Math.max(...items.map((i) => i.value), 1)

  function show(item: BarItem, x: number, y: number) {
    setTip({
      x,
      y,
      title: item.label,
      value: `${pluralize(item.value, 'raport', 'raporte')} · ${percentOf(item.value, total)}%`,
      color: 'var(--accent)',
    })
  }

  return (
    <>
      <ul className="bars">
        {items.map((item) => (
          <li
            key={item.key}
            className={`bar-row${item.value === 0 ? ' bar-row--empty' : ''}`}
            tabIndex={0}
            aria-label={`${item.label}: ${pluralize(item.value, 'raport', 'raporte')}, ${percentOf(item.value, total)}%`}
            onPointerMove={(e) => show(item, e.clientX, e.clientY)}
            onPointerLeave={() => setTip(null)}
            onFocus={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              show(item, rect.left + rect.width / 2, rect.top)
            }}
            onBlur={() => setTip(null)}
          >
            <span className="bar-label">{item.label}</span>
            <span className="bar-track" style={{ '--pct': item.value / max } as CSSProperties}>
              <span className="bar-fill" style={{ minWidth: item.value > 0 ? 4 : 0 }} />
              <span className="bar-value">{item.value}</span>
            </span>
          </li>
        ))}
      </ul>
      <ChartTooltip tip={tip} />
    </>
  )
}

export default BarChart
