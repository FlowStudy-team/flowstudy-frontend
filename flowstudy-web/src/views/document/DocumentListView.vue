<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import JSZip from 'jszip'
import { createDocument as createDocumentApi, createDocumentFolder, deleteDocumentFolder, getDocumentFolders } from '../../api/document'
import DocumentFileGrid from '../../components/document/DocumentFileGrid.vue'
import DocumentFolderDialog from '../../components/document/DocumentFolderDialog.vue'
import DocumentFolderTree from '../../components/document/DocumentFolderTree.vue'
import { useDocumentList } from '../../composables/useDocumentList'
import type { DocumentFolder } from '../../types/document'

const router = useRouter()
const folders = ref<DocumentFolder[]>([])
const folderLoading = ref(false)
const folderError = ref('')
const folderDialogOpen = ref(false)
const folderSaving = ref(false)
const folderDialogError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const importing = ref(false)
const importProgress = ref('')
const importError = ref('')
const expandedIds = ref<number[]>([])

const { loading, error, list, total, query, fetchList, resetQuery, setFolder, changePage } = useDocumentList()

const selectedFolder = computed(() => findFolder(folders.value, query.folderId))
const visibleFolders = computed(() => {
  if (!query.folderId) return folders.value
  return selectedFolder.value?.children ?? []
})

function findFolder(items: DocumentFolder[], id?: number): DocumentFolder | undefined {
  if (!id) return undefined
  for (const item of items) {
    if (item.id === id) return item
    const child = findFolder(item.children ?? [], id)
    if (child) return child
  }
  return undefined
}

function collectFolderIds(items: DocumentFolder[], output: number[] = []) {
  for (const item of items) {
    output.push(item.id)
    collectFolderIds(item.children ?? [], output)
  }
  return output
}

async function loadFolders() {
  folderLoading.value = true
  folderError.value = ''
  try {
    folders.value = await getDocumentFolders()
    if (expandedIds.value.length === 0) {
      expandedIds.value = collectFolderIds(folders.value)
    }
  } catch (err) {
    folderError.value = err instanceof Error ? err.message : '加载文件夹失败'
  } finally {
    folderLoading.value = false
  }
}

async function search() {
  query.page = 1
  await fetchList()
}

async function reset() {
  resetQuery()
  await fetchList()
}

async function selectFolder(folderId?: number) {
  setFolder(folderId)
  await fetchList()
}

function toggleFolder(folderId: number) {
  expandedIds.value = expandedIds.value.includes(folderId)
    ? expandedIds.value.filter((id) => id !== folderId)
    : [...expandedIds.value, folderId]
}

function openFolder(folderId: number) {
  if (!expandedIds.value.includes(folderId)) {
    expandedIds.value = [...expandedIds.value, folderId]
  }
  void selectFolder(folderId)
}

async function handleDeleteFolder(folderId: number) {
  if (!confirm('确定删除该文件夹吗？文件夹内的文档不会被删除。')) return
  try {
    await deleteDocumentFolder(folderId)
    await loadFolders()
    if (query.folderId === folderId) {
      await selectFolder(undefined)
    }
    await fetchList()
  } catch (err) {
    folderError.value = err instanceof Error ? err.message : '删除文件夹失败'
  }
}

function openDocument(id: number) {
  router.push(`/document/${id}`)
}

function createDocument() {
  const queryText = query.folderId ? { folderId: String(query.folderId) } : undefined
  router.push({ path: '/document/workspace', query: queryText })
}

async function submitFolder(name: string) {
  folderSaving.value = true
  folderDialogError.value = ''
  try {
    const created = await createDocumentFolder({
      name,
      parentId: query.folderId,
    })
    folderDialogOpen.value = false
    await loadFolders()
    await selectFolder(query.folderId)
    if (created.parentId && !expandedIds.value.includes(created.parentId)) {
      expandedIds.value = [...expandedIds.value, created.parentId]
    }
  } catch (err) {
    folderDialogError.value = err instanceof Error ? err.message : '创建文件夹失败'
  } finally {
    folderSaving.value = false
  }
}

async function nextPage(page: number) {
  changePage(page)
  await fetchList()
}

function triggerImport() {
  importError.value = ''
  importProgress.value = ''
  fileInput.value?.click()
}

