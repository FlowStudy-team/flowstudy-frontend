<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArticleDetail } from '../../api/modules/articles'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import MarkdownRenderer from '../../components/markdown/MarkdownRenderer.vue'
import heroImage from '../../assets/hero.png'
import { useAuthStore } from '../../store/modules/auth'
import type { ArticleDetail } from '../../types/article'

const DEFAULT_ARTICLE_ID = 1

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ArticleDetail | null>(null)
const showAi = ref(true)
const aiWidth = ref(360)
const isAuthed = computed(() => authStore.isAuthenticated)
const articleMarkdown = computed(() => detail.value?.markdown || '')

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchArticleDetail(DEFAULT_ARTICLE_ID)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '文章加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="文章不存在" />
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
          <h3>{{ detail.title }}</h3>
          <p class="reader-section-index">
            {{ detail.chapterCount ?? detail.chapters.length }} 个章节 · {{ detail.problemCount ?? 0 }} 道练习题
          </p>
          <ul>
            <li v-for="chapter in detail.chapters" :key="chapter.id" class="reader-node">
              <RouterLink class="reader-node-btn" :to="`/articles/chapters/${chapter.id}`">
                <span>{{ chapter.title }}</span>
                <span v-if="chapter.estimatedMinutes">{{ chapter.estimatedMinutes }} 分钟</span>
              </RouterLink>
            </li>
          </ul>
        </aside>

        <article class="reader-content">
          <h1>{{ detail.title }}</h1>
          <p v-if="detail.summary" class="lead">{{ detail.summary }}</p>
          <MarkdownRenderer v-if="articleMarkdown" :model-value="articleMarkdown" />

          <h3>章节目录</h3>
          <div class="chapter-links">
            <RouterLink
              v-for="chapter in detail.chapters"
              :key="chapter.id"
              class="secondary-btn link-btn"
              :to="`/articles/chapters/${chapter.id}`"
            >
              {{ chapter.title }}
            </RouterLink>
          </div>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
