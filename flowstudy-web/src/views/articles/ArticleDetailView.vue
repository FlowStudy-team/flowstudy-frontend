<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchTutorialDetail } from '../../api/modules/articles'
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
import type { TutorialDetail } from '../../types/article'
import { recordLearningEvent } from '../../api/modules/learning'

const DEFAULT_TUTORIAL_ID = 1

const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<TutorialDetail | null>(null)
const showAi = ref(true)
const aiWidth = ref(360)
const isAuthed = computed(() => authStore.isAuthenticated)
const tutorialMarkdown = computed(() => detail.value?.markdown || '')

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchTutorialDetail(DEFAULT_TUTORIAL_ID)
    if (authStore.isAuthenticated) {
      void recordLearningEvent({ eventType: 'TUTORIAL_READ', resourceType: 'TUTORIAL', resourceId: DEFAULT_TUTORIAL_ID }).catch(() => undefined)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '教程加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)

watch(detail, () => {
  const ctx: AiContext = {}
  if (detail.value?.title) ctx.tutorialTitle = detail.value.title
  aiStore.setContext(ctx)
})
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="教程不存在" />
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
          <h3>{{ detail.title }}</h3>
          <p class="reader-section-index">
            {{ detail.blogCount ?? detail.blogs.length }} 篇博客 · {{ detail.problemCount ?? 0 }} 道练习题
          </p>
          <ul>
            <li v-for="blog in detail.blogs" :key="blog.id" class="reader-node">
              <RouterLink class="reader-node-btn" :to="`/tutorials/blogs/${blog.id}`">
                <span>{{ blog.title }}</span>
                <span v-if="blog.estimatedMinutes">{{ blog.estimatedMinutes }} 分钟</span>
              </RouterLink>
            </li>
          </ul>
        </aside>

        <article class="reader-content">
          <h1>{{ detail.title }}</h1>
          <p v-if="detail.summary" class="lead">{{ detail.summary }}</p>
          <MarkdownRenderer v-if="tutorialMarkdown" :model-value="tutorialMarkdown" />

          <h3>博客目录</h3>
          <div class="chapter-links">
            <RouterLink
              v-for="blog in detail.blogs"
              :key="blog.id"
              class="secondary-btn link-btn"
              :to="`/tutorials/blogs/${blog.id}`"
            >
              {{ blog.title }}
            </RouterLink>
          </div>
        </article>

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
