import AnimatedNumber from '../AnimatedNumber'
import './StatTile.css'

interface StatTileProps {
  label: string
  value: string | number
  // Ç'shtohet pas një numri të animuar, p.sh. "%".
  suffix?: string
  // Një rresht i shkurtër poshtë numrit, p.sh. "4 nga 40".
  hint?: string
  // Ngjyra e statusit: pikë e vogël para etiketës (identiteti vjen nga pika, jo nga teksti).
  color?: string
}

// Një numër i madh me etiketë: për të vërtetat e shpejta (gjithsej, të reja...). Numri është vetë "grafiku".
function StatTile({ label, value, suffix, hint, color }: StatTileProps) {
  return (
    <div className="stat-tile">
      <span className="stat-tile-label">
        {color && <i className="stat-tile-dot" style={{ background: color }} />}
        {label}
      </span>
      <span className="stat-tile-value">{typeof value === 'number' ? <AnimatedNumber value={value} suffix={suffix} /> : value}</span>
      {hint && <span className="stat-tile-hint">{hint}</span>}
    </div>
  )
}

export default StatTile
