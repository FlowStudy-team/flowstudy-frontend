export interface AiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface AiSession {
  id: string
  title: string
  messages: AiMessage[]
}
