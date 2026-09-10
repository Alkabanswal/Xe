import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { ApiError, createAlert, deleteAlert, getAlerts, getRates } from './api'

function jsonResponse(body: unknown, init: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
    ...init,
  } as Response
}

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('happy paths', () => {
  test('getRates hits /api/rates and returns the parsed body', async () => {
    const rates = [{ pair: 'USD/CAD', rate: 1.36, asOf: 'now' }]
    fetchMock.mockResolvedValue(jsonResponse(rates))

    await expect(getRates()).resolves.toEqual(rates)
    expect(fetchMock).toHaveBeenCalledWith('/api/rates', expect.objectContaining({}))
  })

  test('getAlerts hits /api/alerts', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]))
    await getAlerts()
    expect(fetchMock.mock.calls[0][0]).toBe('/api/alerts')
  })

  test('createAlert POSTs a JSON body with the content-type header', async () => {
    const input = { pair: 'USD/CAD', threshold: 1.3, direction: 'above' as const }
    fetchMock.mockResolvedValue(jsonResponse({ id: '1', ...input, currentRate: 1.36, triggered: true }))

    await createAlert(input)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/alerts')
    expect(init.method).toBe('POST')
    expect(init.body).toBe(JSON.stringify(input))
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' })
  })

  test('deleteAlert issues a DELETE and tolerates a 204 with no body', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(undefined, {
        status: 204,
        json: () => Promise.reject(new Error('no body')),
      }),
    )

    await expect(deleteAlert('abc')).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledWith('/api/alerts/abc', expect.objectContaining({ method: 'DELETE' }))
  })
})

describe('error handling', () => {
  test('surfaces the server-supplied error message and status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Direction must be 'above' or 'below'." }),
    } as Response)

    await expect(createAlert({ pair: 'USD/CAD', threshold: 1, direction: 'above' })).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: "Direction must be 'above' or 'below'.",
    })
  })

  test('falls back to a generic message when the body has no error field', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('not json')),
    } as Response)

    await expect(getAlerts()).rejects.toThrow('Request failed (500).')
  })

  test('wraps a network failure as an ApiError with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await getRates().catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
  })
})
