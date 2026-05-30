import { computed, ref, watch } from 'vue'
import { getStorageJSON, removeStorage, setStorageJSON } from '../utils/storage'

export interface DraftPayload {
  title: string
  content: string
  summary?: string
  categoryId?: number
  tags: string[]
  updatedAt: string
}

export function useAutoSave(key: () => string, source: () => DraftPayload) {
  const timer = ref<number | null>(null)
  const lastSavedAt = ref('')

  function saveNow() {
    const payload = { ...source(), updatedAt: new Date().toISOString() }
    setStorageJSON(key(), payload)
    lastSavedAt.value = payload.updatedAt
  }

  function scheduleSave() {
    if (timer.value) window.clearTimeout(timer.value)
    timer.value = window.setTimeout(() => {
      saveNow()
      timer.value = null
    }, 1200)
  }

  function restoreDraft(): DraftPayload | null {
    return getStorageJSON<DraftPayload>(key())
  }

  function clearDraft() {
    removeStorage(key())
  }

  const hasDraft = computed(() => Boolean(getStorageJSON(key())))

  watch(source, scheduleSave, { deep: true })

  return {
    lastSavedAt,
    hasDraft,
    restoreDraft,
    clearDraft,
    saveNow,
  }
}

