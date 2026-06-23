<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import heroImage from '../../assets/hero.png'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import { fetchPracticeProblems, type PracticeProblem } from '../../api/practice'
import { useAuthStore } from '../../store/modules/auth'

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)
const loading = ref(false)
const error = ref('')
const problems = ref<PracticeProblem[]>([])
const total = ref(0)

async function loadProblems() {
  loading.value = true
  error.value = ''
  try {
    const page = await fetchPracticeProblems({ page: 1, pageSize: 100 })
    problems.value = page.list
    total.value = page.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目加载失败'
  } finally {
    loading.value = false
  }
}

function difficultyClass(difficulty: PracticeProblem['difficulty']) {
  if (difficulty === '简单') return 'easy'
  if (difficulty === '中等') return 'medium'
  return 'hard'
}

onMounted(loadProblems)
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
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/tutorials">教程阅读</RouterLink>
          <RouterLink to="/practice" class="active">算法练习</RouterLink>
          <RouterLink to="/document">学习文档</RouterLink>
        </nav>
        <div class="jg-actions">
          <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <main class="practice-main">
        <header class="practice-hero">
          <p class="practice-subtitle">当前题单来自 flowstudy-core 数据库中的真实题目。</p>
          <h1>算法练习</h1>
          <p class="muted">共 {{ total }} 道题，当前展示 {{ problems.length }} 道。</p>
        </header>

        <section class="practice-group">
          <div class="practice-group-head">
            <h3>真实题目</h3>
            <button class="secondary-btn" type="button" :disabled="loading" @click="loadProblems">刷新</button>
          </div>

          <div v-if="loading" class="card">题目加载中...</div>
          <div v-else-if="error" class="card error-box">
            <span>{{ error }}</span>
            <button class="secondary-btn" type="button" @click="loadProblems">重试</button>
          </div>
          <div v-else-if="problems.length === 0" class="card">
            暂无可展示题目。请确认数据库中 `fs_problem.status = 'PUBLISHED'` 且 `deleted = 0`。
          </div>
          <article v-for="item in problems" v-else :key="item.id" class="practice-item">
            <RouterLink class="practice-problem-link" :to="`/problems/${item.id}`">{{ item.title }}</RouterLink>
            <span class="practice-stats">
              通过 {{ item.acceptedCount }} / 提交 {{ item.submitCount }}
            </span>
            <em :class="difficultyClass(item.difficulty)">{{ item.difficulty }}</em>
          </article>
        </section>
      </main>
    </div>
  </section>
</template>
