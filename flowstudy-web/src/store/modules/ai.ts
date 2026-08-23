import { defineStore } from 'pinia'
import { ref } from 'vue'
import { askAiStream, generateAiNote, getAiNoteTask } from '../../api/modules/ai'
import { getAiMessages, listAiConversations, type ConversationSummary } from '../../api/modules/ai'
import type { AiMessage, AiContext } from '../../types/ai'

export const useAiStore = defineStore('ai', () => {
  const open = ref(false)
  const loading = ref(false)
  const messages = ref<AiMessage[]>([])
  const context = ref<AiContext>({})
  const conversationId = ref<string | null>(null)
  const conversations = ref<ConversationSummary[]>([])
  const abortController = ref<AbortController | null>(null)
  const noteLoading = ref(false)
  const noteResult = ref('')
  const noteError = ref('')

  function toggle() {
    open.value = !open.value
  }

  function openPanel() {
    open.value = true
  }

  function setContext(ctx: AiContext) {
    context.value = { ...ctx }
  }

  function addUserMessage(content: string) {
    messages.value.push({
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    })
  }

  async function send(prompt: string) {
    if (!prompt.trim() || loading.value) return
    addUserMessage(prompt)

    const assistantMessage: AiMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
    }
    messages.value.push(assistantMessage)
    loading.value = true
    abortController.value = new AbortController()

    const history = messages.value
      .slice(0, -1)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

    try {
      await askAiStream({
        message: prompt,
        history,
        context: context.value,
        conversationId: conversationId.value,
        onConversationId(id: string) {
          conversationId.value = id
        },
        onToken(token: string) {
          assistantMessage.content += token
        },
        onDone() {
          loading.value = false
          abortController.value = null
          if (!assistantMessage.content) {
            messages.value.pop()
          }
        },
        onError(error: string) {
          assistantMessage.content = `[Error] ${error}`
          loading.value = false
          abortController.value = null
        },
      })
    } catch (err) {
      assistantMessage.content = `[Error] ${err instanceof Error ? err.message : 'Unknown error'}`
      loading.value = false
      abortController.value = null
    }
    await refreshConversations()
  }

  async function loadConversation(id: number) {
    const persisted = await getAiMessages(id)
    conversationId.value = String(id)
    messages.value = persisted
      .filter((item) => item.role === 'user' || item.role === 'assistant')
      .map((item) => ({
        id: String(item.id),
        role: item.role as 'user' | 'assistant',
        content: item.content,
        createdAt: item.createdAt,
      }))
  }

  async function loadLatestConversation() {
    try {
      const items = await listAiConversations()
      conversations.value = items
      const latest = items[0]
      if (!latest) return
      await loadConversation(latest.id)
    } catch {
      // AI history is optional; the chat panel remains usable if Core is unavailable.
    }
  }

  async function refreshConversations() {
    try {
      conversations.value = await listAiConversations()
    } catch {
      // Conversation persistence is optional while Core is unavailable.
    }
  }

  function newConversation() {
    conversationId.value = null
    messages.value = []
    noteResult.value = ''
    noteError.value = ''
  }

  async function generateNote() {
    if (noteLoading.value) return
    noteLoading.value = true
    noteResult.value = ''
    noteError.value = ''
    try {
      let task = await generateAiNote(context.value)
      for (let attempt = 0; attempt < 60 && (task.status === 'PENDING' || task.status === 'RUNNING'); attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        task = await getAiNoteTask(task.taskId)
      }
      if (task.status === 'SUCCEEDED') noteResult.value = task.result ?? ''
      else noteError.value = task.error ?? '学习笔记生成失败'
    } catch (err) {
      noteError.value = err instanceof Error ? err.message : '学习笔记生成失败'
    } finally {
      noteLoading.value = false
    }
  }

  function cancel() {
    abortController.value?.abort()
    loading.value = false
    abortController.value = null
  }

  return {
    open, loading, messages, context, conversationId, conversations,
    noteLoading, noteResult, noteError,
    toggle, openPanel, setContext, send, loadLatestConversation, refreshConversations, loadConversation,
    newConversation, generateNote, cancel,
  }
})
