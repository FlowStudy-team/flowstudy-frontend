import { computed, reactive, ref } from 'vue'
import { createDocument, getDocumentDetail, publishDocument, updateDocument } from '../api/document'
import type { DocumentDetail, PublishDocumentPayload } from '../types/document'

export interface DocumentEditorForm {
  title: string
  content: string
  summary: string
  categoryId?: number
  tags: string[]
}

const defaultForm = (): DocumentEditorForm => ({
  title: '',
  content: '',
  summary: '',
  categoryId: undefined,
  tags: [],
})

export function useDocumentEditor() {
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const document = ref<DocumentDetail | null>(null)
  const form = reactive<DocumentEditorForm>(defaultForm())
  const initialSnapshot = ref('')

  const dirty = computed(() => JSON.stringify(form) !== initialSnapshot.value)

  function syncSnapshot() {
    initialSnapshot.value = JSON.stringify(form)
  }

  function applyDetail(detail: DocumentDetail) {
    form.title = detail.title
    form.content = detail.content
    form.summary = detail.summary ?? ''
    form.categoryId = detail.categoryId
    form.tags = detail.tags.slice()
    syncSnapshot()
  }

  async function loadDocument(id: number) {
    loading.value = true
    error.value = ''
    try {
      const detail = await getDocumentDetail(id)
      document.value = detail
      applyDetail(detail)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  async function saveDocument() {
    saving.value = true
    error.value = ''
    try {
      if (document.value) {
        document.value = await updateDocument(document.value.id, {
          title: form.title,
          content: form.content,
          summary: form.summary,
          categoryId: form.categoryId,
          tags: form.tags,
        })
      } else {
        document.value = await createDocument({
          title: form.title || '未命名文档',
          content: form.content,
          categoryId: form.categoryId,
          tags: form.tags,
        })
      }
      applyDetail(document.value)
      return document.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : '保存失败'
      return null
    } finally {
      saving.value = false
    }
  }

  async function publishCurrent(payload: PublishDocumentPayload) {
    if (!document.value) return null
    saving.value = true
    try {
      const updated = await publishDocument(document.value.id, payload)
      document.value = updated
      applyDetail(updated)
      return updated
    } finally {
      saving.value = false
    }
  }

  function resetForm() {
    Object.assign(form, defaultForm())
    syncSnapshot()
  }

  return {
    loading,
    saving,
    error,
    document,
    form,
    dirty,
    loadDocument,
    saveDocument,
    publishCurrent,
    resetForm,
    syncSnapshot,
  }
}
