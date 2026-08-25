import type { AiContext } from '../../types/ai'
import { request } from '../request'
import { useAuthStore } from '../../store/modules/auth'

interface AskAiStreamParams {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  context: AiContext
  conversationId?: string | null
  onToken: (token: string) => void
  onConversationId: (conversationId: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function askAiStream(params: AskAiStreamParams): Promise<void> {
  const { message, history, context, conversationId, onToken, onDone, onError, onConversationId } = params
  const authStore = useAuthStore()

  const response = await fetch('/ai/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      'X-Device-Id': authStore.deviceId,
    },
    credentials: 'include',
    body: JSON.stringify({ message, history, context, conversationId }),
  })

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    onError(`AI service error: ${response.status} ${text}`)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError('Response body is not readable')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6)
      try {
        const payload = JSON.parse(jsonStr)
        if (payload.type === 'meta' && payload.conversationId) {
          onConversationId(payload.conversationId)
        } else if (payload.type === 'token') {
          onToken(payload.content)
        } else if (payload.type === 'done') {
          onDone()
          return
        } else if (payload.type === 'error') {
          onError(payload.message || 'Unknown AI error')
          return
        }
      } catch {
        // skip unparseable lines
      }
    }
  }

  onDone()
}

export interface ConversationSummary {
  id: number
  title: string | null
  status: string
  tutorialId: number | null
  blogId: number | null
  problemId: number | null
  createdAt: string
  updatedAt: string
}

export interface PersistedAiMessage {
  id: number
  conversationId: number
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  modelName: string | null
  traceId: string | null
  createdAt: string
}

export function listAiConversations() {
  return request<ConversationSummary[]>('/ai/conversations')
}

export function getAiMessages(conversationId: number) {
  return request<PersistedAiMessage[]>(`/ai/conversations/${conversationId}/messages`)
}

export interface NoteTaskResponse {
  taskId: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  result?: string | null
  error?: string | null
}

export async function generateAiNote(context: AiContext) {
  const authStore = useAuthStore()
  const response = await fetch('/ai/api/v1/ai/notes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      'X-Device-Id': authStore.deviceId,
    },
    credentials: 'include',
    body: JSON.stringify({ context }),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload) throw new Error(`AI note generation failed: ${response.status}`)
  return payload as NoteTaskResponse
}

export async function getAiNoteTask(taskId: string) {
  const authStore = useAuthStore()
  const response = await fetch(`/ai/api/v1/ai/notes/tasks/${taskId}`, {
    headers: {
      ...(authStore.token ? { Authorization: `Bearer ${authStore.token}` } : {}),
      'X-Device-Id': authStore.deviceId,
    },
    credentials: 'include',
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload) throw new Error(`AI note task query failed: ${response.status}`)
  return payload as NoteTaskResponse
}
