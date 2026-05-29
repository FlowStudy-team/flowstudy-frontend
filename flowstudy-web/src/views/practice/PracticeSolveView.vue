<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { fetchProblemDetail, submitSolution } from '../../api/modules/problems'
import { useAuthStore } from '../../store/modules/auth'
import type { ProblemDetail, SubmissionDetail } from '../../types/problem'

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)
const route = useRoute()

const problemId = computed(() => String(route.params.problemId))
const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const detail = ref<ProblemDetail | null>(null)
const language = ref('Java')
const code = ref('')
const result = ref<SubmissionDetail | null>(null)
const activeTab = ref<'description' | 'solution' | 'submissions'>('description')

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchProblemDetail(problemId.value)
    language.value = detail.value.languages.includes('Java') ? 'Java' : detail.value.languages[0]
    code.value = detail.value.starterCode[language.value]
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目加载失败'
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
    result.value = await submitSolution({
      problemId: detail.value.id,
      language: language.value,
      code: code.value,
    })
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="reader-page">
    <div class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <a href="#">后端开发</a>
          <a href="#">计算机基础</a>
          <a href="#">AI应用开发</a>
          <RouterLink to="/practice" class="active">算法练习</RouterLink>
          <a href="#">AI编程</a>
          <a href="#">推荐阅读</a>
          <a href="#">网站相关</a>
        </nav>
        <div class="jg-actions">
          <RouterLink class="secondary-btn link-btn" to="/practice">返回题单</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/login">登录</RouterLink>
        </div>
      </header>

      <div class="solve-layout">
        <div class="solve-pane solve-left">
          <div class="solve-tabs">
            <button class="solve-tab" :class="{ active: activeTab === 'description' }" @click="activeTab = 'description'">题目描述</button>
            <button class="solve-tab" :class="{ active: activeTab === 'solution' }" @click="activeTab = 'solution'">题解</button>
            <button class="solve-tab" :class="{ active: activeTab === 'submissions' }" @click="activeTab = 'submissions'">提交记录</button>
          </div>
          <div v-if="loading" class="solve-state">加载中...</div>
          <div v-else-if="error" class="solve-state error">{{ error }}</div>
          <div v-else-if="detail" class="solve-scroll">
            <h1 class="solve-title">{{ detail.id }}. {{ detail.title }}</h1>
            <p class="solve-diff">中等</p>
            <div class="solve-card">
              <p>{{ detail.description }}</p>
              <p><strong>输入：</strong>{{ detail.inputDesc }}</p>
              <p><strong>输出：</strong>{{ detail.outputDesc }}</p>
            </div>
            <h3>示例</h3>
            <div class="solve-card" v-for="(sample, idx) in detail.samples" :key="idx">
              <p><strong>输入：</strong>{{ sample.input }}</p>
              <p><strong>输出：</strong>{{ sample.output }}</p>
            </div>
            <h3>提示</h3>
            <ul>
              <li v-for="item in detail.constraints" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>

        <div class="solve-pane solve-right">
          <div class="solve-editor-head">
            <strong>代码</strong>
            <div class="solve-actions">
              <select v-model="language" @change="onLanguageChange">
                <option v-for="lang in detail?.languages ?? []" :key="lang" :value="lang">{{ lang }}</option>
              </select>
              <button class="primary-btn small" :disabled="submitting" @click="submit">
                {{ submitting ? '提交中...' : '提交' }}
              </button>
            </div>
          </div>
          <textarea v-model="code" class="solve-editor"></textarea>
          <div v-if="result" class="solve-result">
            <strong>测试结果：{{ result.status }}</strong>
            <p>运行时间 {{ result.runtimeMs }}ms，内存 {{ result.memoryKb }}KB</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
