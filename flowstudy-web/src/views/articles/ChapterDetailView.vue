<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchArticleDetail, fetchChapterDetail } from '../../api/modules/articles'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import MarkdownRenderer from '../../components/markdown/MarkdownRenderer.vue'
import heroImage from '../../assets/hero.png'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { ArticleDetail, ChapterDetail } from '../../types/article'

const route = useRoute()
const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ChapterDetail | null>(null)
const article = ref<ArticleDetail | null>(null)
const chapterId = computed(() => String(route.params.chapterId))
const showAi = ref(true)
const aiWidth = ref(360)
const isAuthed = computed(() => authStore.isAuthenticated)

async function load() {
  loading.value = true
  error.value = ''
  detail.value = null
  article.value = null
  try {
    const chapter = await fetchChapterDetail(1, chapterId.value)
    detail.value = chapter
    article.value = await fetchArticleDetail(chapter.articleId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '章节加载失败'
  } finally {
    loading.value = false
  }
}

async function analyzeCurrentChapter() {
  if (!detail.value) return
  await aiStore.send(`请总结章节《${detail.value.title}》的核心知识点与常见面试问法。`)
}

onMounted(load)
watch(chapterId, load)
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="章节不存在" />
    <div v-else class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <RouterLink to="/">首页</RouterLink>
          <RouterLink class="active" to="/articles">文章阅读</RouterLink>
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
          <h3>{{ article?.title ?? '章节目录' }}</h3>
          <p class="reader-section-index">{{ article?.chapterCount ?? article?.chapters.length ?? 0 }} 个章节</p>
          <ul>
            <li v-for="chapter in article?.chapters ?? []" :key="chapter.id" class="reader-node">
              <RouterLink
                class="reader-node-btn"
                :class="{ active: chapter.id === detail.id }"
                :to="`/articles/chapters/${chapter.id}`"
              >
                <span>{{ chapter.title }}</span>
                <span v-if="chapter.estimatedMinutes">{{ chapter.estimatedMinutes }} 分钟</span>
              </RouterLink>
            </li>
          </ul>
        </aside>

        <article class="reader-content">
          <h1>{{ detail.title }}</h1>
          <MarkdownRenderer :model-value="detail.markdown" />

          <h2 v-if="detail.problemIds.length">关联练习题</h2>
          <div v-if="detail.problemIds.length" class="chapter-links">
            <RouterLink v-for="id in detail.problemIds" :key="id" class="secondary-btn link-btn" :to="`/problems/${id}`">
              题目 {{ id }}
            </RouterLink>
          </div>

          <div class="chapter-links">
            <RouterLink
              v-if="detail.prevChapterId"
              class="secondary-btn link-btn"
              :to="`/articles/chapters/${detail.prevChapterId}`"
            >
              上一章
            </RouterLink>
            <RouterLink
              v-if="detail.nextChapterId"
              class="secondary-btn link-btn"
              :to="`/articles/chapters/${detail.nextChapterId}`"
            >
              下一章
            </RouterLink>
          </div>

          <div class="toolbar">
            <button class="primary-btn" @click="analyzeCurrentChapter">用 AI 分析本章节</button>
          </div>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
