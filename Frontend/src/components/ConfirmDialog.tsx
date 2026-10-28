import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import './ConfirmDialog.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  busyLabel: string
  busy?: boolean
  error?: string | null
  // Përmbajtje shtesë mes mesazhit dhe butonave (p.sh. një fushë teksti).
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}

// Dritare konfirmimi para një veprimi të pakthyeshëm (p.sh. fshirja). Përdor elementin e integruar <dialog>:
// shfaqet mbi gjithçka, e mban fokusin e tastierës brenda saj, dhe mbyllet me Esc.
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busyLabel,
  busy = false,
  error = null,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Sinkronizon gjendjen "open" me <dialog>-un e shfletuesit (që ka metodat e veta showModal/close).
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      delete dialog.dataset.closing
      dialog.showModal() // fokusi shkon te butoni i parë: "Anulo" (kështu një Enter aksidental nuk fshin)
      return
    }

    if (!open && dialog.open) {
      // Mbyllja luan një animacion të shkurtër (data-closing) para se dialogu të mbyllet vërtet.
      dialog.dataset.closing = 'true'
      const timer = window.setTimeout(() => {
        dialog.close()
        delete dialog.dataset.closing
      }, 150)
      return () => window.clearTimeout(timer)
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="confirm-title"
      // Esc: e shndërrojmë në anulim të vetin (përveç gjatë veprimit).
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      // Klikimi te sfondi i errët (vetë <dialog>, jo përmbajtja brenda) e mbyll.
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel()
      }}
    >
      <div className="confirm-body">
        <h2 id="confirm-title" className="confirm-title">
          {title}
        </h2>
        <p className="confirm-message">{message}</p>

        {children}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="confirm-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            Anulo
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default ConfirmDialog
