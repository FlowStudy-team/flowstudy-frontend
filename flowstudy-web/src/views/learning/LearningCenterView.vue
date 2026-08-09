<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import SiteHeader from '../../components/common/SiteHeader.vue'
import { fetchBlogs, fetchTutorials } from '../../api/modules/articles'
import type { Blog, Tutorial } from '../../types/article'

type Audience = 'all' | 'official' | 'community'
type SortMode = 'latest' | 'hot'

const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const keyword = ref('')
const audience = ref<Audience>('all')
const sortMode = ref<SortMode>('latest')
const tutorials = ref<Tutorial[]>([])
const blogs = ref<Blog[]>([])
const blogPage = ref(1)
const blogTotal = ref(0)
const tutorialPage = ref(1)
const tutorialTotal = ref(0)
const PAGE_SIZE = 12

function timestampOf(item: { publishedAt?: string; updatedAt?: string; createdAt?: string }) {
  const raw = item.publishedAt ?? item.updatedAt ?? item.createdAt ?? ''
  const time = new Date(raw).getTime()
  return Number.isNaN(time) ? 0 : time
}

function heatOf(item: { viewCount?: number; likeCount?: number; problemCount?: number }) {
  return (item.viewCount ?? 0) * 2 + (item.likeCount ?? 0) * 5 + (item.problemCount ?? 0)
}

function isOfficial(item: { authorName?: string }) {
  const author = item.authorName?.trim().toLowerCase()
  if (!author) return false
  return ['admin', 'official', 'flowstudy', '管理员', '官方'].some((name) => author.includes(name))
}

function filterByAudience<T extends { authorName?: string }>(items: T[]) {
  if (audience.value === 'official') return items.filter(isOfficial)
  if (audience.value === 'community') return items.filter((item) => !isOfficial(item))
  return items
}

function sortItems<T extends { publishedAt?: string; updatedAt?: string; createdAt?: string; viewCount?: number; likeCount?: number; problemCount?: number }>(
  items: T[],
) {
  return items.slice().sort((left, right) => {
    if (sortMode.value === 'hot') return heatOf(right) - heatOf(left)
    return timestampOf(right) - timestampOf(left)
  })
}

const visibleTutorials = computed(() => sortItems(filterByAudience(tutorials.value)))
const visibleBlogs = computed(() => sortItems(filterByAudience(blogs.value)))

async function load() {
  loading.value = true
  error.value = ''
  blogPage.value = 1
  tutorialPage.value = 1
  try {
    const query = { page: 1, pageSize: PAGE_SIZE, keyword: keyword.value.trim() || undefined }
    const [tutorialResult, blogResult] = await Promise.all([fetchTutorials(query), fetchBlogs(query)])
    tutorials.value = tutorialResult.list
    tutorialTotal.value = tutorialResult.total
    blogs.value = blogResult.list
    blogTotal.value = blogResult.total
  } catch (err) {
    error.value = err instanceof Error ? err.message : '学习中心加载失败'
  } finally {
    loading.value = false
  }
}

async function loadMoreBlogs() {
  if (loadingMore.value || blogs.value.length >= blogTotal.value) return
  loadingMore.value = true
  try {
    const nextPage = blogPage.value + 1
    const query = { page: nextPage, pageSize: PAGE_SIZE, keyword: keyword.value.trim() || undefined }
    const result = await fetchBlogs(query)
    blogs.value.push(...result.list)
    blogPage.value = nextPage
  } catch {
    // silently ignore load-more errors
  } finally {
    loadingMore.value = false
  }
}

const hasMoreBlogs = computed(() => blogs.value.length < blogTotal.value)

function formatDate(item: { publishedAt?: string; updatedAt?: string; createdAt?: string }) {
  const raw = item.publishedAt ?? item.updatedAt ?? item.createdAt
  return raw ? raw.slice(0, 10) : '暂无日期'
}

onMounted(load)
</script>

