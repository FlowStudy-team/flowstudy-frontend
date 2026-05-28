export type AuthMode = 'login' | 'register'

export interface AuthRequest {
  email: string
  password: string
  confirmPassword?: string
}

export interface AuthResponse {
  token?: string
  message?: string
}
