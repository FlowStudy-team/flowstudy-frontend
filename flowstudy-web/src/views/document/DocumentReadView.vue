<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import DocumentPublishDialog from '../../components/document/DocumentPublishDialog.vue'
import MarkdownEditor, { type MarkdownEditorMode } from '../../components/markdown/MarkdownEditor.vue'
import { useAutoSave } from '../../composables/useAutoSave'
import { useDocumentEditor } from '../../composables/useDocumentEditor'
import { useAuthStore } from '../../store/modules/auth'
import type { PublishDocumentPayload } from '../../types/document'

interface TocNode {
  title: string
  id: string
  level: 1 | 2 | 3
  children?: TocNode[]
}

const route = useRoute()
const authStore = useAuthStore()

const showAi = ref(true)
const aiWidth = ref(360)
const activeAnchor = ref('')
const publishOpen = ref(false)
const editorMode = ref<MarkdownEditorMode>('simple')

const { loading, saving, error, document, form, dirty, loadDocument, saveDocument, publishCurrent } = useDocumentEditor()

const documentId = computed(() => Number(route.params.id))
const isAuthed = computed(() => authStore.isAuthenticated)
const draftKey = computed(() => `document:draft:${documentId.value}`)

const { lastSavedAt, restoreDraft, clearDraft } = useAutoSave(
  () => draftKey.value,
  () => ({
    title: form.title,
    content: form.content,
    summary: form.summary,
    folderId: form.folderId,
    categoryId: form.categoryId,
    tags: form.tags,
    updatedAt: new Date().toISOString(),
  }),
)

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
}

const tocTree = computed<TocNode[]>(() => {
  const lines = form.content.split('\n')
  const roots: TocNode[] = []
  let lastLv1: TocNode | null = null
  let lastLv2: TocNode | null = null
  const used = new Map<string, number>()

  for (const line of lines) {
    const matched = /^(#{1,3})\s+(.+)$/.exec(line.trim())
    if (!matched) continue
    const level = matched[1].length as 1 | 2 | 3
    const rawTitle = matched[2]
    const base = slugify(rawTitle) || 'section'
    const count = (used.get(base) ?? 0) + 1
    used.set(base, count)
    const id = count > 1 ? `${base}-${count}` : base
    const node: TocNode = { title: rawTitle, id, level, children: [] }
    if (level === 1) {
      roots.push(node)
      lastLv1 = node
      lastLv2 = null
      continue
    }
    if (level === 2) {
      if (!lastLv1) roots.push(node)
      else lastLv1.children?.push(node)
      lastLv2 = node
      continue
    }
    if (lastLv2) lastLv2.children?.push(node)
    else if (lastLv1) lastLv1.children?.push(node)
    else roots.push(node)
  }
  return roots
})

async function fetchDetail() {
  if (Number.isNaN(documentId.value)) return
  await loadDocument(documentId.value)
  const draft = restoreDraft()
  if (!draft) return
  form.title = draft.title
  form.content = draft.content
  form.summary = draft.summary ?? form.summary
  form.folderId = draft.folderId ?? form.folderId
  form.categoryId = draft.categoryId ?? form.categoryId
  form.tags = draft.tags ?? form.tags
}

async function handleSave() {
  const saved = await saveDocument()
  if (!saved) return
  clearDraft()
}

async function submitPublish(payload: PublishDocumentPayload) {
  const saved = document.value ?? (await saveDocument())
  if (!saved) return
  await publishCurrent(payload)
  publishOpen.value = false
  clearDraft()
}

function scrollToAnchor(id: string) {
  activeAnchor.value = id
}

function beforeUnloadHandler(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
}

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm('当前文档还有未保存内容，确定离开吗？')
})

watch(
  () => route.params.id,
  async () => {
    await fetchDetail()
  },
)

onMounted(async () => {
  await fetchDetail()
  window.addEventListener('beforeunload', beforeUnloadHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnloadHandler)
})
</script>

