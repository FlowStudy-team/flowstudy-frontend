import type { PageQuery, PageResult } from '../../types/common'
import type { SubmissionDetail } from '../../types/problem'
import { request } from '../request'

interface CorePageResponse<T> {
  records: T[]
  total: number
  page: number
  size: number
}

interface CoreSubmissionSummary {
  submitId: number
  problemId: number
  problemTitle: string
  language: string
  status: SubmissionDetail['status']
  timeUsedMs?: number | null
  memoryUsedKb?: number | null
  score?: number | null
  createdAt: string
}

export async function fetchMySubmissions(query: PageQuery): Promise<PageResult<SubmissionDetail>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.pageSize),
  })
  if (query.keyword && /^\d+$/.test(query.keyword.trim())) {
    params.set('problemId', query.keyword.trim())
  }
  const page = await request<CorePageResponse<CoreSubmissionSummary>>(`/submissions/my?${params.toString()}`)
  return {
    list: page.records.map((item) => ({
      id: String(item.submitId),
      problemId: String(item.problemId),
      problemTitle: item.problemTitle,
      status: item.status,
      runtimeMs: item.timeUsedMs ?? undefined,
      memoryKb: item.memoryUsedKb ?? undefined,
      score: item.score ?? undefined,
      language: item.language,
      createdAt: item.createdAt,
      testCases: [],
    })),
    total: page.total,
    page: page.page,
    pageSize: page.size,
  }
}
