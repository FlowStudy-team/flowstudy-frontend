import { defineStore } from 'pinia'

interface AuthState {
  token: string
  displayName: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('flowstudy_token') ?? '',
    displayName: localStorage.getItem('flowstudy_display_name') ?? '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setAuth(payload: { token: string; displayName?: string }) {
      const name = payload.displayName?.trim() || 'Learner'
      this.token = payload.token
      this.displayName = name
      localStorage.setItem('flowstudy_token', payload.token)
      localStorage.setItem('flowstudy_display_name', name)
    },
    setToken(token: string) {
      this.token = token
      localStorage.setItem('flowstudy_token', token)
    },
    clearToken() {
      this.token = ''
      this.displayName = ''
      localStorage.removeItem('flowstudy_token')
      localStorage.removeItem('flowstudy_display_name')
    },
  },
})

