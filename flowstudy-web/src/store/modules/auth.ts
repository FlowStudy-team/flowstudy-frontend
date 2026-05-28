import { defineStore } from 'pinia'

interface AuthState {
  token: string
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('flowstudy_token') ?? '',
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string) {
      this.token = token
      localStorage.setItem('flowstudy_token', token)
    },
    clearToken() {
      this.token = ''
      localStorage.removeItem('flowstudy_token')
    },
  },
})
