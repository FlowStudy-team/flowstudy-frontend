<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthForm } from '../../../composables/useAuthForm'
import type { AuthMode } from '../../../types/auth'

interface Props {
  mode: AuthMode
}

const props = defineProps<Props>()
const router = useRouter()
const { modeLabel, submitText, switchText, form, loading, error, traceId, successMessage, fieldErrors, submit } =
  useAuthForm(props.mode)

function goToOtherMode() {
  router.push(props.mode === 'login' ? '/register' : '/login')
}

watch(successMessage, (message) => {
  if (!message) return
  if (props.mode === 'login') {
    router.push('/tutorials')
    return
  }
  router.push('/login')
})
</script>

<template>
  <main class="auth-page">
    <section class="ambient" aria-hidden="true">
      <div class="orb orb-sun"></div>
      <div class="orb orb-sky"></div>
      <div class="grid-mask"></div>
    </section>

    <section class="auth-card">
      <p class="eyebrow">FLOW STUDY</p>
      <h1>{{ modeLabel }}</h1>
      <p class="subtitle">Immersive, bright UI for coding-first learning workflows.</p>

      <form class="auth-form" @submit.prevent="submit">
        <template v-if="mode === 'login'">
          <label for="account">Username or Email</label>
          <input
            id="account"
            v-model="form.account"
            type="text"
            placeholder="username or name@example.com"
            autocomplete="username"
            :disabled="loading"
          />
          <p v-if="fieldErrors.account" class="field-error">{{ fieldErrors.account }}</p>
        </template>

        <template v-else>
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="letters, numbers, underscores"
            autocomplete="username"
            :disabled="loading"
          />
          <p v-if="fieldErrors.username" class="field-error">{{ fieldErrors.username }}</p>

          <label for="email">Email <span class="optional">(optional)</span></label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            autocomplete="email"
            :disabled="loading"
          />
          <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>

          <label for="nickname">Nickname <span class="optional">(optional)</span></label>
          <input
            id="nickname"
            v-model="form.nickname"
            type="text"
            placeholder="How should we call you?"
            autocomplete="nickname"
            :disabled="loading"
          />
          <p v-if="fieldErrors.nickname" class="field-error">{{ fieldErrors.nickname }}</p>
        </template>

        <label for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="At least 8 chars"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          :disabled="loading"
        />
        <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>

        <template v-if="mode === 'register'">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autocomplete="new-password"
            :disabled="loading"
          />
          <p v-if="fieldErrors.confirmPassword" class="field-error">
            {{ fieldErrors.confirmPassword }}
          </p>
        </template>

        <button type="submit" class="primary-btn" :disabled="loading">
          <span v-if="loading">Processing...</span>
          <span v-else>{{ submitText }}</span>
        </button>
      </form>

      <p v-if="loading" class="state loading">Sending request...</p>
      <p v-else-if="error" class="state error">{{ error }}</p>
      <p v-else-if="successMessage" class="state success">{{ successMessage }}</p>
      <p v-if="traceId" class="trace-id">Trace ID: {{ traceId }}</p>

      <button type="button" class="switch-btn" :disabled="loading" @click="goToOtherMode">
        {{ switchText }}
      </button>
    </section>
  </main>
</template>
