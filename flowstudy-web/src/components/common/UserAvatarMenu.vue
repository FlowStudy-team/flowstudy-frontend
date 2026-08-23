<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/modules/auth'
import { useAiStore } from '../../store/modules/ai'

const authStore = useAuthStore()
const aiStore = useAiStore()
const router = useRouter()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const displayName = computed(() => authStore.displayName || 'Learner')
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const quickActions = [
  { icon: '🏠', label: '个人主页', to: '/me' },
  { icon: '📝', label: '算法练习', to: '/practice' },
  { icon: '📘', label: '我的文档', to: '/document' },
  { icon: '📊', label: '学习概览', to: '/progress' },
  { icon: '🛒', label: 'Token 商城', to: '/store' },
  { icon: '🤖', label: 'AI 学习助手', action: 'ai' },
] as const

function toggleMenu() { open.value = !open.value }
function onDocumentClick(event: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) open.value = false
}
function onAction(item: (typeof quickActions)[number]) {
  open.value = false
  if ('to' in item && item.to) router.push(item.to)
  if ('action' in item && item.action === 'ai') aiStore.toggle()
}
function logout() { authStore.clearToken(); open.value = false; router.push('/') }
onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootRef" class="user-menu-wrap">
    <button class="user-avatar-btn" type="button" @click.stop="toggleMenu"><span>{{ avatarText }}</span></button>
    <section v-if="open" class="user-menu-pop">
      <header class="user-menu-head"><div class="user-menu-avatar">{{ avatarText }}</div><div class="user-menu-head-info"><h4>{{ displayName }}</h4><p>FlowStudy 学习账户</p></div></header>
      <div class="user-menu-grid"><button v-for="item in quickActions" :key="item.label" type="button" class="user-quick-item" @click="onAction(item)"><span class="icon">{{ item.icon }}</span><span>{{ item.label }}</span></button></div>
      <button class="user-menu-logout" type="button" @click="logout">退出登录</button>
    </section>
  </div>
</template>
