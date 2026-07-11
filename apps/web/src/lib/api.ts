export type User = {
  id: string
  username: string
  email: string
  createdAt: string
}

export type AuthResponse = {
  accessToken: string
  user: User
}

export type ApiError = {
  statusCode: number
  message: string | string[]
  error: string
}

export class ApiRequestError extends Error {
  statusCode: number
  details: string | string[]

  constructor(statusCode: number, message: string | string[], error: string) {
    const details = Array.isArray(message) ? message.join(', ') : message
    super(details || error)
    this.name = 'ApiRequestError'
    this.statusCode = statusCode
    this.details = message
  }
}

const API_BASE_URL = '/api/v1'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
  })

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    let errorBody: ApiError | null = null

    try {
      errorBody = (await response.json()) as ApiError
    } catch {
      errorBody = null
    }

    throw new ApiRequestError(
      errorBody?.statusCode ?? response.status,
      errorBody?.message ?? 'Request failed',
      errorBody?.error ?? response.statusText,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const authApi = {
  signUp(data: { username: string; email: string; password: string }) {
    return request<AuthResponse>('/auth/sign-up', {
      method: 'POST',
      body: data,
    })
  },

  signIn(data: { email: string; password: string }) {
    return request<AuthResponse>('/auth/sign-in', {
      method: 'POST',
      body: data,
    })
  },

  getProfile(token: string) {
    return request<User>('/auth/me', { token })
  },
}
