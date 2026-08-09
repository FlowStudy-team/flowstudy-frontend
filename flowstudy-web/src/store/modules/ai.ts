import { defineStore } from 'pinia'
import { ref } from 'vue'
import { askAiStream } from '../../api/modules/ai'
import type { AiMessage, AiContext } from '../../types/ai'

export const useAiStore = defineStore('ai', () => {
  const open = ref(false)
  const loading = ref(false)
  const messages = ref<AiMessage[]>([])
  const context = ref<AiContext>({})
  const abortController = ref<AbortController | null>(null)

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
  }

  function cancel() {
    abortController.value?.abort()
    loading.value = false
    abortController.value = null
  }

  return { open, loading, messages, context, toggle, openPanel, setContext, send, cancel }
})
