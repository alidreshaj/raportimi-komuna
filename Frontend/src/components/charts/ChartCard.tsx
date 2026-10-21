import { useState } from 'react'
import type { ReactNode } from 'react'
import ViewSwitch from '../ViewSwitch'
import './ChartCard.css'

export interface ChartTable {
  head: string[]
  rows: (string | number)[][]
}

interface ChartCardProps {
  title: string
  subtitle: string
  // Të njëjtat të dhëna si tabelë: alternativa e grafikut për këdo që nuk e lexon dot me sy ose me ngjyra.
  table: ChartTable
  children: ReactNode
}

// Karta e një grafiku: titulli, nëntitulli, dhe një çelës "Grafik / Tabelë" që ndërron mes dy pamjeve.
function ChartCard({ title, subtitle, table, children }: ChartCardProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart')

  return (
    <section className="chart-card">
      <header className="chart-card-header">
        <div>
          <h2 className="chart-card-title">{title}</h2>
          <p className="chart-card-subtitle">{subtitle}</p>
        </div>

        <ViewSwitch
          label="Pamja"
          options={[
            { value: 'chart', label: 'Grafik' },
            { value: 'table', label: 'Tabelë' },
          ]}
          value={view}
          onChange={setView}
        />
      </header>

      {view === 'chart' ? (
        children
      ) : (
        <table className="chart-table" aria-label={title}>
          <thead>
            <tr>
              {table.head.map((cell, i) => (
                <th key={cell} className={i === 0 ? undefined : 'chart-table-num'} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={String(row[0])}>
                {row.map((cell, i) => (
                  <td key={i} className={i === 0 ? undefined : 'chart-table-num'}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default ChartCard
