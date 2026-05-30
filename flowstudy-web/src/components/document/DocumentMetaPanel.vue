<script setup lang="ts">
import DocumentOutline from './DocumentOutline.vue'
import type { DocumentCategory, DocumentStatus } from '../../types/document'

interface FormModel {
  summary: string
  categoryId?: number
  tags: string[]
  content: string
}

interface Props {
  form: FormModel
  categories: DocumentCategory[]
  status?: DocumentStatus
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [FormModel]
  publish: []
}>()

function update<K extends keyof FormModel>(key: K, value: FormModel[K]) {
  emit('update', { ...props.form, [key]: value })
}

function onTagsInput(raw: string) {
  const tags = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  update('tags', tags)
}
</script>

<template>
  <aside class="document-meta">
    <h3>文档属性</h3>
    <p class="muted">状态：{{ status || 'draft' }}</p>
    <label>分类</label>
    <select
      :value="form.categoryId ?? ''"
      @change="update('categoryId', Number(($event.target as HTMLSelectElement).value) || undefined)"
    >
      <option value="">未分类</option>
      <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
    </select>

    <label>标签（逗号分隔）</label>
    <input :value="form.tags.join(', ')" @input="onTagsInput(($event.target as HTMLInputElement).value)" />

    <label>摘要</label>
    <textarea :value="form.summary" rows="4" placeholder="请输入摘要" @input="update('summary', ($event.target as HTMLTextAreaElement).value)" />

    <button class="primary-btn" @click="emit('publish')">发布为博客</button>

    <DocumentOutline :content="form.content" />
  </aside>
</template>
