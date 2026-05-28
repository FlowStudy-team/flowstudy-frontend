<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import PaginationBar from '../../components/common/PaginationBar.vue'
import { fetchArticles } from '../../api/modules/articles'
import type { Article } from '../../types/article'

const list = ref<Article[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref('')
const query = reactive({ page: 1, pageSize: 6, keyword: '' })

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchArticles(query)
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
    <h2>Articles</h2>
    <div class="toolbar">
      <input v-model="query.keyword" placeholder="Search article" />
      <button class="secondary-btn" @click="search">Search</button>
      <button class="secondary-btn" @click="load">Refresh</button>
    </div>
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="list.length === 0" text="No articles found." />
    <div v-else class="grid">
      <article v-for="item in list" :key="item.id" class="card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.difficulty }} · {{ item.updatedAt }}</p>
        <p>{{ item.tags.join(' / ') }}</p>
        <RouterLink class="secondary-btn link-btn" :to="`/articles/${item.id}`">Read</RouterLink>
      </article>
    </div>
    <PaginationBar :page="query.page" :page-size="query.pageSize" :total="total" @change="(p) => { query.page = p; load() }" />
  </section>
</template>
