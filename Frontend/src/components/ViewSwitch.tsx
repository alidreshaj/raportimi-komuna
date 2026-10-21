import './ViewSwitch.css'

interface ViewSwitchProps<T extends string> {
  // Teksti për lexuesit e ekranit, p.sh. "Pamja".
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

// Çelës me dy ose më shumë opsione që ndërron pamjen (Grafik / Tabelë, Listë / Hartë). Përdoret kudo ku ndërrohet pamja e njëjtave të dhëna.
function ViewSwitch<T extends string>({ label, options, value, onChange }: ViewSwitchProps<T>) {
  return (
    <div className="view-switch" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default ViewSwitch
