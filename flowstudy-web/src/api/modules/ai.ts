import type { AiContext } from '../../types/ai'

interface AskAiStreamParams {
  message: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  context: AiContext
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

export async function askAiStream(params: AskAiStreamParams): Promise<void> {
  const { message, history, context, onToken, onDone, onError } = params

  const response = await fetch('/ai/api/v1/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, context }),
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
        if (payload.type === 'token') {
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
