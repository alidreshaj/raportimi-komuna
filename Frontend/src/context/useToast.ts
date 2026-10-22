import { useContext } from 'react'
import { ToastContext } from './toast-context'
import type { ToastContextValue } from './toast-context'

// Mënyra e shkurtër për të shfaqur njoftim: const toast = useToast(); toast.show('Raporti u dërgua.')
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (value === null) {
    throw new Error('useToast duhet përdorur brenda ToastProvider.')
  }
  return value
}
