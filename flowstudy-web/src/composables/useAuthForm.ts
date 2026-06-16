import { computed, reactive, ref } from 'vue'
import { login, register } from '../api/modules/auth'
import { ApiError } from '../api/request'
import { useAuthStore } from '../store/modules/auth'
import type { AuthMode } from '../types/auth'

interface AuthForm {
  account: string
  username: string
  email: string
  nickname: string
  password: string
  confirmPassword: string
}

type FieldErrors = Record<keyof AuthForm, string>

function getDefaultForm(): AuthForm {
  return {
    account: '',
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  }
}

function getDefaultFieldErrors(): FieldErrors {
  return {
    account: '',
    username: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  }
}

export function useAuthForm(mode: AuthMode) {
  const authStore = useAuthStore()
  const loading = ref(false)
  const error = ref('')
  const traceId = ref('')
  const successMessage = ref('')
  const form = reactive<AuthForm>(getDefaultForm())
  const fieldErrors = reactive<FieldErrors>(getDefaultFieldErrors())

  const modeLabel = computed(() => (mode === 'login' ? 'Welcome Back' : 'Create Account'))
  const submitText = computed(() => (mode === 'login' ? 'Login' : 'Register'))
  const switchText = computed(() =>
    mode === 'login' ? 'No account yet? Register now' : 'Already have an account? Sign in',
  )

  function resetFeedback() {
    error.value = ''
    traceId.value = ''
    successMessage.value = ''
  }

  function resetFieldErrors() {
    Object.assign(fieldErrors, getDefaultFieldErrors())
  }

  function validateLogin() {
    let isValid = true
    if (!form.account.trim()) {
      fieldErrors.account = 'Username or email is required.'
      isValid = false
    }
    return isValid
  }

  function validateRegister() {
    let isValid = true
    const usernameRule = /^[A-Za-z0-9_]{3,64}$/
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!usernameRule.test(form.username.trim())) {
      fieldErrors.username = 'Use 3-64 letters, numbers, or underscores.'
      isValid = false
    }
    if (form.email.trim() && !emailRule.test(form.email.trim())) {
      fieldErrors.email = 'Email format is invalid.'
      isValid = false
    }
    if (form.nickname.trim().length > 64) {
      fieldErrors.nickname = 'Nickname cannot exceed 64 characters.'
      isValid = false
    }
    if (form.confirmPassword !== form.password) {
      fieldErrors.confirmPassword = 'Passwords do not match.'
      isValid = false
    }
    return isValid
  }

  function validate() {
    resetFieldErrors()
    let isValid = mode === 'login' ? validateLogin() : validateRegister()
    if (form.password.length < 8 || form.password.length > 72) {
      fieldErrors.password = 'Password length must be between 8 and 72 characters.'
      isValid = false
    }
    if (mode === 'register' && !form.confirmPassword) {
      fieldErrors.confirmPassword = 'Please confirm your password.'
      isValid = false
    }
    return isValid
  }

  async function submit() {
    resetFeedback()
    if (!validate()) return

    loading.value = true
    try {
      if (mode === 'login') {
        const response = await login({
          account: form.account.trim(),
          password: form.password,
        })
        authStore.setLogin(response)
        successMessage.value = 'Login successful.'
      } else {
        await register({
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          nickname: form.nickname.trim() || undefined,
          password: form.password,
        })
        successMessage.value = 'Registration successful. Please sign in.'
        Object.assign(form, getDefaultForm())
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Request failed. Please retry.'
      traceId.value = err instanceof ApiError ? err.traceId : ''
    } finally {
      loading.value = false
    }
  }

  return {
    modeLabel,
    submitText,
    switchText,
    form,
    loading,
    error,
    traceId,
    successMessage,
    fieldErrors,
    submit,
  }
}
