import { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { getStats } from '../api/reports'
import BarChart from '../components/charts/BarChart'
import ChartCard from '../components/charts/ChartCard'
import DonutChart from '../components/charts/DonutChart'
import LineChart from '../components/charts/LineChart'
import StatsSkeleton from '../components/charts/StatsSkeleton'
import StatTile from '../components/charts/StatTile'
import EmptyState from '../components/EmptyState'
import Reveal from '../components/Reveal'
import type { Stats, ReportStatus } from '../types'
import { MONTHS, MONTHS_SHORT, STATUS_LABELS, percentOf } from '../utils/format'
import { STATUS_COLORS } from '../utils/statusColors'
import './AdminStatsPage.css'

// Statistikat për komunën. Backend-i i numëron; këtu vetëm shfaqen. Katër gjendje: po ngarkohet, gabim, bosh, me të dhëna.
function AdminStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    getStats()
      .then((result) => {
        if (!cancelled) setStats(result)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  function retry() {
    setError(null)
    setStats(null)
    setAttempt((n) => n + 1)
  }

  return (
    <>
      <div className="stats-header">
        <h1 className="page-title">Statistika</h1>
        <p className="page-subtitle">Përmbledhje e të gjitha raporteve që kanë dërguar qytetarët.</p>
      </div>

      {!stats && !error && <StatsSkeleton />}

      {error && (
        <div className="stats-message">
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" className="btn-outline" onClick={retry}>
            Provo përsëri
          </button>
        </div>
      )}

      {stats && stats.total === 0 && (
        <EmptyState
          icon={BarChart3}
          title="Nuk ka raporte ende"
          text="Statistikat shfaqen sapo qytetarët të dërgojnë raportet e para."
        />
      )}

      {stats && stats.total > 0 && <StatsContent stats={stats} />}
    </>
  )
}

function StatsContent({ stats }: { stats: Stats }) {
  const count = (status: ReportStatus) => stats.byStatus.find((s) => s.status === status)?.count ?? 0
  const resolved = count('Resolved')

  const slices = stats.byStatus.map((s) => ({
    key: s.status,
    label: STATUS_LABELS[s.status],
    value: s.count,
    color: STATUS_COLORS[s.status],
  }))

  const bars = stats.byCategory.map((c) => ({ key: c.categoryId, label: c.categoryName, value: c.count }))

  const months = stats.byMonth.map((m) => ({
    label: MONTHS_SHORT[m.month - 1],
    fullLabel: `${MONTHS[m.month - 1]} ${m.year}`,
    value: m.count,
  }))

  return (
    <div className="stats-content">
      <div className="stats-kpis">
        <StatTile label="Raporte gjithsej" value={stats.total} />
        <StatTile label="Të reja" value={count('New')} hint="presin shqyrtim" color={STATUS_COLORS.New} />
        <StatTile label="Në trajtim" value={count('InProgress')} hint="po zgjidhen tani" color={STATUS_COLORS.InProgress} />
        <StatTile
          label="Të zgjidhura"
          value={percentOf(resolved, stats.total)}
          suffix="%"
          hint={`${resolved} nga ${stats.total}`}
          color={STATUS_COLORS.Resolved}
        />
      </div>

      <div className="stats-grid">
        <Reveal delay={0}><ChartCard
          title="Raportet sipas statusit"
          subtitle="Ku ndodhen tani të gjitha raportet"
          table={{
            head: ['Statusi', 'Raporte', 'Përqindja'],
            rows: slices.map((s) => [s.label, s.value, `${percentOf(s.value, stats.total)}%`]),
          }}
        >
          <DonutChart slices={slices} total={stats.total} totalCaption="raporte gjithsej" />
        </ChartCard></Reveal>

        <Reveal delay={80}><ChartCard
          title="Raportet sipas kategorisë"
          subtitle="Cilat probleme dërgohen më shpesh"
          table={{
            head: ['Kategoria', 'Raporte', 'Përqindja'],
            rows: bars.map((b) => [b.label, b.value, `${percentOf(b.value, stats.total)}%`]),
          }}
        >
          <BarChart items={bars} total={stats.total} />
        </ChartCard></Reveal>

        <div className="stats-wide">
          <Reveal delay={160}><ChartCard
            title="Raportet e dërguara çdo muaj"
            subtitle="6 muajt e fundit"
            table={{ head: ['Muaji', 'Raporte'], rows: months.map((m) => [m.fullLabel, m.value]) }}
          >
            <LineChart
              points={months}
              ariaLabel={`Raporte të dërguara çdo muaj: ${months.map((m) => `${m.fullLabel} ${m.value}`).join(', ')}`}
            />
          </ChartCard></Reveal>
        </div>
      </div>
    </div>
  )
}

export default AdminStatsPage
