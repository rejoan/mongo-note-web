const API_URL = (import.meta.env.VITE_API_URL || 'https://mongo-note.test/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors || {}
  }
}

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return null
  }

  let payload = null

  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}.`,
      response.status,
      payload?.errors,
    )
  }

  return payload
}

export function errorMessage(error) {
  if (!error) {
    return ''
  }

  if (error.errors) {
    const first = Object.values(error.errors).find(
      (messages) => Array.isArray(messages) && messages.length > 0,
    )

    if (first) {
      return first[0]
    }
  }

  return error.message || 'Something went wrong.'
}