<template>
  <section class="reader-page document-content-page">
    <div class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink to="/practice">算法练习</RouterLink>
          <RouterLink to="/document" class="active">文档中心</RouterLink>
        </nav>
        <div class="jg-actions">
          <RouterLink class="secondary-btn link-btn" to="/document">返回文档</RouterLink>
          <button class="secondary-btn" type="button" :disabled="saving || loading" @click="handleSave">
            {{ saving ? '保存中...' : '保存' }}
          </button>
          <button class="primary-btn" type="button" :disabled="saving || loading" @click="publishOpen = true">发布</button>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/login">登录</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <div
        class="reader-layout ai-sidebar-host"
        :style="{ gridTemplateColumns: `320px minmax(0,1fr) ${showAi ? `${aiWidth + 8}px` : '48px'}` }"
      >
        <aside class="reader-sidebar">
          <h3>文档目录</h3>
          <p class="reader-section-index">{{ form.title || '当前文档' }}</p>
          <ul v-if="tocTree.length">
            <li v-for="lv1 in tocTree" :key="lv1.id" class="reader-node">
              <button type="button" class="reader-node-btn" :class="{ active: activeAnchor === lv1.id }" @click="scrollToAnchor(lv1.id)">
                <span>{{ lv1.title }}</span>
              </button>
              <ul v-if="lv1.children?.length" class="reader-sublist">
                <li v-for="lv2 in lv1.children" :key="lv2.id">
                  <button type="button" class="reader-lv2-link" :class="{ active: activeAnchor === lv2.id }" @click="scrollToAnchor(lv2.id)">
                    {{ lv2.title }}
                  </button>
                  <ul v-if="lv2.children?.length" class="reader-third-list">
                    <li v-for="lv3 in lv2.children" :key="lv3.id">
                      <button type="button" class="reader-lv3-link" :class="{ active: activeAnchor === lv3.id }" @click="scrollToAnchor(lv3.id)">
                        {{ lv3.title }}
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <p v-else class="muted">暂无标题目录</p>
        </aside>

        <article class="reader-content document-editor-content">
          <div v-if="loading" class="card">加载中...</div>
          <div v-else-if="error" class="card error-box">
            <span>{{ error }}</span>
            <button class="secondary-btn" @click="fetchDetail">重试</button>
          </div>
          <template v-else>
            <div class="document-content-head">
              <input v-model="form.title" class="document-title-input" placeholder="请输入文档标题" />
              <div class="document-mode-switch" role="group" aria-label="编辑模式">
                <button type="button" :class="{ active: editorMode === 'simple' }" @click="editorMode = 'simple'">普通编辑</button>
                <button type="button" :class="{ active: editorMode === 'professional' }" @click="editorMode = 'professional'">
                  专业编辑
                </button>
              </div>
            </div>
            <div class="document-inline-actions">
              <RouterLink class="secondary-btn link-btn" to="/document">返回文档</RouterLink>
              <button class="secondary-btn" type="button" :disabled="saving || loading" @click="handleSave">
                {{ saving ? '保存中...' : '保存' }}
              </button>
              <button class="primary-btn" type="button" :disabled="saving || loading" @click="publishOpen = true">发布</button>
            </div>
            <p class="lead">
              文件夹：{{ document?.folderName || '未归档' }} · 标签：{{ form.tags.join(' / ') || '暂无' }} ·
              {{ lastSavedAt ? `草稿 ${lastSavedAt.slice(11, 19)}` : `更新 ${document?.updatedAt?.slice(0, 10) || '-'}` }}
            </p>
            <MarkdownEditor v-model="form.content" :mode="editorMode" />
          </template>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>

    <DocumentPublishDialog
      :open="publishOpen"
      :seed-title="form.title || '未命名文档'"
      :seed-summary="form.summary"
      :seed-tags="form.tags"
      @close="publishOpen = false"
      @submit="submitPublish"
    />
  </section>
</template>
