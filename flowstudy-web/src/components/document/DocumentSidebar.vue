<script setup lang="ts">
import type { DocumentCategory, DocumentItem } from '../../types/document'

interface Props {
  categories: DocumentCategory[]
  recent: DocumentItem[]
}

defineProps<Props>()
const emit = defineEmits<{
  open: [number]
}>()
</script>

<template>
  <aside class="document-sidebar">
    <h3>文档目录</h3>
    <ul>
      <li v-for="cat in categories" :key="cat.id">{{ cat.name }}</li>
    </ul>
    <h3>最近编辑</h3>
    <ul>
      <li v-for="doc in recent" :key="doc.id">
        <button class="document-link-btn" @click="emit('open', doc.id)">{{ doc.title }}</button>
      </li>
    </ul>
  </aside>
</template>
