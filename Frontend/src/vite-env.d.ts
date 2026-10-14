/// <reference types="vite/client" />

// Variablat e ambientit që i përdorim (nga file-i .env).
interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
