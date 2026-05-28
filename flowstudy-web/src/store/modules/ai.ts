import { defineStore } from 'pinia'
import { askAi } from '../../api/modules/ai'
import type { AiMessage } from '../../types/ai'

interface AiState {
  open: boolean
  loading: boolean
  messages: AiMessage[]
}

export const useAiStore = defineStore('ai', {
  state: (): AiState => ({
    open: false,
    loading: false,
    messages: [],
  }),
  actions: {
    toggle() {
      this.open = !this.open
    },
    openPanel() {
      this.open = true
    },
    async send(prompt: string) {
      if (!prompt.trim()) return
      this.messages.push({
        id: `u-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
      })
      this.loading = true
      try {
        const reply = await askAi(prompt)
        this.messages.push(reply)
      } finally {
        this.loading = false
      }
    },
  },
})
