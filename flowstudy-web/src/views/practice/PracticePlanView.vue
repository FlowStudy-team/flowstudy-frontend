<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { useAuthStore } from '../../store/modules/auth'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'

interface StageProgress {
  name: string
  done: number
  total: number
}

interface ProblemItem {
  id: string
  title: string
  difficulty: '简单' | '中等' | '困难'
}

interface ProblemGroup {
  name: string
  items: ProblemItem[]
}

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)

const totalDone = 20
const totalCount = 100

const groups: ProblemGroup[] = [
  {
    name: '哈希',
    items: [
      { id: 'p0219', title: '存在重复元素 II', difficulty: '简单' },
      { id: 'p0001', title: '两数之和', difficulty: '简单' },
      { id: 'p0049', title: '字母异位词分组', difficulty: '中等' },
    ],
  },
  {
    name: '双指针',
    items: [
      { id: 'p0283', title: '移动零', difficulty: '简单' },
      { id: 'p0011', title: '盛最多水的容器', difficulty: '中等' },
      { id: 'p0015', title: '三数之和', difficulty: '中等' },
    ],
  },
]

const stageProgress: StageProgress[] = [
  { name: '数组', done: 15, total: 20 },
  { name: '链表', done: 8, total: 15 },
  { name: '哈希表', done: 12, total: 15 },
  { name: '二叉树', done: 5, total: 20 },
  { name: '动态规划', done: 6, total: 15 },
  { name: '图论', done: 3, total: 15 },
]

function percent(done: number, total: number) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}
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
          <RouterLink to="/practice" class="active">算法练习</RouterLink>
          <a href="#">AI编程</a>
          <a href="#">推荐阅读</a>
          <a href="#">网站相关</a>
        </nav>
        <div class="jg-actions">
          <RouterLink v-if="!isAuthed" class="secondary-btn link-btn" to="/login">登录</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/register">注册</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <div class="practice-page">
        <aside class="practice-left">
          <div class="practice-brand">FlowStudy</div>
          <div class="practice-menu active">学习计划</div>
          <div class="practice-divider"></div>
          <div class="practice-title">我的题单</div>
          <div class="practice-fav">我的收藏</div>
        </aside>

        <main class="practice-main">
          <header class="practice-hero">
            <p class="practice-subtitle">高频经典算法题单，循序渐进完成 100 题</p>
            <h1>算法基础 100</h1>
            <div class="practice-total-progress">
              <div class="practice-progress-bar">
                <div class="practice-progress-fill" :style="{ width: `${percent(totalDone, totalCount)}%` }"></div>
              </div>
              <span>{{ totalDone }} / {{ totalCount }}</span>
            </div>
          </header>

          <section v-for="group in groups" :key="group.name" class="practice-group">
            <h3>{{ group.name }}</h3>
            <article v-for="item in group.items" :key="item.id" class="practice-item">
              <RouterLink class="practice-problem-link" :to="`/problems/${item.id}`">{{ item.title }}</RouterLink>
              <em :class="`diff-${item.difficulty}`">{{ item.difficulty }}</em>
            </article>
          </section>
        </main>

        <aside class="practice-right">
          <div class="practice-card">设置学习计划</div>
          <div class="practice-stage">
            <h3>算法各阶段</h3>
            <article v-for="stage in stageProgress" :key="stage.name" class="stage-item">
              <div class="stage-head">
                <strong>{{ stage.name }}</strong>
                <span>{{ stage.done }} / {{ stage.total }}</span>
              </div>
              <div class="stage-bar">
                <div class="stage-fill" :style="{ width: `${percent(stage.done, stage.total)}%` }"></div>
              </div>
            </article>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>
