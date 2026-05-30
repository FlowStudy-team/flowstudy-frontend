<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { DocumentItem } from '../../types/document'

interface Props {
  item: DocumentItem
}

defineProps<Props>()
</script>

<template>
  <article class="document-card">
    <h3>{{ item.title }}</h3>
    <p class="muted">{{ item.summary || '暂无摘要' }}</p>
    <p class="muted">状态：{{ item.status }} · 分类：{{ item.categoryName || '未分类' }}</p>
    <p class="muted">标签：{{ item.tags.join(' / ') || '暂无' }}</p>
    <p class="muted">更新：{{ item.updatedAt.slice(0, 10) }}</p>
    <div class="actions">
      <RouterLink class="secondary-btn link-btn" :to="`/document/${item.id}`">阅读</RouterLink>
      <RouterLink class="primary-btn link-btn" :to="`/document/${item.id}/edit`">编辑</RouterLink>
    </div>
  </article>
</template>
