<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchArticleDetail } from '../../api/modules/articles'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import heroImage from '../../assets/hero.png'
import { useAuthStore } from '../../store/modules/auth'
import type { ArticleDetail } from '../../types/article'

interface NavItem {
  title: string
  children?: NavItem[]
}

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const detail = ref<ArticleDetail | null>(null)
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
    detail.value = await fetchArticleDetail('a1')
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
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
          <p class="lead">如果你是第一次系统准备 Java 基础，建议先把面向对象和数据类型搞清楚，再看反射和注解，整体理解会顺很多。</p>
          <h2>概念</h2>
          <h3>说一下 Java 的特点</h3>
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

        <AiSidebar v-model="showAi" :width="aiWidth" @update:width="aiWidth = $event" />
      </div>
    </div>
  </section>
</template>
