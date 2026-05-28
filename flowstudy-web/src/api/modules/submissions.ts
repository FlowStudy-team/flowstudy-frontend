import type { PageQuery, PageResult } from '../../types/common'
import type { SubmissionDetail } from '../../types/problem'

const mockStatuses: SubmissionDetail['status'][] = ['AC', 'WA', 'TLE', 'RE', 'CE']

const mockSubmissions: SubmissionDetail[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `sub-${i + 1}`,
  problemId: `p10${(i % 5) + 1}`,
  status: mockStatuses[i % mockStatuses.length],
  runtimeMs: 20 + i,
  memoryKb: 2200 + i * 11,
  language: ['TypeScript', 'Go', 'Java'][i % 3],
  createdAt: `2026-05-${String((i % 27) + 1).padStart(2, '0')}T10:00:00.000Z`,
  testCases: [{ index: 1, status: 'AC', runtimeMs: 10, memoryKb: 1200 }],
}))

export async function fetchMySubmissions(query: PageQuery): Promise<PageResult<SubmissionDetail>> {
  await new Promise((resolve) => setTimeout(resolve, 340))
  const filtered = mockSubmissions.filter((item) =>
    query.keyword ? item.problemId.includes(query.keyword) || item.id.includes(query.keyword) : true,
  )
  const start = (query.page - 1) * query.pageSize
  return {
    list: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
  }
}
