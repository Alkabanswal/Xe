import type { Alert, CreateAlertInput, Rate } from './types'

/**
 * Thin wrapper around the backend API. Every call goes through `request`, which
 * normalises error handling so callers get a real Error (with the server's
 * message when it sends one) instead of a silently-rejected fetch.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, {
      headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
      ...init,
    })
  } catch (cause) {
    throw new ApiError('Could not reach the server.', 0, { cause })
  }

  if (!response.ok) {
    throw new ApiError(await errorMessage(response), response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // fall through to a generic message
  }
  return `Request failed (${response.status}).`
}

export function getRates(): Promise<Rate[]> {
  return request<Rate[]>('/rates')
}

export function getAlerts(): Promise<Alert[]> {
  return request<Alert[]>('/alerts')
}

export function createAlert(input: CreateAlertInput): Promise<Alert> {
  return request<Alert>('/alerts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteAlert(id: string): Promise<void> {
  return request<void>(`/alerts/${id}`, { method: 'DELETE' })
}
