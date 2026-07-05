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

export interface AiContext {
  tutorialTitle?: string
  blogTitle?: string
  problemTitle?: string
  problemDescription?: string
  language?: string
  userCode?: string
  submissionStatus?: string
  failedCaseInput?: string
  expectedOutput?: string
  actualOutput?: string
  compileMessage?: string
}
