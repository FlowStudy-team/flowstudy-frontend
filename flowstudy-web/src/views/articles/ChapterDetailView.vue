<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchBlogDetail, fetchTutorialDetail } from '../../api/modules/articles'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import MarkdownRenderer from '../../components/markdown/MarkdownRenderer.vue'
import heroImage from '../../assets/hero.png'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { AiContext } from '../../types/ai'
import type { BlogDetail, TutorialDetail } from '../../types/article'

const route = useRoute()
const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<BlogDetail | null>(null)
const tutorial = ref<TutorialDetail | null>(null)
const blogId = computed(() => String(route.params.blogId))
const showAi = ref(true)
const aiWidth = ref(360)
const isAuthed = computed(() => authStore.isAuthenticated)

async function load() {
  loading.value = true
  error.value = ''
  detail.value = null
  tutorial.value = null
  try {
    const blog = await fetchBlogDetail(blogId.value)
    detail.value = blog
    if (blog.tutorialId) {
      tutorial.value = await fetchTutorialDetail(blog.tutorialId)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '博客加载失败'
  } finally {
    loading.value = false
  }
}

async function analyzeCurrentBlog() {
  if (!detail.value) return
  await aiStore.send(`请总结博客《${detail.value.title}》的核心知识点与常见面试问法。`)
}

watch([detail, tutorial], () => {
  const ctx: AiContext = {}
  if (tutorial.value?.title) ctx.tutorialTitle = tutorial.value.title
  if (detail.value?.title) ctx.blogTitle = detail.value.title
  aiStore.setContext(ctx)
})

onMounted(load)
watch(blogId, load)
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="博客不存在" />
    <div v-else class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink class="active" to="/tutorials">教程阅读</RouterLink>
          <RouterLink to="/practice">算法练习</RouterLink>
          <RouterLink to="/document">学习文档</RouterLink>
        </nav>
        <div class="jg-actions">
          <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <div
        class="reader-layout ai-sidebar-host"
        :style="{ gridTemplateColumns: `320px minmax(0,1fr) ${showAi ? `${aiWidth + 8}px` : '48px'}` }"
      >
        <aside class="reader-sidebar">
          <h3>{{ tutorial?.title ?? '独立博客' }}</h3>
          <p class="reader-section-index">{{ tutorial?.blogCount ?? tutorial?.blogs.length ?? 1 }} 篇博客</p>
          <ul>
            <li v-for="blog in tutorial?.blogs ?? []" :key="blog.id" class="reader-node">
              <RouterLink
                class="reader-node-btn"
                :class="{ active: blog.id === detail.id }"
                :to="`/tutorials/blogs/${blog.id}`"
              >
                <span>{{ blog.title }}</span>
                <span v-if="blog.estimatedMinutes">{{ blog.estimatedMinutes }} 分钟</span>
              </RouterLink>
            </li>
          </ul>
        </aside>

        <article class="reader-content">
          <h1>{{ detail.title }}</h1>
          <div class="blog-meta" v-if="detail.authorName || detail.publishedAt">
            <span v-if="detail.authorName">作者：{{ detail.authorName }}</span>
            <span v-if="detail.publishedAt">发布于 {{ detail.publishedAt.slice(0, 10) }}</span>
            <span v-if="detail.updatedAt && detail.updatedAt !== detail.publishedAt">更新于 {{ detail.updatedAt.slice(0, 10) }}</span>
          </div>
          <MarkdownRenderer :model-value="detail.markdown" />

          <h2 v-if="detail.problemIds.length">关联练习题</h2>
          <div v-if="detail.problemIds.length" class="chapter-links">
            <RouterLink v-for="id in detail.problemIds" :key="id" class="secondary-btn link-btn" :to="`/problems/${id}`">
              题目 {{ id }}
            </RouterLink>
          </div>

          <div class="chapter-links">
            <RouterLink
              v-if="detail.prevBlogId"
              class="secondary-btn link-btn"
              :to="`/tutorials/blogs/${detail.prevBlogId}`"
            >
              上一篇
            </RouterLink>
            <RouterLink
              v-if="detail.nextBlogId"
              class="secondary-btn link-btn"
              :to="`/tutorials/blogs/${detail.nextBlogId}`"
            >
              下一篇
            </RouterLink>
          </div>

          <div class="toolbar">
            <button class="primary-btn" @click="analyzeCurrentBlog">用 AI 分析本博客</button>
          </div>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
