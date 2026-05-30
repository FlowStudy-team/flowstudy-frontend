<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { getDocumentDetail } from '../../api/document'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import MarkdownRenderer from '../../components/markdown/MarkdownRenderer.vue'
import { useAuthStore } from '../../store/modules/auth'
import type { DocumentDetail } from '../../types/document'

interface TocNode {
  title: string
  id: string
  level: 1 | 2 | 3
  children?: TocNode[]
}

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const detail = ref<DocumentDetail | null>(null)
const showAi = ref(true)
const aiWidth = ref(360)
const activeAnchor = ref('')
const contentHostRef = ref<HTMLElement | null>(null)

const documentId = computed(() => Number(route.params.id))
const isAuthed = computed(() => authStore.isAuthenticated)

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
}

const tocTree = computed<TocNode[]>(() => {
  if (!detail.value) return []
  const lines = detail.value.content.split('\n')
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
      if (!lastLv1) {
        roots.push(node)
      } else {
        if (!lastLv1.children) lastLv1.children = []
        lastLv1.children.push(node)
      }
      lastLv2 = node
      continue
    }
    if (lastLv2) {
      if (!lastLv2.children) lastLv2.children = []
      lastLv2.children.push(node)
    } else if (lastLv1) {
      if (!lastLv1.children) lastLv1.children = []
      lastLv1.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
})

const flatToc = computed(() => {
  const output: TocNode[] = []
  const walk = (nodes: TocNode[]) => {
    for (const node of nodes) {
      output.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(tocTree.value)
  return output
})

function bindHeadingAnchors() {
  const host = contentHostRef.value
  if (!host) return
  const headings = host.querySelectorAll('h1, h2, h3')
  headings.forEach((el, idx) => {
    const toc = flatToc.value[idx]
    if (!toc) return
    el.id = toc.id
  })
}

function scrollToAnchor(id: string) {
  const host = contentHostRef.value
  if (!host) return
  const target = host.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
  if (!target) return
  activeAnchor.value = id
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function fetchDetail() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await getDocumentDetail(documentId.value)
    await nextTick()
    bindHeadingAnchors()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
watch(
  () => detail.value?.content,
  async () => {
    await nextTick()
    bindHeadingAnchors()
  },
)
</script>

<template>
  <section class="reader-page">
    <div class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <RouterLink to="/">首页</RouterLink>
          <a href="#">后端开发</a>
          <a href="#">计算机基础</a>
          <a href="#">AI应用开发</a>
          <RouterLink to="/practice">算法练习</RouterLink>
          <a href="#">AI编程</a>
          <a href="#" class="active">推荐阅读</a>
          <a href="#">网站相关</a>
        </nav>
        <div class="jg-actions">
          <RouterLink class="secondary-btn link-btn" to="/document">返回文档</RouterLink>
          <RouterLink v-if="detail" class="secondary-btn link-btn" :to="`/document/${detail.id}/edit`">编辑文档</RouterLink>
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
          <p class="reader-section-index">{{ detail?.title || '当前文档' }}</p>
          <ul>
            <li v-for="lv1 in tocTree" :key="lv1.title" class="reader-node">
              <button type="button" class="reader-node-btn" :class="{ active: activeAnchor === lv1.id }" @click="scrollToAnchor(lv1.id)">
                <span>{{ lv1.title }}</span>
              </button>
              <ul v-if="lv1.children?.length" class="reader-sublist">
                <li v-for="lv2 in lv1.children" :key="lv2.title">
                  <button type="button" class="reader-lv2-link" :class="{ active: activeAnchor === lv2.id }" @click="scrollToAnchor(lv2.id)">
                    {{ lv2.title }}
                  </button>
                  <ul v-if="lv2.children?.length" class="reader-third-list">
                    <li v-for="lv3 in lv2.children" :key="lv3.title">
                      <button type="button" class="reader-lv3-link" :class="{ active: activeAnchor === lv3.id }" @click="scrollToAnchor(lv3.id)">
                        {{ lv3.title }}
                      </button>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <article ref="contentHostRef" class="reader-content">
          <div v-if="loading" class="card">加载中...</div>
          <div v-else-if="error" class="card error-box">
            <span>{{ error }}</span>
            <button class="secondary-btn" @click="fetchDetail">重试</button>
          </div>
          <div v-else-if="!detail" class="card">未找到文档</div>
          <template v-else>
            <h1>{{ detail.title }}</h1>
            <p class="lead">
              分类：{{ detail.categoryName || '未分类' }} · 标签：{{ detail.tags.join(' / ') || '暂无' }} · 更新时间：{{
                detail.updatedAt.slice(0, 10)
              }}
            </p>
            <MarkdownRenderer :model-value="detail.content" />
          </template>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
