<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { fetchMySubmissions } from '../../api/modules/submissions'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import PaginationBar from '../../components/common/PaginationBar.vue'
import StatusTag from '../../components/common/StatusTag.vue'
import type { SubmissionDetail } from '../../types/problem'

const loading = ref(false)
const error = ref('')
const list = ref<SubmissionDetail[]>([])
const total = ref(0)
const query = reactive({ page: 1, pageSize: 8, keyword: '' })

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchMySubmissions(query)
    list.value = res.list
    total.value = res.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Load failed.'
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  load()
}

onMounted(load)
</script>

<template>
  <section>
    <h2>My Submissions</h2>
    <div class="toolbar">
      <input v-model="query.keyword" placeholder="Search by id/problem" />
      <button class="secondary-btn" @click="search">Search</button>
      <button class="secondary-btn" @click="load">Refresh</button>
    </div>
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="list.length === 0" text="No submissions." />
    <table v-else class="table">
      <thead>
        <tr><th>ID</th><th>Problem</th><th>Status</th><th>Language</th><th>Runtime</th></tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.problemId }}</td>
          <td><StatusTag :status="item.status" /></td>
          <td>{{ item.language }}</td>
          <td>{{ item.runtimeMs }}ms</td>
        </tr>
      </tbody>
    </table>
    <PaginationBar :page="query.page" :page-size="query.pageSize" :total="total" @change="(p) => { query.page = p; load() }" />
  </section>
</template>
