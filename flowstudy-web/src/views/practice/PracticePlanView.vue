<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import heroImage from '../../assets/hero.png'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import { useAuthStore } from '../../store/modules/auth'

interface ProblemItem {
  id: string
  title: string
  difficulty: '简单' | '中等' | '困难'
}

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)

const problems: ProblemItem[] = [
  { id: '1', title: '两数之和', difficulty: '简单' },
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
          <RouterLink to="/articles">文章阅读</RouterLink>
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
          <p class="practice-subtitle">当前题单使用 flowstudy-core 数据库中的真实题目。</p>
          <h1>算法练习</h1>
        </header>

        <section class="practice-group">
          <h3>真实题目</h3>
          <article v-for="item in problems" :key="item.id" class="practice-item">
            <RouterLink class="practice-problem-link" :to="`/problems/${item.id}`">{{ item.title }}</RouterLink>
            <em>{{ item.difficulty }}</em>
          </article>
        </section>
      </main>
    </div>
  </section>
</template>
