import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { ToastProvider } from './context/ToastProvider.tsx'
import { syncThemeColor } from './utils/theme'

// Ngjyra e shiritit të shfletuesit sipas temës aktuale (CSS-ja është ngarkuar deri këtu).
requestAnimationFrame(syncThemeColor)

// BrowserRouter: routing sipas adresës. AuthProvider: sesioni i përdoruesit. ToastProvider: njoftimet e vogla pas veprimeve.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
