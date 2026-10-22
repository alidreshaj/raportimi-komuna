import { createContext } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

// Çfarë ofron konteksti i njoftimeve te çdo komponent poshtë ToastProvider.
export interface ToastContextValue {
  // Shfaq një njoftim të vogël që zhduket vetë. Gabimet qëndrojnë pak më gjatë.
  show: (message: string, kind?: ToastKind) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
