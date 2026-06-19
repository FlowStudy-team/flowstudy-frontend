<script setup lang="ts">
import type { DocumentFolder, DocumentItem } from '../../types/document'

interface Props {
  folders: DocumentFolder[]
  documents: DocumentItem[]
  loading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  openFolder: [number]
  openDocument: [number]
}>()

function formatDate(value: string) {
  return value.slice(0, 10)
}
</script>

<template>
  <section class="document-file-grid">
    <button v-for="folder in folders" :key="`folder-${folder.id}`" class="finder-item folder-item" type="button" @click="emit('openFolder', folder.id)">
      <span class="finder-folder-icon">▰</span>
      <strong>{{ folder.name }}</strong>
      <small>{{ folder.children?.length || 0 }} 个子文件夹</small>
    </button>

    <button v-for="document in documents" :key="`document-${document.id}`" class="finder-item document-item" type="button" @click="emit('openDocument', document.id)">
      <span class="finder-document-icon">◆</span>
      <strong>{{ document.title }}</strong>
      <small>{{ document.summary || '暂无摘要' }}</small>
      <small>{{ document.status }} · {{ formatDate(document.updatedAt) }}</small>
    </button>

    <div v-if="!loading && folders.length === 0 && documents.length === 0" class="finder-empty">
      <strong>当前文件夹为空</strong>
      <span>可以新建文件夹或文档。</span>
    </div>
  </section>
</template>
