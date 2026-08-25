import { useAuthStore } from '../store/modules/auth'
import type { ApiResponse } from '../types/common'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'
let refreshPromise: Promise<boolean> | null = null

export class ApiError extends Error {
  readonly code: number
  readonly traceId: string
  readonly status: number

  constructor(message: string, code: number, traceId: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.traceId = traceId
    this.status = status
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  return requestInternal<T>(path, init, true)
}

async function requestInternal<T>(path: string, init: RequestInit, allowRefresh: boolean): Promise<T> {
  const authStore = useAuthStore()
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body) {
    headers.set('Content-Type', 'application/json')
  }
  if (authStore.token) {
    headers.set('Authorization', `Bearer ${authStore.token}`)
  }
  headers.set('X-Device-Id', authStore.deviceId)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  } catch {
    throw new ApiError('Cannot connect to FlowStudy Core. Confirm it is running on port 8080.', 0, '', 0)
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null
  if (!response.ok || !payload || payload.code !== 0) {
    if (response.status === 401 && allowRefresh && !path.startsWith('/auth/')) {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }
      if (await refreshPromise) return requestInternal<T>(path, init, false)
    }
    if (response.status === 401) {
      authStore.clearAuth()
    }
    throw new ApiError(
      payload?.message ?? `Request failed with HTTP ${response.status}`,
      payload?.code ?? response.status,
      payload?.traceId ?? response.headers.get('X-Trace-Id') ?? '',
      response.status,
    )
  }
  return payload.data
}

async function refreshAccessToken(): Promise<boolean> {
  const authStore = useAuthStore()
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'X-Device-Id': authStore.deviceId },
      credentials: 'include',
    })
    const payload = (await response.json().catch(() => null)) as ApiResponse<{ accessToken: string }> | null
    if (!response.ok || !payload || payload.code !== 0 || !payload.data?.accessToken) return false
    authStore.setAccessToken(payload.data.accessToken)
    return true
  } catch {
    return false
  }
}
