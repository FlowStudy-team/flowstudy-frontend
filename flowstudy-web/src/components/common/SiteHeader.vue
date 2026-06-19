<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { useAuthStore } from '../../store/modules/auth'
import UserAvatarMenu from './UserAvatarMenu.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAuthed = computed(() => authStore.isAuthenticated)

function isActive(target: string) {
  if (target === '/') return route.path === '/'
  return route.path.startsWith(target)
}
</script>

<template>
  <header class="jg-header">
    <RouterLink class="jg-brand" to="/">
      <img :src="heroImage" alt="FlowStudy" />
      <strong>FlowStudy</strong>
    </RouterLink>
    <nav class="jg-nav">
      <RouterLink to="/" :class="{ active: isActive('/') }">首页</RouterLink>
      <RouterLink to="/articles" :class="{ active: isActive('/articles') }">后端开发</RouterLink>
      <RouterLink to="/articles">计算机基础</RouterLink>
      <RouterLink to="/articles">AI应用开发</RouterLink>
      <RouterLink to="/practice" :class="{ active: isActive('/practice') || isActive('/problems') }">算法练习</RouterLink>
      <RouterLink to="/articles">AI编程</RouterLink>
      <RouterLink to="/articles">一周热点</RouterLink>
      <RouterLink to="/document" :class="{ active: isActive('/document') }">文档中心</RouterLink>
    </nav>
    <div class="jg-actions">
      <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
      <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
      <UserAvatarMenu v-if="isAuthed" />
    </div>
  </header>
</template>
