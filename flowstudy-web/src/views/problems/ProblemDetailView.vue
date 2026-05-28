<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { fetchProblemDetail, submitSolution } from '../../api/modules/problems'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import type { ProblemDetail, SubmissionDetail } from '../../types/problem'

const route = useRoute()
const problemId = computed(() => String(route.params.problemId))
const loading = ref(false)
const submitting = ref(false)
const error = ref('')
const detail = ref<ProblemDetail | null>(null)
const language = ref('TypeScript')
const code = ref('')
const result = ref<SubmissionDetail | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchProblemDetail(problemId.value)
    language.value = detail.value.languages[0]
    code.value = detail.value.starterCode[language.value]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Load failed.'
  } finally {
    loading.value = false
  }
}

function onLanguageChange() {
  if (!detail.value) return
  code.value = detail.value.starterCode[language.value]
}

async function submit() {
  if (!detail.value) return
  submitting.value = true
  result.value = null
  try {
    result.value = await submitSolution({ problemId: detail.value.id, language: language.value, code: code.value })
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section>
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <template v-else-if="detail">
      <h2>{{ detail.title }}</h2>
      <div class="card">
        <p>{{ detail.description }}</p>
        <p><strong>Input:</strong> {{ detail.inputDesc }}</p>
        <p><strong>Output:</strong> {{ detail.outputDesc }}</p>
      </div>
      <div class="card">
        <h3>Editor</h3>
        <div class="toolbar">
          <select v-model="language" @change="onLanguageChange">
            <option v-for="lang in detail.languages" :key="lang" :value="lang">{{ lang }}</option>
          </select>
          <button class="primary-btn small" :disabled="submitting" @click="submit">
            {{ submitting ? 'Submitting...' : 'Submit' }}
          </button>
        </div>
        <textarea v-model="code" rows="10"></textarea>
      </div>
      <div class="card" v-if="result">
        <h3>Judge Result</h3>
        <StatusTag :status="result.status" />
        <p>Runtime: {{ result.runtimeMs }}ms, Memory: {{ result.memoryKb }}KB</p>
        <ul>
          <li v-for="tc in result.testCases" :key="tc.index">
            Case {{ tc.index }} - {{ tc.status }} ({{ tc.runtimeMs }}ms)
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>
