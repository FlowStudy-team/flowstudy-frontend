import type { Blog, BlogDetail, Tutorial, TutorialDetail } from '../../types/article'
import type { PageQuery, PageResult } from '../../types/common'
import { request } from '../request'

interface CorePageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

type ContentId = number | string

export async function fetchTutorials(query: PageQuery): Promise<PageResult<Tutorial>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.pageSize),
  })
  if (query.keyword?.trim()) {
    params.set('keyword', query.keyword.trim())
  }

  const page = await request<CorePageResult<Tutorial>>(`/tutorials?${params.toString()}`)
  return {
    list: page.records,
    total: page.total,
    page: page.page,
    pageSize: page.size,
  }
}

export async function fetchBlogs(query: PageQuery): Promise<PageResult<Blog>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.pageSize),
  })
  if (query.keyword?.trim()) {
    params.set('keyword', query.keyword.trim())
  }

  const page = await request<CorePageResult<Blog>>(`/blogs?${params.toString()}`)
  return {
    list: page.records,
    total: page.total,
    page: page.page,
    pageSize: page.size,
  }
}

export async function fetchTutorialDetail(tutorialId: ContentId): Promise<TutorialDetail> {
  return request<TutorialDetail>(`/tutorials/${tutorialId}`)
}

export async function fetchBlogDetail(blogId: ContentId): Promise<BlogDetail> {
  return request<BlogDetail>(`/blogs/${blogId}`)
}
