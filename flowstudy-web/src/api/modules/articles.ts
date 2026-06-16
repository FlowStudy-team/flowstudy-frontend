import type { Article, ArticleDetail, ChapterDetail } from '../../types/article'
import type { PageQuery, PageResult } from '../../types/common'
import { request } from '../request'

interface CorePageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

type ArticleId = number | string

export async function fetchArticles(query: PageQuery): Promise<PageResult<Article>> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.pageSize),
  })
  if (query.keyword?.trim()) {
    params.set('keyword', query.keyword.trim())
  }

  const page = await request<CorePageResult<Article>>(`/articles?${params.toString()}`)
  return {
    list: page.records,
    total: page.total,
    page: page.page,
    pageSize: page.size,
  }
}

export async function fetchArticleDetail(articleId: ArticleId): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/articles/${articleId}`)
}

export async function fetchChapterDetail(
  _articleId: ArticleId,
  chapterId: ArticleId,
): Promise<ChapterDetail> {
  return request<ChapterDetail>(`/chapters/${chapterId}`)
}
