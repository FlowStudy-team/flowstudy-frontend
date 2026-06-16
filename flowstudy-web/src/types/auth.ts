export type AuthMode = 'login' | 'register'

export interface User {
  id: number
  username: string
  email: string | null
  nickname: string | null
  avatarUrl: string | null
  role: 'USER' | 'ADMIN'
}

export interface LoginRequest {
  account: string
  password: string
}

export interface RegisterRequest {
  username: string
  email?: string
  password: string
  nickname?: string
}

export interface RegisterResponse {
  userId: number
}

export interface LoginResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
  user: User
}
