<script setup lang="ts">
import MarkdownEditor, { type MarkdownEditorMode } from '../markdown/MarkdownEditor.vue'

interface Props {
  modelValue: string
  mode: MarkdownEditorMode
  title?: string
  subtitle?: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '内容编辑',
  subtitle: '',
  placeholder: '开始撰写内容...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [string]
  'update:mode': [MarkdownEditorMode]
}>()
</script>

<template>
  <section class="document-editor-panel">
    <div class="document-workspace-editor-tools">
      <div>
        <strong>{{ title }}</strong>
        <span>{{ subtitle || (mode === 'professional' ? 'Markdown 专业编辑' : '类飞书简洁编辑') }}</span>
      </div>
      <div class="document-mode-switch" role="group" aria-label="编辑模式">
        <button type="button" :class="{ active: mode === 'professional' }" @click="emit('update:mode', 'professional')">
          专业编辑
        </button>
        <button type="button" :class="{ active: mode === 'simple' }" @click="emit('update:mode', 'simple')">简洁编辑</button>
      </div>
    </div>

    <MarkdownEditor
      :model-value="modelValue"
      :mode="mode"
      :placeholder="placeholder"
      :disabled="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </section>
</template>
