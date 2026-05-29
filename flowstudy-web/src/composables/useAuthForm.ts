import { computed, reactive, ref } from 'vue'
import { submitAuth } from '../api/modules/auth'
import { useAuthStore } from '../store/modules/auth'
import type { AuthMode } from '../types/auth'

interface AuthForm {
  email: string
  password: string
  confirmPassword: string
}

interface FieldErrors {
  email: string
  password: string
  confirmPassword: string
}

function getDefaultForm(): AuthForm {
  return {
    email: '',
    password: '',
    confirmPassword: '',
  }
}

function getDefaultFieldErrors(): FieldErrors {
  return {
    email: '',
    password: '',
    confirmPassword: '',
  }
}

export function useAuthForm(mode: AuthMode) {
  const authStore = useAuthStore()
  const loading = ref(false)
  const empty = ref(false)
  const error = ref('')
  const successMessage = ref('')
  const form = reactive<AuthForm>(getDefaultForm())
  const fieldErrors = reactive<FieldErrors>(getDefaultFieldErrors())

  const modeLabel = computed(() => (mode === 'login' ? 'Welcome Back' : 'Create Account'))
  const submitText = computed(() => (mode === 'login' ? 'Login' : 'Register'))
  const switchText = computed(() =>
    mode === 'login' ? 'No account yet? Register now' : 'Already have an account? Sign in',
  )

  function resetFeedback() {
    empty.value = false
    error.value = ''
    successMessage.value = ''
  }

  function resetFieldErrors() {
    const defaults = getDefaultFieldErrors()
    fieldErrors.email = defaults.email
    fieldErrors.password = defaults.password
    fieldErrors.confirmPassword = defaults.confirmPassword
  }

  function validate() {
    resetFieldErrors()
    let isValid = true
    const emailRule = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

    if (!form.email) {
      fieldErrors.email = 'Email is required.'
      isValid = false
    } else if (!emailRule.test(form.email)) {
      fieldErrors.email = 'Email format is invalid.'
      isValid = false
    }

    if (!form.password) {
      fieldErrors.password = 'Password is required.'
      isValid = false
    } else if (!passwordRule.test(form.password)) {
      fieldErrors.password = 'Password must be 8+ chars with letters and numbers.'
      isValid = false
    }

    if (mode === 'register') {
      if (!form.confirmPassword) {
        fieldErrors.confirmPassword = 'Please confirm your password.'
        isValid = false
      } else if (form.confirmPassword !== form.password) {
        fieldErrors.confirmPassword = 'Passwords do not match.'
        isValid = false
      }
    }

    return isValid
  }

  async function submit() {
    resetFeedback()
    if (!validate()) return

    loading.value = true
    try {
      const response = await submitAuth(mode, {
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      if (!response.token) {
        empty.value = true
        return
      }
      authStore.setAuth({
        token: response.token,
        displayName: form.email.split('@')[0] || 'Learner',
      })
      successMessage.value = response.message ?? 'Success.'
      if (mode === 'register') {
        Object.assign(form, getDefaultForm())
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Request failed. Please retry.'
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
    empty,
    error,
    successMessage,
    fieldErrors,
    submit,
  }
}

