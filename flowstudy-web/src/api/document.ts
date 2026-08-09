import type {
  CreateDocumentFolderPayload,
  CreateDocumentPayload,
  DocumentCategory,
  DocumentDetail,
  DocumentFolder,
  DocumentItem,
  DocumentListResult,
  DocumentQuery,
  PublishDocumentPayload,
  UpdateDocumentPayload,
} from '../types/document'
import { request } from './request'

interface PageRecords<T> {
  records: T[]
  total: number
  page: number
  size: number
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  return request<DocumentCategory[]>('/documents/categories')
}

export async function getDocumentFolders(): Promise<DocumentFolder[]> {
  return request<DocumentFolder[]>('/documents/folders')
}

export async function createDocumentFolder(payload: CreateDocumentFolderPayload): Promise<DocumentFolder> {
  return request<DocumentFolder>('/documents/folders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getDocumentList(params: DocumentQuery): Promise<DocumentListResult> {
  const search = new URLSearchParams()
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 24))
  if (params.keyword?.trim()) search.set('keyword', params.keyword.trim())
  if (params.folderId != null) search.set('folderId', String(params.folderId))
  if (params.categoryId != null) search.set('categoryId', String(params.categoryId))
  if (params.tag?.trim()) search.set('tag', params.tag.trim())
  if (params.status) search.set('status', params.status)

  const page = await request<PageRecords<DocumentItem>>(`/documents?${search.toString()}`)
  return {
    list: page.records,
    total: page.total,
  }
}

export async function getDocumentDetail(id: number): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/documents/${id}`)
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDetail> {
  return request<DocumentDetail>('/documents', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateDocument(id: number, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function deleteDocument(id: number): Promise<void> {
  await request<null>(`/documents/${id}`, { method: 'DELETE' })
}

export async function deleteDocumentFolder(id: number): Promise<void> {
  await request<null>(`/documents/folders/${id}`, { method: 'DELETE' })
}

export async function publishDocument(id: number, payload: PublishDocumentPayload): Promise<DocumentDetail> {
  return request<DocumentDetail>(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      title: payload.title,
      summary: payload.summary,
      tags: payload.tags,
      status: 'published',
    }),
  })
}
