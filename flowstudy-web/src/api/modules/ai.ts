import type { AiMessage } from '../../types/ai'

export async function askAi(prompt: string): Promise<AiMessage> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return {
    id: `m-${Date.now()}`,
    role: 'assistant',
    content: `Suggested direction for "${prompt}": split the problem, verify constraints, then test edge cases.`,
    createdAt: new Date().toISOString(),
  }
}
