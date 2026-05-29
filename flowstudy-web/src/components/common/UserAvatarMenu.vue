<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/modules/auth'

const authStore = useAuthStore()
const router = useRouter()
const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const displayName = computed(() => authStore.displayName || 'Learner')
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const quickActions = [
  { icon: '📝', label: '题单' },
  { icon: '⭐', label: '收藏夹' },
  { icon: '📘', label: '笔记本' },
  { icon: '💡', label: '我的题解' },
  { icon: '📈', label: '进展分析', to: '/progress' },
  { icon: '🪙', label: '积分' },
]

const menuItems = [
  { icon: '🧪', label: '体验新功能' },
  { icon: '📋', label: '订单' },
  { icon: '🧩', label: '我的 Playgrounds' },
  { icon: '🪪', label: '账号设置' },
  { icon: '🎨', label: '外观' },
]

function toggleMenu() {
  open.value = !open.value
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value) return
  const target = event.target as Node | null
  if (target && !rootRef.value.contains(target)) {
    open.value = false
  }
}

function onQuickActionClick(item: (typeof quickActions)[number]) {
  if (item.to) {
    open.value = false
    router.push(item.to)
  }
}

function logout() {
  authStore.clearToken()
  open.value = false
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootRef" class="user-menu-wrap">
    <button class="user-avatar-btn" type="button" @click.stop="toggleMenu">
      <span>{{ avatarText }}</span>
    </button>
    <section v-if="open" class="user-menu-pop">
      <header class="user-menu-head">
        <div class="user-menu-avatar">{{ avatarText }}</div>
        <div class="user-menu-head-info">
          <h4>{{ displayName }}</h4>
          <p>升级 Plus 会员享专属特权</p>
        </div>
      </header>

      <div class="user-menu-grid">
        <button
          v-for="item in quickActions"
          :key="item.label"
          type="button"
          class="user-quick-item"
          @click="onQuickActionClick(item)"
        >
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </div>

      <ul class="user-menu-list">
        <li v-for="item in menuItems" :key="item.label">
          <span class="icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </li>
      </ul>

      <button class="user-menu-logout" type="button" @click="logout">
        <span class="icon">↪</span>
        <span>退出</span>
      </button>
    </section>
  </div>
</template>

