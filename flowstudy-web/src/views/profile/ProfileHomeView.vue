<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchProfileSummary, fetchRecentActivities } from '../../api/modules/profile'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import type { LearningActivity, ProfileSummary } from '../../types/profile'

const loading = ref(false)
const error = ref('')
const profile = ref<ProfileSummary | null>(null)
const activities = ref<LearningActivity[]>([])

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [p, a] = await Promise.all([fetchProfileSummary(), fetchRecentActivities()])
    profile.value = p
    activities.value = a
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Load failed.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section>
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <template v-else-if="profile">
      <h2>My Profile</h2>
      <div class="grid">
        <article class="card"><h3>{{ profile.name }}</h3><p>{{ profile.email }}</p></article>
        <article class="card"><h3>Streak</h3><p>{{ profile.streakDays }} days</p></article>
        <article class="card"><h3>Solved</h3><p>{{ profile.solvedCount }}</p></article>
      </div>
      <div class="card">
        <h3>Recent Activities</h3>
        <EmptyState v-if="activities.length === 0" text="No activity." />
        <ul v-else>
          <li v-for="item in activities" :key="item.id">{{ item.time }} - {{ item.title }}</li>
        </ul>
      </div>
    </template>
  </section>
</template>
