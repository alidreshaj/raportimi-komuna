import { startProgress, stopProgress } from '../utils/progress'
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

// Mesazh i qartë nga trupi i gabimit (i lexuar si JSON), ose një mesazh i përgjithshëm sipas kodit.
function messageFor(status: number, data: unknown): string {
  const body = data as { message?: unknown; errors?: Record<string, unknown> } | null

  // Forma 1: { "message": "..." } (rregullat tona të biznesit)
  if (typeof body?.message === 'string') {
    return body.message
  }

  // Forma 2: ProblemDetails i validimit: { "errors": { "Fusha": ["mesazh"] } }
  if (body?.errors) {
    const first = Object.values(body.errors).flat()[0]
    if (typeof first === 'string') {
      return first
    }
  }

  switch (status) {
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

async function readErrorMessage(response: Response): Promise<string> {
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    // trupi është bosh ose nuk është JSON (p.sh. 401, 403, 404)
  }
  return messageFor(response.status, data)
}

// Pjesa e përbashkët: shton adresën dhe tokenin, dërgon kërkesën dhe hedh ApiError nëse dështon.
// Kthen përgjigjen e papërpunuar (të suksesshme), që thirrësi ta lexojë si JSON ose si blob.
async function request(path: string, options: RequestOptions): Promise<Response> {
  // Shiriti lart shfaqet vetëm nëse kërkesa zgjat (vonesa e vogël te komponenti e shmang pulsimin e kërkesave të shpejta).
  startProgress()
  try {
    return await send(path, options)
  } finally {
    stopProgress()
  }
}

async function send(path: string, options: RequestOptions): Promise<Response> {
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

  return response
}

// Thërret backend-in dhe e lexon përgjigjen si JSON.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(path, options)

  if (response.status === 204) {
    return undefined as T // përgjigje pa trup (p.sh. DELETE)
  }

  return (await response.json()) as T
}

// Thërret backend-in dhe e lexon përgjigjen si blob (bajtet e një file-i, p.sh. një foto).
// <img src> nuk dërgon dot tokenin, prandaj fotot e mbrojtura merren kështu.
export async function apiFetchBlob(path: string): Promise<Blob> {
  const response = await request(path, {})
  return response.blob()
}

// Ngarkon një formë (FormData) me progres të vërtetë. `fetch` nuk jep progres ngarkimi, prandaj përdorim XMLHttpRequest.
// onProgress merr një numër 0-100 sa herë përparon ngarkimi.
export function apiUpload<T>(path: string, body: FormData, onProgress?: (percent: number) => void): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    startProgress()
    const done = () => stopProgress()

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_URL}${path}`)

    const token = getToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      done()
      let data: unknown = null
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null
      } catch {
        // pa trup JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data as T)
        return
      }

      if (xhr.status === 401 && token) {
        clearToken()
        onUnauthorized?.()
      }
      reject(new ApiError(xhr.status, messageFor(xhr.status, data)))
    }

    xhr.onerror = () => {
      done()
      reject(new ApiError(0, 'Nuk u arrit serveri. Kontrollo që backend-i punon.'))
    }

    xhr.send(body)
  })
}
