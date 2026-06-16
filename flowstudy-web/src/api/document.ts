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

let documentIdSeed = 1004
let folderIdSeed = 6

const categories: DocumentCategory[] = [
  { id: 1, name: '算法笔记' },
  { id: 2, name: '后端开发' },
  { id: 3, name: '前端开发' },
]

const folders: DocumentFolder[] = [
  {
    id: 1,
    name: '学习笔记',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: '算法专题',
    parentId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: '工程实践',
    parentId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: '项目草稿',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: '发布归档',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const documents: DocumentDetail[] = [
  {
    id: 1001,
    title: '背包问题学习笔记',
    summary: '记录动态规划背包问题的状态定义、转移方程和模板。',
    folderId: 2,
    folderName: '算法专题',
    categoryId: 1,
    categoryName: '算法笔记',
    tags: ['DP', '算法', '刷题'],
    status: 'private',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: '# 背包问题\n\n## 01 背包\n\n- 状态定义\n- 状态转移\n\n## 完全背包\n\n从容量小到大枚举。',
  },
  {
    id: 1002,
    title: 'Vue3 组件设计实践',
    summary: '记录 FlowStudy 中组件拆分、组合式逻辑和状态复用策略。',
    folderId: 3,
    folderName: '工程实践',
    categoryId: 3,
    categoryName: '前端开发',
    tags: ['Vue3', '组件化'],
    status: 'published',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    content: '# Vue3 组件设计实践\n\n## 设计原则\n\n- 单一职责\n- 可复用\n- 类型清晰\n\n## 页面组织\n\n复杂逻辑放到 composable。',
  },
  {
    id: 1003,
    title: 'OJ 编辑器设计草稿',
    summary: '记录 OJ 编辑区布局、Monaco 配置和交互实现要点。',
    folderId: 4,
    folderName: '项目草稿',
    categoryId: 2,
    categoryName: '后端开发',
    tags: ['OJ', 'Monaco'],
    status: 'draft',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    content: '# OJ 编辑器设计草稿\n\n## 目标\n\n让代码编辑、题面和运行结果可以并行查看。\n\n## 待办\n\n- 保存草稿\n- 快捷运行',
  },
]

function sleep(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toItem(detail: DocumentDetail): DocumentItem {
  const { content: _content, ...item } = detail
  return item
}

function cloneFolders(items: DocumentFolder[]): DocumentFolder[] {
  return items.map((item) => ({
    ...item,
    children: item.children ? cloneFolders(item.children) : undefined,
  }))
}

function buildFolderTree(parentId?: number): DocumentFolder[] {
  return folders
    .filter((folder) => folder.parentId === parentId)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'))
    .map((folder) => ({
      ...folder,
      children: buildFolderTree(folder.id),
    }))
}

function getFolderName(folderId?: number) {
  if (!folderId) return undefined
  return folders.find((folder) => folder.id === folderId)?.name
}

export async function getDocumentCategories(): Promise<DocumentCategory[]> {
  await sleep()
  return categories.map((category) => ({ ...category }))
}

export async function getDocumentFolders(): Promise<DocumentFolder[]> {
  await sleep()
  return cloneFolders(buildFolderTree())
}

export async function createDocumentFolder(payload: CreateDocumentFolderPayload): Promise<DocumentFolder> {
  await sleep()
  const name = payload.name.trim()
  if (!name) throw new Error('请输入文件夹名称')
  const duplicated = folders.some((folder) => folder.parentId === payload.parentId && folder.name === name)
  if (duplicated) throw new Error('同级文件夹已存在')
  const now = new Date().toISOString()
  const created: DocumentFolder = {
    id: ++folderIdSeed,
    name,
    parentId: payload.parentId,
    createdAt: now,
    updatedAt: now,
  }
  folders.push(created)
  return { ...created }
}

export async function getDocumentList(params: DocumentQuery): Promise<DocumentListResult> {
  await sleep()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  let filtered = documents.slice()

  if (params.keyword?.trim()) {
    const keyword = params.keyword.trim().toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.summary?.toLowerCase().includes(keyword) ||
        item.content.toLowerCase().includes(keyword),
    )
  }
  if (params.folderId) {
    filtered = filtered.filter((item) => item.folderId === params.folderId)
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
  return { ...found, tags: found.tags.slice() }
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const category = categories.find((categoryItem) => categoryItem.id === payload.categoryId)
  const now = new Date().toISOString()
  const created: DocumentDetail = {
    id: ++documentIdSeed,
    title: payload.title,
    summary: '',
    folderId: payload.folderId,
    folderName: getFolderName(payload.folderId),
    categoryId: payload.categoryId,
    categoryName: category?.name,
    tags: payload.tags ?? [],
    status: 'draft',
    updatedAt: now,
    createdAt: now,
    content: payload.content ?? '',
  }
  documents.unshift(created)
  return { ...created, tags: created.tags.slice() }
}

export async function updateDocument(id: number, payload: UpdateDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const index = documents.findIndex((item) => item.id === id)
  if (index < 0) throw new Error('文档不存在')
  const category = categories.find((categoryItem) => categoryItem.id === payload.categoryId)
  const current = documents[index]
  const next: DocumentDetail = {
    ...current,
    ...payload,
    folderName: payload.folderId !== undefined ? getFolderName(payload.folderId) : current.folderName,
    categoryName: payload.categoryId !== undefined ? category?.name : current.categoryName,
    updatedAt: new Date().toISOString(),
  }
  documents[index] = next
  return { ...next, tags: next.tags.slice() }
}

export async function deleteDocument(id: number): Promise<void> {
  await sleep()
  const index = documents.findIndex((item) => item.id === id)
  if (index >= 0) documents.splice(index, 1)
}

export async function publishDocument(id: number, payload: PublishDocumentPayload): Promise<DocumentDetail> {
  await sleep()
  const index = documents.findIndex((item) => item.id === id)
  if (index < 0) throw new Error('文档不存在')
  const next: DocumentDetail = {
    ...documents[index],
    title: payload.title,
    summary: payload.summary,
    tags: payload.tags,
    status: 'published',
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  }
  documents[index] = next
  return { ...next, tags: next.tags.slice() }
}
