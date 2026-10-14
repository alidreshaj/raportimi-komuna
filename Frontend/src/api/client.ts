import { clearToken, getToken } from './token'

const API_URL = import.meta.env.VITE_API_URL

// Gabim nga API-ja: mban kodin HTTP (401, 404, 409...) dhe mesazhin për përdoruesin.
// status = 0 do të thotë që nuk u arrit fare serveri (i fikur, rrjeti, CORS).
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Aplikacioni regjistron çfarë të bëjë kur sesioni skadon (p.sh. ridrejto te /login).
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  // Objekt (dërgohet si JSON) ose FormData (fotot, dërgohet si multipart).
  body?: unknown
}

// Mesazh i qartë nga trupi i gabimit, ose një mesazh i përgjithshëm sipas kodit.
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()

    // Forma 1: { "message": "..." } (rregullat tona të biznesit)
    if (typeof data?.message === 'string') {
      return data.message
    }

    // Forma 2: ProblemDetails i validimit: { "errors": { "Fusha": ["mesazh"] } }
    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0]
      if (typeof first === 'string') {
        return first
      }
    }
  } catch {
    // trupi është bosh ose nuk është JSON (p.sh. 401, 403, 404)
  }

  switch (response.status) {
    case 401:
      return 'Nuk je i identifikuar. Hyr përsëri.'
    case 403:
      return 'Nuk ke të drejtë për këtë veprim.'
    case 404:
      return 'Nuk u gjet.'
    default:
      return 'Ndodhi një gabim. Provo përsëri.'
  }
}

// Thërret backend-in. Shton adresën, tokenin (nëse ka), dhe e kthen përgjigjen ose hedh ApiError.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}

  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body // pa Content-Type: shfletuesi e shton vetë me kufijtë e multipart
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { method: options.method ?? 'GET', headers, body })
  } catch {
    // Serveri i fikur, pa rrjet, ose i bllokuar nga CORS.
    throw new ApiError(0, 'Nuk u arrit serveri. Kontrollo që backend-i punon.')
  }

  if (!response.ok) {
    // 401 kur KISHTE token = sesioni skadoi. (Login i gabuar nuk ka token, prandaj nuk hyn këtu.)
    if (response.status === 401 && token) {
      clearToken()
      onUnauthorized?.()
    }

    throw new ApiError(response.status, await readErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T // përgjigje pa trup (p.sh. DELETE)
  }

  return (await response.json()) as T
}
