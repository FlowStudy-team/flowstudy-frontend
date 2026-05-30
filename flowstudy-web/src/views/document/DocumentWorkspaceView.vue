<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { getDocumentCategories, getDocumentList } from '../../api/document'
import DocumentMetaPanel from '../../components/document/DocumentMetaPanel.vue'
import DocumentPublishDialog from '../../components/document/DocumentPublishDialog.vue'
import DocumentSidebar from '../../components/document/DocumentSidebar.vue'
import MarkdownEditor from '../../components/markdown/MarkdownEditor.vue'
import { useAutoSave } from '../../composables/useAutoSave'
import { useDocumentEditor } from '../../composables/useDocumentEditor'
import type { DocumentCategory, DocumentItem } from '../../types/document'

const route = useRoute()
const router = useRouter()

const categories = ref<DocumentCategory[]>([])
const recent = ref<DocumentItem[]>([])
const publishOpen = ref(false)

const leftPanePercent = ref(22)
const centerPanePercent = ref(52)

const { loading, saving, error, document, form, dirty, loadDocument, saveDocument, publishCurrent, resetForm } =
  useDocumentEditor()

const documentId = computed(() => {
  const raw = route.params.id
  if (!raw) return null
  const id = Number(raw)
  return Number.isNaN(id) ? null : id
})

const draftKey = computed(() => `document:draft:${documentId.value ?? 'new'}`)
const { lastSavedAt, restoreDraft, clearDraft } = useAutoSave(
  () => draftKey.value,
  () => ({
    title: form.title,
    content: form.content,
    summary: form.summary,
    categoryId: form.categoryId,
    tags: form.tags,
    updatedAt: new Date().toISOString(),
  }),
)

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

async function loadBaseData() {
  const [catResult, listResult] = await Promise.all([getDocumentCategories(), getDocumentList({ page: 1, pageSize: 8 })])
  categories.value = catResult
  recent.value = listResult.list
}

async function initPage() {
  if (documentId.value) {
    await loadDocument(documentId.value)
    return
  }
  resetForm()
  const draft = restoreDraft()
  if (!draft) return
  form.title = draft.title
  form.content = draft.content
  form.summary = draft.summary ?? ''
  form.categoryId = draft.categoryId
  form.tags = draft.tags ?? []
}

async function handleSave() {
  const saved = await saveDocument()
  if (!saved) return
  clearDraft()
  if (!documentId.value) {
    await router.replace(`/document/${saved.id}/edit`)
  }
  await loadBaseData()
}

function updateMeta(next: { summary: string; categoryId?: number; tags: string[]; content: string }) {
  form.summary = next.summary
  form.categoryId = next.categoryId
  form.tags = next.tags
}

function openDocument(id: number) {
  router.push(`/document/${id}/edit`)
}

async function submitPublish(payload: {
  title: string
  summary: string
  coverUrl?: string
  tags: string[]
  visible: boolean
  allowComment: boolean
}) {
  if (!document.value) {
    const saved = await saveDocument()
    if (!saved) return
  }
  await publishCurrent(payload)
  publishOpen.value = false
}

function onStartResizeLeft(event: MouseEvent) {
  const container = (event.currentTarget as HTMLElement).closest('.document-workspace-layout') as HTMLElement | null
  if (!container) return
  const rect = container.getBoundingClientRect()
  const startX = event.clientX
  const startLeft = leftPanePercent.value
  const startCenter = centerPanePercent.value
  const rightFixed = 100 - startLeft - startCenter
  const onMove = (e: MouseEvent) => {
    const deltaPct = ((e.clientX - startX) / rect.width) * 100
    const nextLeft = clamp(startLeft + deltaPct, 14, 34)
    const nextCenter = clamp(100 - rightFixed - nextLeft, 36, 70)
    leftPanePercent.value = 100 - rightFixed - nextCenter
    centerPanePercent.value = nextCenter
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function onStartResizeRight(event: MouseEvent) {
  const container = (event.currentTarget as HTMLElement).closest('.document-workspace-layout') as HTMLElement | null
  if (!container) return
  const rect = container.getBoundingClientRect()
  const startX = event.clientX
  const startCenter = centerPanePercent.value
  const onMove = (e: MouseEvent) => {
    const deltaPct = ((e.clientX - startX) / rect.width) * 100
    centerPanePercent.value = clamp(startCenter + deltaPct, 36, 70)
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function beforeUnloadHandler(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
}

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm('当前文档还有未保存内容，确定离开吗？')
})

watch(
  () => route.fullPath,
  async () => {
    await initPage()
  },
)

onMounted(async () => {
  await loadBaseData()
  await initPage()
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<template>
  <section class="document-workspace-page">
    <header class="document-workspace-head card">
      <RouterLink class="secondary-btn link-btn" to="/document">返回列表</RouterLink>
      <input v-model="form.title" placeholder="请输入文档标题" />
      <div class="actions">
        <span class="muted" v-if="saving">保存中...</span>
        <span class="muted" v-else-if="lastSavedAt">自动保存 {{ lastSavedAt.slice(11, 19) }}</span>
        <button class="secondary-btn" :disabled="saving || loading" @click="handleSave">保存</button>
        <button class="primary-btn" :disabled="saving || loading" @click="publishOpen = true">发布</button>
      </div>
    </header>

    <div v-if="error" class="card error-box">
      <span>{{ error }}</span>
      <button class="secondary-btn" @click="initPage">重试</button>
    </div>

    <div
      class="document-workspace-layout"
      :style="{
        gridTemplateColumns: `${leftPanePercent}% 8px ${centerPanePercent}% 8px ${100 - leftPanePercent - centerPanePercent}%`,
      }"
    >
      <DocumentSidebar :categories="categories" :recent="recent" @open="openDocument" />
      <div class="document-workspace-resizer" @mousedown="onStartResizeLeft"></div>
      <main class="document-workspace-editor">
        <div v-if="loading" class="card">加载中...</div>
        <MarkdownEditor v-else v-model="form.content" />
      </main>
      <div class="document-workspace-resizer" @mousedown="onStartResizeRight"></div>
      <DocumentMetaPanel
        :form="form"
        :categories="categories"
        :status="document?.status"
        @update="updateMeta"
        @publish="publishOpen = true"
      />
    </div>

    <DocumentPublishDialog
      :open="publishOpen"
      :seed-title="form.title || '未命名文档'"
      :seed-summary="form.summary"
      :seed-tags="form.tags"
      @close="publishOpen = false"
      @submit="submitPublish"
    />
  </section>
</template>