function extractMdTitle(content: string, filename: string): string {
  const heading = content.match(/^#\s+(.+)$/m)
  if (heading) return heading[1].trim()
  return filename.replace(/\.md$/i, '')
}

async function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const isMd = file.name.endsWith('.md')
  const isZip = file.name.endsWith('.zip')

  if (!isMd && !isZip) {
    importError.value = '仅支持 .md 或 .zip 文件'
    input.value = ''
    return
  }

  importing.value = true
  importError.value = ''
  importProgress.value = ''

  let firstDocId: number | null = null

  try {
    if (isMd) {
      importProgress.value = '正在导入 1 个文件...'
      const content = await readFileAsText(file)
      const title = extractMdTitle(content, file.name)
      const doc = await createDocumentApi({
        title,
        content: content,
        folderId: query.folderId,
      })
      firstDocId = doc.id
      importProgress.value = '导入完成：1 个文件'
    } else {
      const zip = await JSZip.loadAsync(file)
      const mdFiles = Object.keys(zip.files).filter(
        (name) => name.endsWith('.md') && !zip.files[name].dir,
      )
      if (mdFiles.length === 0) {
        importError.value = '压缩包中没有找到 .md 文件'
        importing.value = false
        input.value = ''
        return
      }

      // Collect unique directory paths and create folders
      const dirSet = new Set<string>()
      for (const name of mdFiles) {
        const dir = name.substring(0, name.lastIndexOf('/'))
        if (dir) dirSet.add(dir)
      }

      // Create folders ordered by depth (parent before child)
      const sortedDirs = [...dirSet].sort((a, b) => a.split('/').length - b.split('/').length)
      const folderIdMap = new Map<string, number>()

      for (const dir of sortedDirs) {
        const parts = dir.split('/')
        const parentDir = parts.slice(0, -1).join('/')
        const parentId = parentDir ? folderIdMap.get(parentDir) : query.folderId
        importProgress.value = `正在创建文件夹：${parts[parts.length - 1]}`
        const folder = await createDocumentFolder({ name: parts[parts.length - 1], parentId })
        folderIdMap.set(dir, folder.id)
      }

      // Create documents in their respective folders
      let done = 0
      for (const name of mdFiles) {
        importProgress.value = `正在导入 ${done + 1}/${mdFiles.length}：${name}`
        const dir = name.substring(0, name.lastIndexOf('/'))
        const folderId = dir ? folderIdMap.get(dir) : query.folderId
        const content = await zip.files[name].async('text')
        const title = extractMdTitle(content, name)
        const doc = await createDocumentApi({ title, content, folderId })
        if (!firstDocId) firstDocId = doc.id
        done++
      }
      importProgress.value = `导入完成：${mdFiles.length} 个文件`
    }

    await loadFolders()
    await fetchList()
    if (firstDocId) {
      router.push(`/document/${firstDocId}`)
    }
  } catch (err) {
    importError.value = err instanceof Error ? err.message : '导入失败'
  } finally {
    importing.value = false
    input.value = ''
  }
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

onMounted(async () => {
  await Promise.all([loadFolders(), fetchList()])
})
</script>

<template>
  <section class="document-finder-page">
    <aside class="document-finder-sidebar">
      <div class="finder-sidebar-head">
        <strong>文档中心</strong>
        <button class="icon-btn" type="button" title="新建文件夹" @click="folderDialogOpen = true">＋</button>
      </div>
      <div v-if="folderLoading" class="finder-sidebar-state">加载中...</div>
      <div v-else-if="folderError" class="finder-sidebar-state error-text">{{ folderError }}</div>
      <DocumentFolderTree
        v-else
        :folders="folders"
        :selected-id="query.folderId"
        :expanded-ids="expandedIds"
        @select="selectFolder"
        @toggle="toggleFolder"
        @delete="handleDeleteFolder"
      />
    </aside>

    <main class="document-finder-main">
      <header class="document-finder-toolbar">
        <div>
          <p class="muted">当前位置</p>
          <h1>{{ selectedFolder?.name || '全部文档' }}</h1>
        </div>
        <div class="finder-toolbar-actions">
          <input v-model="query.keyword" placeholder="搜索文档标题、摘要或内容" @keydown.enter="search" />
          <button class="secondary-btn" type="button" @click="search">搜索</button>
          <button class="secondary-btn" type="button" @click="reset">重置</button>
          <button class="secondary-btn" type="button" @click="folderDialogOpen = true">新建文件夹</button>
          <button class="primary-btn" type="button" @click="createDocument">新建文档</button>
          <button class="secondary-btn" type="button" :disabled="importing" @click="triggerImport">
            {{ importing ? '导入中...' : '导入 Markdown' }}
          </button>
          <input
            ref="fileInput"
            type="file"
            accept=".md,.markdown,.zip"
            style="display: none"
            @change="handleFileImport"
          />
        </div>
      </header>

      <div v-if="importProgress || importError" class="card" :class="{ 'error-box': importError }" style="margin-bottom: 12px;">
        <span :style="{ color: importError ? '#d44' : '#10b981' }">{{ importProgress || importError }}</span>
      </div>

      <div v-if="loading" class="card">加载中...</div>
      <div v-else-if="error" class="card error-box">
        <span>{{ error }}</span>
        <button class="secondary-btn" type="button" @click="fetchList">重试</button>
      </div>
      <DocumentFileGrid
        v-else
        :folders="visibleFolders"
        :documents="list"
        :loading="loading"
        @open-folder="openFolder"
        @open-document="openDocument"
      />

      <div class="document-pagination" v-if="total > (query.pageSize ?? 24)">
        <button class="secondary-btn" :disabled="(query.page ?? 1) <= 1" @click="nextPage((query.page ?? 1) - 1)">
          上一页
        </button>
        <span>第 {{ query.page ?? 1 }} 页</span>
        <button
          class="secondary-btn"
          :disabled="(query.page ?? 1) * (query.pageSize ?? 24) >= total"
          @click="nextPage((query.page ?? 1) + 1)"
        >
          下一页
        </button>
      </div>
    </main>

    <DocumentFolderDialog
      :open="folderDialogOpen"
      :parent-name="selectedFolder?.name"
      :loading="folderSaving"
      :error="folderDialogError"
      @close="folderDialogOpen = false"
      @submit="submitFolder"
    />
  </section>
</template>
