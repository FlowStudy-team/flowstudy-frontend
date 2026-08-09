export interface Tutorial {
  id: number
  title: string
  summary?: string
  coverUrl?: string
  authorName?: string
  blogCount?: number
  problemCount?: number
  viewCount?: number
  likeCount?: number
  sortOrder?: number
  tags: string[]
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  createdAt?: string
  updatedAt: string
}

export interface Blog {
  id: number
  tutorialId?: number | null
  title: string
  summary?: string
  coverUrl?: string
  authorId?: number
  authorName?: string
  sortOrder?: number
  estimatedMinutes?: number
  problemCount?: number
  problemIds: string[]
  viewCount?: number
  likeCount?: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}

export interface TutorialDetail {
  id: number
  title: string
  summary?: string
  markdown: string
  coverUrl?: string
  blogCount?: number
  problemCount?: number
  viewCount?: number
  likeCount?: number
  status?: string
  createdAt?: string
  updatedAt?: string
  blogs: Blog[]
}

export interface BlogDetail {
  id: number
  tutorialId?: number | null
  title: string
  contentMd?: string
  markdown: string
  sortOrder?: number
  estimatedMinutes?: number
  problemIds: string[]
  prevBlogId?: number | null
  nextBlogId?: number | null
  authorId?: number
  authorName?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
}
