<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getDocumentCategories } from '../../api/document'
import DocumentCard from '../../components/document/DocumentCard.vue'
import DocumentFilterBar from '../../components/document/DocumentFilterBar.vue'
import { useDocumentList } from '../../composables/useDocumentList'
import type { DocumentCategory } from '../../types/document'

const categories = ref<DocumentCategory[]>([])
const { loading, error, list, total, query, fetchList, resetQuery, changePage } = useDocumentList()

async function loadCategories() {
  categories.value = await getDocumentCategories()
}

async function search() {
  query.page = 1
  await fetchList()
}

async function reset() {
  resetQuery()
  await fetchList()
}

async function nextPage(page: number) {
  changePage(page)
  await fetchList()
}

onMounted(async () => {
  await Promise.all([loadCategories(), fetchList()])
})
</script>

<template>
  <section class="document-page">
    <header class="document-page-header">
      <h1>文档中心</h1>
      <RouterLink class="primary-btn link-btn" to="/document/workspace">新建文档</RouterLink>
    </header>

    <DocumentFilterBar v-model="query" :categories="categories" @search="search" @reset="reset" />

    <div v-if="loading" class="card">加载中...</div>
    <div v-else-if="error" class="card error-box">
      <span>{{ error }}</span>
      <button class="secondary-btn" @click="fetchList">重试</button>
    </div>
    <div v-else-if="list.length === 0" class="card">
      <h3>你还没有创建文档</h3>
      <RouterLink class="primary-btn link-btn" to="/document/workspace">新建第一篇文档</RouterLink>
    </div>
    <div v-else class="document-cards">
      <DocumentCard v-for="item in list" :key="item.id" :item="item" />
    </div>

    <div class="document-pagination" v-if="total > (query.pageSize ?? 9)">
      <button class="secondary-btn" :disabled="(query.page ?? 1) <= 1" @click="nextPage((query.page ?? 1) - 1)">
        上一页
      </button>
      <span>第 {{ query.page ?? 1 }} 页</span>
      <button
        class="secondary-btn"
        :disabled="(query.page ?? 1) * (query.pageSize ?? 9) >= total"
        @click="nextPage((query.page ?? 1) + 1)"
      >
        下一页
      </button>
    </div>
  </section>
</template>
