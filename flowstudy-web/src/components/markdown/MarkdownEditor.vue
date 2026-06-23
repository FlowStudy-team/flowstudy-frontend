<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { MdEditor } from 'md-editor-v3'
import type { ToolbarNames } from 'md-editor-v3'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import 'md-editor-v3/lib/style.css'
import { editableHtmlStringToMarkdown, markdownToEditableHtml } from '../../utils/markdownWysiwyg'

export type MarkdownEditorMode = 'professional' | 'simple'

interface Props {
  modelValue: string
  mode?: MarkdownEditorMode
  placeholder?: string
  disabled?: boolean
}

type SimpleAction = 'paragraph' | 'bold' | 'italic' | 'underline' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'code' | 'link'

interface SimpleToolbarItem {
  action: SimpleAction
  label: string
  title: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'professional',
  placeholder: '开始撰写博客内容，支持标题、列表、引用、代码块和链接...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const slashOpen = ref(false)
const slashTop = ref(0)
const slashLeft = ref(0)
let syncingFromModel = false
let pendingHtml = ''
let updateTimer: number | null = null
let lastEditorMarkdown = props.modelValue || ''

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
  { action: 'paragraph', label: '正文', title: '正文' },
  { action: 'bold', label: 'B', title: '加粗' },
  { action: 'italic', label: 'I', title: '斜体' },
  { action: 'underline', label: 'U', title: '下划线' },
  { action: 'h1', label: 'H1', title: '一级标题' },
  { action: 'h2', label: 'H2', title: '二级标题' },
  { action: 'h3', label: 'H3', title: '三级标题' },
  { action: 'ul', label: '列表', title: '无序列表' },
  { action: 'ol', label: '1.', title: '有序列表' },
  { action: 'quote', label: '引用', title: '引用' },
  { action: 'code', label: '</>', title: '代码块' },
  { action: 'link', label: '链接', title: '链接' },
]

const slashItems: SimpleToolbarItem[] = [
  { action: 'paragraph', label: '正文', title: '普通文本段落' },
  { action: 'h1', label: '一级标题', title: '大标题' },
  { action: 'h2', label: '二级标题', title: '章节标题' },
  { action: 'h3', label: '三级标题', title: '小节标题' },
  { action: 'ul', label: '无序列表', title: '项目列表' },
  { action: 'ol', label: '有序列表', title: '步骤列表' },
  { action: 'quote', label: '引用', title: '重点说明' },
  { action: 'code', label: '代码块', title: '展示代码' },
]

function update(value: string) {
  emit('update:modelValue', value)
}

function flushEditorMarkdown() {
  if (!pendingHtml) return
  const markdown = editableHtmlStringToMarkdown(pendingHtml)
  pendingHtml = ''
  if (markdown === lastEditorMarkdown) return
  lastEditorMarkdown = markdown
  update(markdown)
}

function scheduleEditorMarkdownUpdate(html: string) {
  pendingHtml = html
  if (updateTimer) {
    window.clearTimeout(updateTimer)
  }
  updateTimer = window.setTimeout(() => {
    flushEditorMarkdown()
    updateTimer = null
  }, 250)
}

