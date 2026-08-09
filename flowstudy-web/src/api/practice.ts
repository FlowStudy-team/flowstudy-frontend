import { request } from './request'

type CoreDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

interface CoreProblemSummary {
  id: number
  blogId: number
  title: string
  difficulty: CoreDifficulty
  acceptedCount?: number
  submitCount?: number
}

interface CorePageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

export interface PracticeProblem {
  id: string
  blogId: number
  title: string
  difficulty: '简单' | '中等' | '困难'
  acceptedCount: number
  submitCount: number
}

const difficultyText: Record<CoreDifficulty, PracticeProblem['difficulty']> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

export async function fetchPracticeProblems(params: {
  page?: number
  pageSize?: number
  keyword?: string
  difficulty?: CoreDifficulty | ''
} = {}): Promise<{ list: PracticeProblem[]; total: number; page: number; pageSize: number }> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    size: String(params.pageSize ?? 100),
  })
  if (params.keyword?.trim()) {
    query.set('keyword', params.keyword.trim())
  }
  if (params.difficulty) {
    query.set('difficulty', params.difficulty)
  }

  const result = await request<CorePageResult<CoreProblemSummary>>(`/problems?${query.toString()}`)
  return {
    list: result.records.map((item) => ({
      id: String(item.id),
      blogId: item.blogId,
      title: item.title,
      difficulty: difficultyText[item.difficulty],
      acceptedCount: item.acceptedCount ?? 0,
      submitCount: item.submitCount ?? 0,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.size,
  }
}
