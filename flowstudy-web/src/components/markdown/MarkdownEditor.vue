<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { editableHtmlToMarkdown, markdownToEditableHtml } from '../../utils/markdownWysiwyg'

export type MarkdownEditorMode = 'professional' | 'simple'

interface Props {
  modelValue: string
  mode?: MarkdownEditorMode
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'professional',
  placeholder: '开始写文档...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

type SimpleAction = 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'code' | 'link'

interface SimpleToolbarItem {
  action: SimpleAction
  label: string
  title: string
}

const editorRef = ref<HTMLElement | null>(null)
const focused = ref(false)

const professionalToolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  'title',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  'code',
  'link',
  'image',
  'table',
  'revoke',
  'next',
  'save',
  'preview',
  'previewOnly',
  'catalog',
  'fullscreen',
]

const simpleToolbarItems: SimpleToolbarItem[] = [
  { action: 'bold', label: 'B', title: '加粗' },
  { action: 'italic', label: 'I', title: '斜体' },
  { action: 'h1', label: 'H1', title: '一级标题' },
  { action: 'h2', label: 'H2', title: '二级标题' },
  { action: 'h3', label: 'H3', title: '三级标题' },
  { action: 'ul', label: '•', title: '无序列表' },
  { action: 'ol', label: '1.', title: '有序列表' },
  { action: 'quote', label: '“', title: '引用' },
  { action: 'code', label: '</>', title: '代码' },
  { action: 'link', label: '↗', title: '链接' },
]

function update(value: string) {
  emit('update:modelValue', value)
}

function renderSimpleEditor() {
  const editor = editorRef.value
  if (!editor || focused.value) return
  editor.innerHTML = markdownToEditableHtml(props.modelValue || '')
}

function syncSimpleModel() {
  const editor = editorRef.value
  if (!editor) return
  update(editableHtmlToMarkdown(editor))
}

function command(name: string, value?: string) {
  if (props.disabled) return
  const editor = editorRef.value
  editor?.focus()
  document.execCommand(name, false, value)
  syncSimpleModel()
}

function applyAction(action: SimpleAction) {
  if (action === 'bold') command('bold')
  if (action === 'italic') command('italic')
  if (action === 'h1') command('formatBlock', '<h1>')
  if (action === 'h2') command('formatBlock', '<h2>')
  if (action === 'h3') command('formatBlock', '<h3>')
  if (action === 'ul') command('insertUnorderedList')
  if (action === 'ol') command('insertOrderedList')
  if (action === 'quote') command('formatBlock', '<blockquote>')
  if (action === 'code') command('formatBlock', '<pre>')
  if (action === 'link') {
    const url = window.prompt('请输入链接地址')
    if (url) command('createLink', url)
  }
}

watch(
  () => [props.modelValue, props.mode],
  () => {
    void nextTick(renderSimpleEditor)
  },
)

onMounted(renderSimpleEditor)
</script>

<template>
  <div class="document-md-editor-wrap" :class="`is-${mode}`">
    <div v-if="mode === 'simple'" class="document-simple-editor">
      <div class="document-simple-toolbar">
        <div class="document-simple-toolbar-group">
          <button
            v-for="item in simpleToolbarItems"
            :key="item.action"
            type="button"
            :title="item.title"
            :disabled="disabled"
            @click="applyAction(item.action)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
      <div
        ref="editorRef"
        class="document-simple-surface"
        :class="{ empty: !modelValue }"
        :contenteditable="!disabled"
        :data-placeholder="placeholder"
        @focus="focused = true"
        @blur="focused = false"
        @input="syncSimpleModel"
      ></div>
    </div>
    <MdEditor
      v-else
      class="document-md-editor"
      :height="'100%'"
      :style="{ height: '100%' }"
      :model-value="modelValue"
      :preview="true"
      :toolbars="professionalToolbars"
      preview-theme="vuepress"
      :placeholder="placeholder"
      :readonly="disabled"
      @update:model-value="update"
    />
  </div>
</template>

<style scoped>
.document-md-editor-wrap {
  height: 100%;
  min-height: 0;
}
</style>