const editor = useEditor({
  content: markdownToEditableHtml(props.modelValue || ''),
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({
      autolink: true,
      openOnClick: false,
      linkOnPaste: true,
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  editorProps: {
    attributes: {
      class: 'document-tiptap-surface',
    },
    handleTextInput(
      view: { coordsAtPos: (position: number) => { bottom: number; left: number } },
      from: number,
      _to: number,
      text: string,
    ) {
      if (text !== '/') return false
      const coords = view.coordsAtPos(from)
      slashTop.value = coords.bottom + 8
      slashLeft.value = coords.left
      slashOpen.value = true
      return false
    },
    handleKeyDown(_view: unknown, event: KeyboardEvent) {
      if (event.key === 'Escape') {
        slashOpen.value = false
      }
      return false
    },
  },
  onUpdate({ editor }: { editor: { getHTML: () => string } }) {
    if (syncingFromModel) return
    scheduleEditorMarkdownUpdate(editor.getHTML())
  },
  onBlur() {
    if (updateTimer) {
      window.clearTimeout(updateTimer)
      updateTimer = null
    }
    flushEditorMarkdown()
  },
})

const canShowBubble = computed(() => {
  if (!editor.value || props.disabled || props.mode !== 'simple') return false
  return !editor.value.state.selection.empty
})

function isActive(action: SimpleAction) {
  if (!editor.value) return false
  if (action === 'bold') return editor.value.isActive('bold')
  if (action === 'italic') return editor.value.isActive('italic')
  if (action === 'underline') return editor.value.isActive('underline')
  if (action === 'h1') return editor.value.isActive('heading', { level: 1 })
  if (action === 'h2') return editor.value.isActive('heading', { level: 2 })
  if (action === 'h3') return editor.value.isActive('heading', { level: 3 })
  if (action === 'ul') return editor.value.isActive('bulletList')
  if (action === 'ol') return editor.value.isActive('orderedList')
  if (action === 'quote') return editor.value.isActive('blockquote')
  if (action === 'code') return editor.value.isActive('codeBlock')
  if (action === 'link') return editor.value.isActive('link')
  return editor.value.isActive('paragraph')
}

function applyAction(action: SimpleAction) {
  const chain = editor.value?.chain().focus()
  if (!chain) return

  if (action === 'paragraph') chain.setParagraph().run()
  if (action === 'bold') chain.toggleBold().run()
  if (action === 'italic') chain.toggleItalic().run()
  if (action === 'underline') chain.toggleUnderline().run()
  if (action === 'h1') chain.toggleHeading({ level: 1 }).run()
  if (action === 'h2') chain.toggleHeading({ level: 2 }).run()
  if (action === 'h3') chain.toggleHeading({ level: 3 }).run()
  if (action === 'ul') chain.toggleBulletList().run()
  if (action === 'ol') chain.toggleOrderedList().run()
  if (action === 'quote') chain.toggleBlockquote().run()
  if (action === 'code') chain.toggleCodeBlock().run()
  if (action === 'link') {
    const previous = editor.value?.getAttributes('link').href as string | undefined
    const url = window.prompt('请输入链接地址', previous ?? 'https://')
    if (url === null) return
    if (!url.trim()) chain.unsetLink().run()
    else chain.extendMarkRange('link').setLink({ href: url.trim() }).run()
  }
  slashOpen.value = false
}

function applySlashAction(action: SimpleAction) {
  editor.value?.chain().focus().deleteRange({
    from: Math.max(0, editor.value.state.selection.from - 1),
    to: editor.value.state.selection.from,
  }).run()
  applyAction(action)
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editor.value || props.mode !== 'simple') return
    if (value === lastEditorMarkdown) return
    const nextHtml = markdownToEditableHtml(value || '')
    if (editor.value.getHTML() === nextHtml) return
    syncingFromModel = true
    lastEditorMarkdown = value || ''
    editor.value.commands.setContent(nextHtml, { emitUpdate: false })
    syncingFromModel = false
  },
)

watch(
  () => props.disabled,
  (value) => {
    editor.value?.setEditable(!value)
  },
)

watch(
  () => props.mode,
  (value, oldValue) => {
    if (oldValue === 'simple' && value !== 'simple') {
      if (updateTimer) {
        window.clearTimeout(updateTimer)
        updateTimer = null
      }
      flushEditorMarkdown()
    }
  },
)

onBeforeUnmount(() => {
  if (updateTimer) {
    window.clearTimeout(updateTimer)
    flushEditorMarkdown()
  }
  editor.value?.destroy()
})
</script>

<template>
  <div class="document-md-editor-wrap" :class="`is-${mode}`">
    <div v-if="mode === 'simple'" class="document-simple-editor">
      <div v-if="canShowBubble" class="document-simple-bubble">
        <button
          v-for="item in simpleToolbarItems.filter((toolbar) => toolbar.action !== 'paragraph')"
          :key="item.action"
          type="button"
          :class="{ active: isActive(item.action) }"
          :title="item.title"
          @mousedown.prevent="applyAction(item.action)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="document-simple-toolbar">
        <div class="document-simple-toolbar-title">
          <strong>简洁编辑</strong>
          <span>输入 / 可插入标题、列表、引用和代码块</span>
        </div>
        <div class="document-simple-toolbar-group">
          <button
            v-for="item in simpleToolbarItems"
            :key="item.action"
            type="button"
            :class="{ active: isActive(item.action) }"
            :title="item.title"
            :disabled="disabled"
            @click="applyAction(item.action)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="document-simple-surface">
        <EditorContent :editor="editor" />
      </div>

      <div v-if="slashOpen" class="document-slash-menu" :style="{ top: `${slashTop}px`, left: `${slashLeft}px` }">
        <button
          v-for="item in slashItems"
          :key="item.action"
          type="button"
          @mousedown.prevent="applySlashAction(item.action)"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.title }}</span>
        </button>
      </div>
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
