<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchChapterDetail } from '../../api/modules/articles'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import heroImage from '../../assets/hero.png'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { ChapterDetail } from '../../types/article'

interface NavSection {
  title: string
  children: string[]
}

const route = useRoute()
const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ChapterDetail | null>(null)
const chapterId = computed(() => String(route.params.chapterId))
const showAi = ref(true)
const aiInput = ref('')
const isAuthed = computed(() => authStore.isAuthenticated)
const expanded = ref<string[]>(['Java'])
const activeTop = ref('Java')

const navSections: NavSection[] = [
  { title: '项目介绍', children: ['项目地址', '在线阅读'] },
  { title: '面试准备（必看）', children: ['学习路线', '简历准备', '项目经验'] },
  { title: 'Java', children: ['Java基础面试题', 'Java集合', 'JVM'] },
  { title: '数据库', children: ['MySQL', 'Redis', '事务与索引'] },
  { title: '开发工具', children: ['Git', 'Maven', 'Docker'] },
  { title: '常用框架', children: ['Spring', 'MyBatis', 'Spring Boot'] },
  { title: '系统设计', children: ['缓存设计', '限流熔断', '一致性'] },
  { title: '分布式', children: ['分布式事务', '消息队列', '服务治理'] },
  { title: '高性能', children: ['性能分析', '热点优化', '并发模型'] },
  { title: '高可用', children: ['容灾', '降级', '监控告警'] },
]

function isExpanded(title: string) {
  return expanded.value.includes(title)
}

function toggleSection(title: string) {
  activeTop.value = title
  if (isExpanded(title)) {
    expanded.value = expanded.value.filter((item) => item !== title)
  } else {
    expanded.value = [...expanded.value, title]
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    detail.value = await fetchChapterDetail('a1', chapterId.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Load failed.'
  } finally {
    loading.value = false
  }
}

async function sendAi() {
  const text = aiInput.value.trim()
  if (!text) return
  aiInput.value = ''
  await aiStore.send(text)
}

async function analyzeCurrentChapter() {
  if (!detail.value) return
  await aiStore.send(`请总结章节《${detail.value.title}》的核心知识点与常见面试问法。`)
}

onMounted(load)
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="Chapter not found." />
    <div v-else class="reader-page-wrap">
      <header class="jg-header">
        <div class="jg-brand">
          <img :src="heroImage" alt="FlowStudy" />
          <strong>FlowStudy</strong>
        </div>
        <nav class="jg-nav">
          <a href="#">后端开发</a>
          <a href="#">计算机基础</a>
          <a href="#">AI应用开发</a>
          <a href="#">算法练习</a>
          <a href="#">AI编程</a>
          <a href="#" class="active">推荐阅读</a>
          <a href="#">网站相关</a>
        </nav>
        <div class="jg-actions">
          <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
          <RouterLink v-if="isAuthed" class="primary-btn link-btn" to="/articles">文章列表</RouterLink>
        </div>
      </header>

      <div class="reader-layout" :class="{ 'ai-hidden': !showAi }">
        <aside class="reader-sidebar">
          <h3>JavaGuide</h3>
          <p class="reader-section-index">后端开发知识导航</p>
          <ul>
            <li v-for="section in navSections" :key="section.title" class="reader-node">
              <button
                type="button"
                class="reader-node-btn"
                :class="{ active: activeTop === section.title }"
                @click="toggleSection(section.title)"
              >
                <span>{{ section.title }}</span>
                <span>{{ isExpanded(section.title) ? '⌄' : '›' }}</span>
              </button>
              <ul v-if="isExpanded(section.title)" class="reader-sublist">
                <li v-for="child in section.children" :key="child">
                  <a href="#">{{ child }}</a>
                </li>
              </ul>
            </li>
          </ul>
        </aside>

        <article class="reader-content">
          <h1>{{ detail.title }}</h1>
          <p class="lead">{{ detail.markdown }}</p>
          <h2>关联练习题</h2>
          <div class="chapter-links">
            <RouterLink v-for="id in detail.problemIds" :key="id" class="secondary-btn link-btn" :to="`/problems/${id}`">
              {{ id }}
            </RouterLink>
          </div>
          <div class="toolbar">
            <button class="primary-btn" @click="analyzeCurrentChapter">用 AI 分析本章节</button>
          </div>
        </article>

        <aside v-if="showAi" class="reader-ai">
          <div class="reader-ai-header">
            <strong>AI 对话侧栏</strong>
            <button class="secondary-btn" @click="showAi = false">隐藏</button>
          </div>
          <div class="reader-ai-body">
            <p v-if="aiStore.messages.length === 0" class="muted">可基于当前章节提问。</p>
            <article v-for="msg in aiStore.messages" :key="msg.id" class="msg" :class="msg.role">
              <strong>{{ msg.role === 'user' ? '你' : 'AI' }}</strong>
              <p>{{ msg.content }}</p>
            </article>
            <p v-if="aiStore.loading" class="muted">AI 正在生成...</p>
          </div>
          <div class="reader-ai-footer">
            <input v-model="aiInput" placeholder="输入你的问题" @keydown.enter="sendAi" />
            <button class="primary-btn small" :disabled="aiStore.loading" @click="sendAi">发送</button>
          </div>
        </aside>

        <button v-else class="reader-ai-toggle secondary-btn" @click="showAi = true">展开 AI</button>
      </div>
    </div>
  </section>
</template>
