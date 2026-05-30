<script setup lang="ts">
import type { DocumentCategory, DocumentStatus } from '../../types/document'

interface QueryModel {
  keyword?: string
  categoryId?: number
  tag?: string
  status?: DocumentStatus
}

interface Props {
  modelValue: QueryModel
  categories: DocumentCategory[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [QueryModel]
  search: []
  reset: []
}>()

function update<K extends keyof QueryModel>(key: K, value: QueryModel[K]) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="document-filter">
    <input
      :value="modelValue.keyword ?? ''"
      placeholder="搜索文档标题/内容"
      @input="update('keyword', ($event.target as HTMLInputElement).value)"
      @keydown.enter="emit('search')"
    />
    <select
      :value="modelValue.categoryId ?? ''"
      @change="update('categoryId', Number(($event.target as HTMLSelectElement).value) || undefined)"
    >
      <option value="">全部分类</option>
      <option v-for="item in categories" :key="item.id" :value="item.id">{{ item.name }}</option>
    </select>
    <input :value="modelValue.tag ?? ''" placeholder="标签" @input="update('tag', ($event.target as HTMLInputElement).value)" />
    <select
      :value="modelValue.status ?? ''"
      @change="update('status', (($event.target as HTMLSelectElement).value || undefined) as DocumentStatus | undefined)"
    >
      <option value="">全部状态</option>
      <option value="draft">草稿</option>
      <option value="private">私有</option>
      <option value="published">已发布</option>
      <option value="archived">归档</option>
    </select>
    <button class="secondary-btn" @click="emit('search')">搜索</button>
    <button class="secondary-btn" @click="emit('reset')">重置</button>
  </div>
</template>
