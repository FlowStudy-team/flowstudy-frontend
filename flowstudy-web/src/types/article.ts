export interface Article {
  id: string
  title: string
  tags: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  updatedAt: string
}

export interface Chapter {
  id: string
  title: string
  problemIds: string[]
}

export interface ArticleDetail {
  id: string
  title: string
  markdown: string
  chapters: Chapter[]
}

export interface ChapterDetail {
  id: string
  articleId: string
  title: string
  markdown: string
  problemIds: string[]
}
