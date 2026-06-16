export interface Article {
  id: number
  title: string
  summary?: string
  coverUrl?: string
  authorName?: string
  chapterCount?: number
  problemCount?: number
  viewCount?: number
  likeCount?: number
  sortOrder?: number
  tags: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt?: string
  updatedAt: string
}

export interface Chapter {
  id: number
  articleId?: number
  title: string
  sortOrder?: number
  estimatedMinutes?: number
  problemCount?: number
  problemIds: string[]
}

export interface ArticleDetail {
  id: number
  title: string
  summary?: string
  markdown: string
  coverUrl?: string
  chapterCount?: number
  problemCount?: number
  viewCount?: number
  likeCount?: number
  status?: string
  createdAt?: string
  updatedAt?: string
  chapters: Chapter[]
}

export interface ChapterDetail {
  id: number
  articleId: number
  title: string
  contentMd?: string
  markdown: string
  sortOrder?: number
  estimatedMinutes?: number
  problemIds: string[]
  prevChapterId?: number | null
  nextChapterId?: number | null
}
