<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useAiStore } from '../store/modules/ai'
import AiDrawer from '../components/ai/AiDrawer.vue'

const aiStore = useAiStore()
</script>

<template>
  <div class="shell">
    <div class="shell-body">
      <aside class="sidebar">
        <RouterLink to="/tutorials">Tutorials</RouterLink>
        <RouterLink to="/problems/1">Problem Practice</RouterLink>
        <RouterLink to="/me/submissions">My Submissions</RouterLink>
      </aside>
      <main class="content">
        <RouterView />
      </main>
    </div>
    <AiDrawer v-if="aiStore.open" />
  </div>
</template>
