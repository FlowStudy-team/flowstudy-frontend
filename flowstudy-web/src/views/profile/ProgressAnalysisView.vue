<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import heroImage from '../../assets/hero.png'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import ContributionMap from '../../components/common/ContributionMap.vue'
import { useAuthStore } from '../../store/modules/auth'

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)

function seededValues(seed: number, days = 366) {
  const values: number[] = []
  let x = seed
  for (let i = 0; i < days; i += 1) {
    x = (x * 1664525 + 1013904223) % 4294967296
    const r = x / 4294967296
    values.push(r > 0.85 ? 7 : r > 0.65 ? 4 : r > 0.45 ? 2 : r > 0.25 ? 1 : 0)
  }
  return values
}

const readingDatasets = [
  { year: 2026, values: seededValues(2026) },
  { year: 2025, values: seededValues(2025) },
  { year: 2024, values: seededValues(2024) },
  { year: 2023, values: seededValues(2023) },
]

const submitDatasets = [
  { year: 2026, values: seededValues(9527) },
  { year: 2025, values: seededValues(9526) },
  { year: 2024, values: seededValues(9525) },
  { year: 2023, values: seededValues(9524) },
]
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
          <a href="#">后端开发</a>
          <a href="#">计算机基础</a>
          <a href="#">AI应用开发</a>
          <RouterLink to="/practice">算法练习</RouterLink>
          <a href="#">AI编程</a>
          <a href="#">推荐阅读</a>
          <a href="#">网站相关</a>
        </nav>
        <div class="jg-actions">
          <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <main class="progress-page">
        <h1>进展分析</h1>
        <ContributionMap
          title="文章阅读热力图"
          subtitle="蓝色越深表示阅读文章越活跃"
          color="blue"
          :datasets="readingDatasets"
        />
        <ContributionMap
          title="代码提交热力图"
          subtitle="绿色越深表示提交代码越活跃"
          color="green"
          :datasets="submitDatasets"
        />
      </main>
    </div>
  </section>
</template>

