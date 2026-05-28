import type { AuthMode, AuthRequest, AuthResponse } from '../../types/auth'

export async function submitAuth(mode: AuthMode, payload: AuthRequest): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800))

  if (payload.email.includes('error')) {
    throw new Error('Server unavailable. Please try again later.')
  }

  if (payload.email.includes('empty')) {
    return {}
  }

  return {
    token: `${mode}-token-${Date.now()}`,
    message: mode === 'login' ? 'Login successful.' : 'Registration successful.',
  }
}
