import './ChartTooltip.css'

// Çfarë shfaq kutia kur kalon mausin (ose fokusin) mbi një pjesë të grafikut.
// x dhe y janë koordinata të ekranit (px), ku kutia del sipër pikës.
export interface TooltipState {
  x: number
  y: number
  title: string
  value: string
  // Ngjyra e serisë: shfaqet si vijë e shkurtër para titullit.
  color?: string
}

// Vlera është elementi i theksuar, emri vjen pas saj: lexuesi e di çfarë po shikon dhe do numrin.
// Kutia është vetëm shtesë: çdo vlerë gjendet edhe te numrat e shkruar dhe te "Tabelë".
function ChartTooltip({ tip }: { tip: TooltipState | null }) {
  if (!tip) return null

  // Mos e lër kutinë të dalë jashtë ekranit majtas ose djathtas.
  const left = Math.min(Math.max(tip.x, 100), window.innerWidth - 100)

  return (
    <div className="chart-tooltip" style={{ left, top: tip.y }} aria-hidden="true">
      <span className="chart-tooltip-value">{tip.value}</span>
      <span className="chart-tooltip-title">
        {tip.color && <i className="chart-tooltip-key" style={{ background: tip.color }} />}
        {tip.title}
      </span>
    </div>
  )
}

export default ChartTooltip
