import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Check } from 'lucide-react'

interface LoadingButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  // Po punon: shfaq rrotulluesin dhe e çaktivizon butonin.
  loading?: boolean
  // Teksti gjatë ngarkimit (p.sh. "Duke dërguar..."); pa të mbetet teksti normal.
  loadingLabel?: string
  // Sapo u krye me sukses: shfaq shenjën e kontrollit me një kërcim të vogël (e vendos faqja për pak çaste).
  success?: boolean
  // Ikona e zakonshme para tekstit.
  icon?: ReactNode
  children: ReactNode
}

// Buton për veprime që marrin kohë (dërgim forme, ruajtje): ka gjendje ngarkimi, suksesi dhe e bllokon klikimin e dyfishtë.
// Gabimin e shfaq vetë faqja te `.form-error`, që shkundet lehtë kur del.
function LoadingButton({
  loading = false,
  loadingLabel,
  success = false,
  icon,
  children,
  className = 'btn btn-primary',
  disabled,
  type = 'button',
  ...rest
}: LoadingButtonProps) {
  return (
    <button type={type} className={className} disabled={disabled || loading} aria-busy={loading} {...rest}>
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {loadingLabel ?? children}
        </>
      ) : (
        <>
          {success ? <Check size={18} className="btn-check" aria-hidden="true" /> : icon}
          {children}
        </>
      )}
    </button>
  )
}

export default LoadingButton
