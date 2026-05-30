export type DocumentStatus = 'draft' | 'private' | 'published' | 'archived'

export interface DocumentItem {
  id: number
  title: string
  summary?: string
  categoryId?: number
  categoryName?: string
  tags: string[]
  status: DocumentStatus
  updatedAt: string
  createdAt: string
  publishedAt?: string
}

export interface DocumentDetail extends DocumentItem {
  content: string
}

export interface DocumentCategory {
  id: number
  name: string
  parentId?: number
  children?: DocumentCategory[]
}

export interface DocumentQuery {
  keyword?: string
  categoryId?: number
  tag?: string
  status?: DocumentStatus
  page?: number
  pageSize?: number
}

export interface CreateDocumentPayload {
  title: string
  content?: string
  categoryId?: number
  tags?: string[]
}

export interface UpdateDocumentPayload {
  title?: string
  content?: string
  summary?: string
  categoryId?: number
  tags?: string[]
  status?: DocumentStatus
}

export interface PublishDocumentPayload {
  title: string
  summary: string
  coverUrl?: string
  tags: string[]
  visible: boolean
  allowComment: boolean
}

export interface DocumentListResult {
  list: DocumentItem[]
  total: number
}

