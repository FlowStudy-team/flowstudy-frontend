<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../store/modules/auth'
import { useAiStore } from '../store/modules/ai'
import AiDrawer from '../components/ai/AiDrawer.vue'

const authStore = useAuthStore()
const aiStore = useAiStore()
const router = useRouter()

function logout() {
  authStore.clearToken()
  router.push('/login')
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <strong>FlowStudy</strong>
      <nav>
        <RouterLink to="/articles">Articles</RouterLink>
        <RouterLink to="/me">Profile</RouterLink>
      </nav>
      <div class="actions">
        <button class="secondary-btn" @click="aiStore.toggle">AI</button>
        <button class="secondary-btn" @click="logout">Logout</button>
      </div>
    </header>
    <div class="shell-body">
      <aside class="sidebar">
        <RouterLink to="/articles">Article List</RouterLink>
        <RouterLink to="/problems/p1001">Problem Practice</RouterLink>
        <RouterLink to="/me/submissions">My Submissions</RouterLink>
      </aside>
      <main class="content">
        <RouterView />
      </main>
    </div>
    <AiDrawer />
  </div>
</template>
