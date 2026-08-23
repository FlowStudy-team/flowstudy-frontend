<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ContributionMap from '../../components/common/ContributionMap.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import { fetchLearningOverview, type DailyActivity, type LearningOverview } from '../../api/modules/learning'

const loading = ref(true)
const error = ref('')
const overview = ref<LearningOverview | null>(null)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 4 }, (_, index) => currentYear - index)

function datasetForYear(activities: DailyActivity[], year: number) {
  const counts = new Map(activities.filter((item) => item.date.startsWith(`${year}-`)).map((item) => [item.date, item.count]))
  const values: number[] = []
  const day = new Date(year, 0, 1)
  const end = new Date(year + 1, 0, 1)
  while (day < end) {
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    values.push(counts.get(date) ?? 0)
    day.setDate(day.getDate() + 1)
  }
  return { year, values }
}

const readingDatasets = computed(() => years.map((year) => datasetForYear(overview.value?.readingActivity ?? [], year)))
const submitDatasets = computed(() => years.map((year) => datasetForYear(overview.value?.submissionActivity ?? [], year)))

async function load() {
  loading.value = true
  error.value = ''
  try {
    overview.value = await fetchLearningOverview(`${years[years.length - 1]}-01-01`, `${years[0]}-12-31`)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学习数据加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="reader-page">
    <div class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand"><strong>FlowStudy</strong></div>
        <nav class="jg-nav"><RouterLink to="/">首页</RouterLink><RouterLink to="/practice">算法练习</RouterLink><RouterLink to="/store">Token 商城</RouterLink></nav>
        <div class="jg-actions"><UserAvatarMenu /></div>
      </header>
      <main class="progress-page">
        <div class="progress-heading"><div><p class="eyebrow">LEARNING OVERVIEW</p><h1>学习概览</h1><p>热力图来自真实学习行为和代码提交记录，没有行为的日期会保持为空。</p></div><button class="secondary-btn" @click="load">刷新数据</button></div>
        <div v-if="loading" class="card">正在加载真实学习数据...</div>
        <div v-else-if="error" class="card error-box">{{ error }} <button class="secondary-btn" @click="load">重试</button></div>
        <template v-else-if="overview">
          <div class="grid progress-stats">
            <article class="card"><h3>学习天数</h3><strong>{{ overview.learningDays }}</strong><p>统计周期内有学习行为的日期</p></article>
            <article class="card"><h3>连续学习</h3><strong>{{ overview.streakDays }} 天</strong><p>从今天向前连续计算</p></article>
            <article class="card"><h3>提交次数</h3><strong>{{ overview.submissionCount }}</strong><p>包含所有代码提交</p></article>
            <article class="card"><h3>通过题目</h3><strong>{{ overview.solvedProblemCount }}</strong><p>按不同题目去重</p></article>
          </div>
          <ContributionMap title="文章与文档学习热力图" subtitle="按日期统计真实阅读和学习行为" color="blue" :datasets="readingDatasets" />
          <ContributionMap title="代码提交热力图" subtitle="按日期统计真实提交次数" color="green" :datasets="submitDatasets" />
        </template>
      </main>
    </div>
  </section>
</template>

<style scoped>
.progress-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:18px; }.progress-heading h1 { margin:4px 0 8px; }.progress-heading p { color:#7188a2; }.eyebrow { color:#5b88b2; font-size:12px; letter-spacing:2px; margin:0; }.progress-stats strong { display:block; font-size:30px; color:#1e6ed8; }.progress-stats p { color:#7188a2; font-size:13px; }
</style>
