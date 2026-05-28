import type { Article, ArticleDetail, ChapterDetail } from '../../types/article'
import type { PageQuery, PageResult } from '../../types/common'

const mockArticles: Article[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `a${i + 1}`,
  title: `Flow Architecture Practice ${i + 1}`,
  tags: i % 2 ? ['Vue3', 'Async'] : ['Algorithms', 'Backend'],
  difficulty: i % 3 === 0 ? 'Advanced' : i % 3 === 1 ? 'Intermediate' : 'Beginner',
  updatedAt: `2026-05-${String((i % 27) + 1).padStart(2, '0')}`,
}))

export async function fetchArticles(query: PageQuery): Promise<PageResult<Article>> {
  await new Promise((resolve) => setTimeout(resolve, 350))
  const filtered = mockArticles.filter((a) =>
    query.keyword ? a.title.toLowerCase().includes(query.keyword.toLowerCase()) : true,
  )
  const start = (query.page - 1) * query.pageSize
  return {
    list: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page: query.page,
    pageSize: query.pageSize,
  }
}

export async function fetchArticleDetail(articleId: string): Promise<ArticleDetail> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    id: articleId,
    title: `Article ${articleId.toUpperCase()} Deep Dive`,
    markdown: `# ${articleId.toUpperCase()}\n## Goals\n- Understand async judge flow\n- Connect article and problem context`,
    chapters: [
      { id: 'c1', title: 'Architecture', problemIds: ['p1001'] },
      { id: 'c2', title: 'Data Flow', problemIds: ['p1002'] },
    ],
  }
}

export async function fetchChapterDetail(
  articleId: string,
  chapterId: string,
): Promise<ChapterDetail> {
  await new Promise((resolve) => setTimeout(resolve, 280))
  return {
    id: chapterId,
    articleId,
    title: `Chapter ${chapterId.toUpperCase()}`,
    markdown: `## ${chapterId.toUpperCase()} Content\nThis chapter links reading with coding exercises.`,
    problemIds: ['p1001', 'p1002'],
  }
}
