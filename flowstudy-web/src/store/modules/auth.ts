import { defineStore } from 'pinia'
import type { LoginResponse, User } from '../../types/auth'
import { getStorageJSON, removeStorage, setStorageJSON } from '../../utils/storage'

const AUTH_STORAGE_KEY = 'flowstudy_auth'

interface StoredAuth {
  token: string
  user: User
  deviceId: string
}

interface AuthState {
  token: string
  user: User | null
  deviceId: string
}

const storedAuth = getStorageJSON<StoredAuth>(AUTH_STORAGE_KEY)

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: storedAuth?.token ?? '',
    user: storedAuth?.user ?? null,
    deviceId: storedAuth?.deviceId ?? crypto.randomUUID(),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    displayName: (state) => state.user?.nickname || state.user?.username || 'Learner',
  },
  actions: {
    setLogin(loginResponse: LoginResponse) {
      this.token = loginResponse.accessToken
      this.user = loginResponse.user
      setStorageJSON<StoredAuth>(AUTH_STORAGE_KEY, {
        token: loginResponse.accessToken,
        user: loginResponse.user,
        deviceId: this.deviceId,
      })
    },
    setUser(user: User) {
      this.user = user
      if (this.token) {
        setStorageJSON<StoredAuth>(AUTH_STORAGE_KEY, { token: this.token, user, deviceId: this.deviceId })
      }
    },
    clearAuth() {
      this.token = ''
      this.user = null
      removeStorage(AUTH_STORAGE_KEY)
    },
    clearToken() {
      this.clearAuth()
    },
    setAccessToken(token: string) {
      this.token = token
      if (this.user) {
        setStorageJSON<StoredAuth>(AUTH_STORAGE_KEY, { token, user: this.user, deviceId: this.deviceId })
      }
    },
  },
})
