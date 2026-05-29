<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchChapterDetail } from '../../api/modules/articles'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import heroImage from '../../assets/hero.png'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { ChapterDetail } from '../../types/article'

interface NavItem {
  title: string
  children?: NavItem[]
}

const route = useRoute()
const aiStore = useAiStore()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ChapterDetail | null>(null)
const chapterId = computed(() => String(route.params.chapterId))
const showAi = ref(true)
const aiWidth = ref(360)
const isAuthed = computed(() => authStore.isAuthenticated)
const expanded = ref<string[]>(['Java'])
const activeTop = ref('Java')

const navSections: NavItem[] = [
  { title: '项目介绍', children: [{ title: '项目地址' }, { title: '在线阅读' }] },
  { title: '面试准备（必看）', children: [{ title: '学习路线' }, { title: '简历准备' }, { title: '项目经验' }] },
  {
    title: 'Java',
    children: [
      { title: 'Java基础面试题', children: [{ title: '概念' }, { title: '数据类型' }] },
      { title: 'Java集合', children: [{ title: 'List' }, { title: 'Map' }] },
      { title: 'JVM', children: [{ title: '内存模型' }, { title: 'GC' }] },
    ],
  },
  { title: '数据库', children: [{ title: 'MySQL' }, { title: 'Redis' }, { title: '事务与索引' }] },
  { title: '开发工具', children: [{ title: 'Git' }, { title: 'Maven' }, { title: 'Docker' }] },
  { title: '常用框架', children: [{ title: 'Spring' }, { title: 'MyBatis' }, { title: 'Spring Boot' }] },
  { title: '系统设计', children: [{ title: '缓存设计' }, { title: '限流熔断' }, { title: '一致性' }] },
  { title: '分布式', children: [{ title: '分布式事务' }, { title: '消息队列' }, { title: '服务治理' }] },
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
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
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
    <EmptyState v-else-if="!detail" text="章节不存在" />
    <div v-else class="reader-page-wrap">
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
                <span>{{ isExpanded(section.title) ? '▾' : '▸' }}</span>
              </button>
              <ul v-if="isExpanded(section.title)" class="reader-sublist">
                <li v-for="child in section.children ?? []" :key="child.title">
                  <a href="#" class="reader-lv2-link">{{ child.title }}</a>
                  <ul v-if="child.children?.length" class="reader-third-list">
                    <li v-for="third in child.children" :key="third.title">
                      <a href="#" class="reader-lv3-link">{{ third.title }}</a>
                    </li>
                  </ul>
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

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
