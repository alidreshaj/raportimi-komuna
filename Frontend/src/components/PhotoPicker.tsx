import { useEffect, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { MAX_PHOTOS, formatSize, isSameFile, validatePhoto } from '../utils/photos'
import './PhotoPicker.css'

// Parapamja e një foto-je. Adresa e përkohshme krijohet te efekti dhe çlirohet te pastrimi.
// (Kjo është pse çdo miniaturë është komponent më vete: StrictMode e ekzekuton efektin dy herë në zhvillim,
// dhe kështu çdo ekzekutim krijon adresën e vet.)
function PhotoThumb({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    // Sinkronizohemi me një burim të jashtëm (adresa e përkohshme e file-it), që duhet krijuar dhe çliruar.
    // Krijimi gjatë vizatimit (useMemo/useState) prishet nga StrictMode, prandaj këtu setState është e qëllimshme.
    const url = URL.createObjectURL(file)
    // oxlint-disable-next-line react/set-state-in-effect
    setSrc(url)
    return () => URL.revokeObjectURL(url) // liron memorien kur miniatura hiqet
  }, [file])

  return src ? (
    <img className="photo-thumb" src={src} alt={`Parapamje e ${file.name}`} />
  ) : (
    <div className="photo-thumb" />
  )
}

interface PhotoPickerProps {
  files: File[]
  onChange: (files: File[]) => void
}

// Zona për të zgjedhur foto (deri në 5). Nuk i ngarkon: vetëm mban listën e zgjedhura, e ngarkon faqja.
function PhotoPicker({ files, onChange }: PhotoPickerProps) {
  const [problems, setProblems] = useState<string[]>([])
  const full = files.length >= MAX_PHOTOS

  // Zona ndriçohet kur tërheq file mbi të.
  const [dragging, setDragging] = useState(false)

  function handlePick(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? [])
    // Pastrojmë input-in, që të mund ta zgjedhësh të njëjtin file përsëri pasi ta heqësh.
    event.target.value = ''
    addFiles(picked)
  }

  // Foto të lëshuara mbi zonë (tërhequr nga Finder). Të njëjtat rregulla si zgjedhja me buton.
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (!full) addFiles(Array.from(event.dataTransfer.files))
  }

  function addFiles(picked: File[]) {
    const accepted: File[] = []
    const messages: string[] = []

    for (const file of picked) {
      const problem = validatePhoto(file)
      if (problem) {
        messages.push(problem)
        continue
      }

      // E kemi zgjedhur tashmë: e anashkalojmë pa bujë.
      if ([...files, ...accepted].some((existing) => isSameFile(existing, file))) {
        continue
      }

      if (files.length + accepted.length >= MAX_PHOTOS) {
        messages.push(`Mund të shtosh deri në ${MAX_PHOTOS} foto.`)
        break
      }

      accepted.push(file)
    }

    setProblems(messages)
    if (accepted.length > 0) {
      onChange([...files, ...accepted])
    }
  }

  function handleRemove(file: File) {
    setProblems([])
    onChange(files.filter((f) => f !== file))
  }

  return (
    <div className="photo-picker">
      <span className="photo-picker-title">Fotot (opsionale)</span>

      <div
        className={`photo-picker-zone${dragging ? ' photo-picker-zone--active' : ''}`}
        onDragEnter={(e) => {
          e.preventDefault()
          if (!full) setDragging(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          // Mos e fik ndriçimin kur kalon mbi elementet brenda zonës.
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false)
        }}
        onDrop={handleDrop}
      >
        <UploadCloud size={36} strokeWidth={1.6} className="photo-picker-icon" aria-hidden="true" />
        <span className="photo-picker-drop" aria-live="polite">
          {dragging ? 'Lëshoji këtu' : 'Tërhiqi fotot këtu, ose'}
        </span>

        <input
          id="photos"
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="visually-hidden"
          disabled={full}
          onChange={handlePick}
        />
        <label htmlFor="photos" className={`btn btn-secondary${full ? ' is-disabled' : ''}`}>
          Zgjidh foto
        </label>

        <span className="field-hint">JPG ose PNG, maksimumi 5 MB secila, deri në {MAX_PHOTOS} foto.</span>
      </div>

      {problems.length > 0 && (
        <div className="form-error" role="alert">
          {problems.map((message) => (
            <p key={message} className="photo-problem">
              {message}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <>
          <span className="field-hint">
            {files.length}/{MAX_PHOTOS} foto të zgjedhura
          </span>
          <ul className="photo-list">
            {files.map((file) => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`} className="photo-item">
                <PhotoThumb file={file} />
                <div className="photo-item-info">
                  <span className="photo-item-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="photo-item-footer">
                    <span>{formatSize(file.size)}</span>
                    <button
                      type="button"
                      className="photo-remove"
                      aria-label={`Hiq ${file.name}`}
                      onClick={() => handleRemove(file)}
                    >
                      Hiq
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default PhotoPicker
