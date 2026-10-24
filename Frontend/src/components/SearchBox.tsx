import { Search, X } from 'lucide-react'
import './SearchBox.css'

interface SearchBoxProps {
  // Lidh etiketën e dukshme (<label htmlFor>) me kutinë.
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  // Etiketa për lexuesit e ekranit (kutia nuk ka tekst të dukshëm sipër).
  label?: string
}

// Kutia e kërkimit me lupë dhe butonin "pastro" kur ka tekst.
function SearchBox({ id, value, onChange, placeholder = 'Kërko...', label = 'Kërko' }: SearchBoxProps) {
  return (
    <div className="searchbox">
      <Search size={18} aria-hidden="true" className="searchbox-icon" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="searchbox-clear" aria-label="Pastro kërkimin" onClick={() => onChange('')}>
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchBox
