<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArticleDetail } from '../../api/modules/articles'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import heroImage from '../../assets/hero.png'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { ArticleDetail } from '../../types/article'

interface NavSection {
  title: string
  children: string[]
}

const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ArticleDetail | null>(null)
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
    detail.value = await fetchArticleDetail('a1')
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

onMounted(load)
</script>

<template>
  <section class="reader-page">
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <EmptyState v-else-if="!detail" text="Article not found." />
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
          <p class="lead">如果你是第一次系统准备 Java 基础，建议先把面向对象和数据类型搞清楚，再看反射和注解，整体理解会顺很多。</p>
          <h2>概念</h2>
          <h3>说一下Java的特点</h3>
          <ul class="content-list">
            <li><strong>平台无关性：</strong>一次编写，到处运行，依赖 JVM 保证跨平台能力。</li>
            <li><strong>面向对象：</strong>强调封装、继承、多态，便于维护和复用。</li>
            <li><strong>内存管理：</strong>自动垃圾回收机制，减少内存泄漏风险。</li>
            <li><strong>生态成熟：</strong>在企业后端和中间件领域具备长期稳定生态。</li>
          </ul>
          <h3>关联章节</h3>
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

        <aside v-if="showAi" class="reader-ai">
          <div class="reader-ai-header">
            <strong>AI 对话侧栏</strong>
            <button class="secondary-btn" @click="showAi = false">隐藏</button>
          </div>
          <div class="reader-ai-body">
            <p v-if="aiStore.messages.length === 0" class="muted">可基于当前文章提问。</p>
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
