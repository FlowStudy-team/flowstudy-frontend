import { request } from '../request'

export interface BlogDetail {
  id: number
  tutorialId?: number | null
  title: string
  contentMd: string
  markdown: string
  sortOrder: number
  estimatedMinutes?: number | null
  problems: Array<{ id: number; title: string; difficulty: string }>
  problemIds: string[]
  prevBlogId?: number | null
  nextBlogId?: number | null
}

export interface CreateBlogRequest {
  title: string
  contentMd: string
  summary?: string
  tutorialId?: number | null
  estimatedMinutes?: number | null
  status?: string
}

export async function createBlog(payload: CreateBlogRequest): Promise<BlogDetail> {
  return request<BlogDetail>('/blogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