<template>
  <section class="learning-page">
    <SiteHeader />

    <main class="learning-wrap">
      <section class="learning-hero">
        <div>
          <p class="eyebrow">Learning Center</p>
          <h1>学习中心</h1>
          <p>聚合官方教程、官方博客和社区内容，按发布时间或热度快速找到值得阅读的资料。</p>
        </div>
        <div class="learning-hero-actions">
          <RouterLink class="primary-btn link-btn" to="/document/workspace">写一篇博客</RouterLink>
        </div>
      </section>

      <section class="learning-controls card">
        <input v-model="keyword" placeholder="搜索教程、博客标题或摘要" @keydown.enter="load" />
        <div class="learning-segment" role="group" aria-label="内容来源">
          <button type="button" :class="{ active: audience === 'all' }" @click="audience = 'all'">全部</button>
          <button type="button" :class="{ active: audience === 'official' }" @click="audience = 'official'">官方</button>
          <button type="button" :class="{ active: audience === 'community' }" @click="audience = 'community'">社区</button>
        </div>
        <div class="learning-segment" role="group" aria-label="排序方式">
          <button type="button" :class="{ active: sortMode === 'latest' }" @click="sortMode = 'latest'">最新</button>
          <button type="button" :class="{ active: sortMode === 'hot' }" @click="sortMode = 'hot'">热度</button>
        </div>
        <button class="secondary-btn" type="button" :disabled="loading" @click="load">搜索</button>
      </section>

      <div v-if="loading" class="card learning-state">加载中...</div>
      <div v-else-if="error" class="card error-box learning-state">
        <span>{{ error }}</span>
        <button class="secondary-btn" type="button" @click="load">重试</button>
      </div>

      <template v-else>
        <section class="learning-section">
          <div class="learning-section-head">
            <div>
              <p class="eyebrow">Tutorials</p>
              <h2>教程</h2>
            </div>
            <RouterLink class="secondary-btn link-btn" to="/tutorials">进入教程阅读</RouterLink>
          </div>

          <div v-if="visibleTutorials.length" class="learning-card-grid">
            <RouterLink v-for="item in visibleTutorials" :key="item.id" class="learning-card" :to="`/tutorials`">
              <span class="learning-badge">{{ isOfficial(item) ? '官方' : '社区' }}</span>
              <h3>{{ item.title }}</h3>
              <p>{{ item.summary || '暂无摘要，点击进入教程查看完整内容。' }}</p>
              <div class="learning-meta">
                <span>{{ item.blogCount ?? 0 }} 篇博客</span>
                <span>{{ item.problemCount ?? 0 }} 道题</span>
                <span>{{ formatDate(item) }}</span>
              </div>
            </RouterLink>
          </div>
          <div v-else class="learning-empty card">暂无符合条件的教程。</div>
        </section>

        <section class="learning-section">
          <div class="learning-section-head">
            <div>
              <p class="eyebrow">Blogs</p>
              <h2>博客</h2>
            </div>
            <RouterLink class="secondary-btn link-btn" to="/document">管理我的文档</RouterLink>
          </div>

          <div v-if="visibleBlogs.length" class="learning-list">
            <RouterLink v-for="item in visibleBlogs" :key="item.id" class="learning-row" :to="`/tutorials/blogs/${item.id}`">
              <div>
                <div class="learning-row-title">
                  <span class="learning-badge">{{ isOfficial(item) ? '官方' : '社区' }}</span>
                  <h3>{{ item.title }}</h3>
                </div>
                <p>{{ item.summary || '暂无摘要，点击阅读博客正文。' }}</p>
              </div>
              <div class="learning-row-stat">
                <strong>{{ heatOf(item) }}</strong>
                <span>热度</span>
                <small>{{ formatDate(item) }}</small>
              </div>
            </RouterLink>
          </div>
          <div v-else class="learning-empty card">暂无符合条件的博客。</div>
          <div v-if="hasMoreBlogs" class="learning-load-more">
            <button class="secondary-btn" :disabled="loadingMore" @click="loadMoreBlogs">
              {{ loadingMore ? '加载中...' : `加载更多 (${blogs.length}/${blogTotal})` }}
            </button>
          </div>
        </section>
      </template>
    </main>
  </section>
</template>
