import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// client.ts lexon adresën e API-t kur ngarkohet, prandaj e ngarkojmë pasi vendosim mjedisin e provës.
async function loadClient() {
  vi.resetModules()
  vi.stubEnv('VITE_API_URL', 'http://api.test')
  const client = await import('./client')
  const token = await import('./token')
  return { ...client, ...token }
}

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('apiFetch', () => {
  const store = new Map<string, string>()

  beforeEach(() => {
    store.clear()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    })
    vi.stubGlobal('window', { setTimeout, clearTimeout })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('dërgon tokenin dhe kthen JSON-in', async () => {
    const { apiFetch, saveToken } = await loadClient()
    saveToken('abc')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 1 }))
    vi.stubGlobal('fetch', fetchMock)

    const data = await apiFetch<{ id: number }>('/api/reports/1')

    expect(data).toEqual({ id: 1 })
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/api/reports/1', expect.objectContaining({ method: 'GET' }))
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer abc')
  })

  it('dërgon trupin si JSON me Content-Type', async () => {
    const { apiFetch } = await loadClient()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}))
    vi.stubGlobal('fetch', fetchMock)

    await apiFetch('/api/x', { method: 'POST', body: { a: 1 } })

    const init = fetchMock.mock.calls[0][1]
    expect(init.body).toBe('{"a":1}')
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('kthen undefined për 204', async () => {
    const { apiFetch } = await loadClient()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))

    expect(await apiFetch('/api/x', { method: 'DELETE' })).toBeUndefined()
  })

  it('përdor mesazhin e serverit kur ka', async () => {
    const { apiFetch } = await loadClient()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(409, { message: 'Raporti nuk ndryshohet.' })))

    await expect(apiFetch('/api/x')).rejects.toMatchObject({ status: 409, message: 'Raporti nuk ndryshohet.' })
  })

  it('merr mesazhin e parë të validimit', async () => {
    const { apiFetch } = await loadClient()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(400, { errors: { Title: ['Shkruaj titullin.'] } })))

    await expect(apiFetch('/api/x')).rejects.toMatchObject({ status: 400, message: 'Shkruaj titullin.' })
  })

  it('jep mesazh në shqip sipas kodit kur trupi është bosh', async () => {
    const { apiFetch } = await loadClient()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })))

    await expect(apiFetch('/api/x')).rejects.toMatchObject({ status: 429, message: expect.stringContaining('Shumë përpjekje') })
  })

  it('kthen ApiError me status 0 kur serveri nuk arrihet', async () => {
    const { apiFetch } = await loadClient()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(apiFetch('/api/x')).rejects.toMatchObject({ status: 0, message: expect.stringContaining('backend-i') })
  })

  it('te 401 me token: pastron tokenin dhe njofton aplikacionin', async () => {
    const { apiFetch, saveToken, getToken, setUnauthorizedHandler } = await loadClient()
    saveToken('abc')
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 401 })))

    await expect(apiFetch('/api/reports/my')).rejects.toMatchObject({ status: 401 })

    expect(getToken()).toBeNull()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('te 401 pa token (hyrje e gabuar): nuk mbyll sesion', async () => {
    const { apiFetch, setUnauthorizedHandler } = await loadClient()
    const handler = vi.fn()
    setUnauthorizedHandler(handler)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Email ose fjalëkalim i gabuar.' })))

    await expect(apiFetch('/api/auth/login', { method: 'POST', body: {} })).rejects.toMatchObject({
      message: 'Email ose fjalëkalim i gabuar.',
    })
    expect(handler).not.toHaveBeenCalled()
  })
})
