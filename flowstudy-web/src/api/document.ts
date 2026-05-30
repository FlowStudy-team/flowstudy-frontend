import type {
  CreateDocumentPayload,
  DocumentCategory,
  DocumentDetail,
  DocumentItem,
  DocumentListResult,
  DocumentQuery,
  PublishDocumentPayload,
  UpdateDocumentPayload,
} from '../types/document'

let idSeed = 1004

const categories: DocumentCategory[] = [
  { id: 1, name: '算法笔记' },
  { id: 2, name: '后端开发' },
  { id: 3, name: '前端开发' },
]

const documents: DocumentDetail[] = [
  {
    id: 1001,
    title: '背包问题学习笔记',
    summary: '用于记录动态规划背包问题的核心解法与模板。',
    categoryId: 1,
    categoryName: '算法笔记',
    tags: ['DP', '算法', '刷题'],
    status: 'private',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: '# 背包问题\n\n## 01 背包\n\n- 状态定义\n- 状态转移',
  },
  {
    id: 1002,
    title: 'Vue3 组件设计实践',
    summary: '记录在 FlowStudy 中组件拆分与复用策略。',
    categoryId: 3,
    categoryName: '前端开发',
    tags: ['Vue3', '组件化'],
    status: 'published',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    content: '# Vue3 组件设计实践\n\n## 设计原则\n\n- 单一职责\n- 可复用',
  },
  {
    id: 1003,
    title: 'OJ 编辑器设计草稿',
    summary: '记录 OJ 编辑区布局与交互实现要点。',
    categoryId: 2,
    categoryName: '后端开发',
    tags: ['OJ', 'Monaco'],
    status: 'draft',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: '# OJ 编辑器设计草稿\n\n待完善...',
  },
]

function sleep(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toItem(detail: DocumentDetail): DocumentItem {
  const { content: _content, ...item } = detail
  return item
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  await sleep()
  return categories
}

export async function getDocumentList(params: DocumentQuery): Promise<DocumentListResult> {
  await sleep()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  let filtered = documents.slice()

  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.summary?.toLowerCase().includes(kw) ||
        item.content.toLowerCase().includes(kw),
    )
  }
  if (params.categoryId) {
    filtered = filtered.filter((item) => item.categoryId === params.categoryId)
  }
  if (params.tag?.trim()) {
    filtered = filtered.filter((item) => item.tags.includes(params.tag!.trim()))
  }
  if (params.status) {
    filtered = filtered.filter((item) => item.status === params.status)
  }

  filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const total = filtered.length
  const list = filtered.slice((page - 1) * pageSize, page * pageSize).map(toItem)
  return { list, total }
}

export async function getDocumentDetail(id: number): Promise<DocumentDetail> {
  await sleep()
  const found = documents.find((item) => item.id === id)
  if (!found) throw new Error('文档不存在')
  return { ...found }
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const category = categories.find((c) => c.id === payload.categoryId)
  const now = new Date().toISOString()
  const created: DocumentDetail = {
    id: ++idSeed,
    title: payload.title,
    summary: '',
    categoryId: payload.categoryId,
    categoryName: category?.name,
    tags: payload.tags ?? [],
    status: 'draft',
    updatedAt: now,
    createdAt: now,
    content: payload.content ?? '',
  }
  documents.unshift(created)
  return { ...created }
}

export async function updateDocument(id: number, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const idx = documents.findIndex((item) => item.id === id)
  if (idx < 0) throw new Error('文档不存在')
  const category = categories.find((c) => c.id === payload.categoryId)
  const current = documents[idx]
  const next: DocumentDetail = {
    ...current,
    ...payload,
    categoryName: payload.categoryId ? category?.name : current.categoryName,
    updatedAt: new Date().toISOString(),
  }
  documents[idx] = next
  return { ...next }
}

export async function deleteDocument(id: number): Promise<void> {
  await sleep()
  const idx = documents.findIndex((item) => item.id === id)
  if (idx >= 0) documents.splice(idx, 1)
}

export async function publishDocument(id: number, payload: PublishDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const idx = documents.findIndex((item) => item.id === id)
  if (idx < 0) throw new Error('文档不存在')
  const next: DocumentDetail = {
    ...documents[idx],
    title: payload.title,
    summary: payload.summary,
    tags: payload.tags,
    status: 'published',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  }
  documents[idx] = next
  return { ...next }
}
