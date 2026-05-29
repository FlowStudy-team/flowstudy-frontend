<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../store/modules/auth'
import heroImage from '../../assets/hero.png'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'

interface LinkItem {
  text: string
  href: string
}

const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)

const mustRead: LinkItem[] = [
  { text: 'Java 面试指南（网站核心）：系统整理 Java 八股文、后端通用面试知识', href: '/articles' },
  { text: 'AI 应用开发面试指南（新增）：覆盖大模型基础、Agent、RAG、MCP', href: '/articles' },
  { text: 'Java 优质开源项目：按实战、架构、工具链做精细分类', href: '/articles' },
]

const recommends: LinkItem[] = [
  { text: 'Java 后端面试通关计划（覆盖后端通用体系）', href: '/articles' },
  { text: 'Java 基础常见面试题总结', href: '/articles' },
  { text: '操作系统常见面试题总结', href: '/articles' },
  { text: 'MySQL 常见面试题总结', href: '/articles' },
]
</script>

<template>
  <div class="jg-home">
    <header class="jg-header">
      <div class="jg-brand">
        <img :src="heroImage" alt="FlowStudy" />
        <strong>FlowStudy</strong>
      </div>
      <nav class="jg-nav">
        <a href="#">后端开发</a>
        <a href="#">计算机基础</a>
        <a href="#">AI应用开发</a>
        <RouterLink to="/practice">算法练习</RouterLink>
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

    <main class="jg-main">
      <section class="jg-hero">
        <div class="jg-hero-logo">
          <img :src="heroImage" alt="FlowStudy Logo" />
        </div>
        <div class="jg-hero-content">
          <h1>FlowStudy</h1>
          <p>Java 面试 & 后端通用面试指南，覆盖计算机基础、数据库、分布式、高并发、系统设计与 AI 应用开发。</p>
          <div class="jg-hero-buttons">
            <RouterLink class="primary-btn link-btn" to="/articles">开始阅读</RouterLink>
          </div>
        </div>
      </section>

      <section class="jg-section">
        <h2>🔥 必看</h2>
        <ul>
          <li v-for="item in mustRead" :key="item.text">
            <RouterLink :to="item.href">{{ item.text }}</RouterLink>
          </li>
        </ul>
      </section>

      <section class="jg-section">
        <h2>🌟 文章推荐</h2>
        <ul>
          <li v-for="item in recommends" :key="item.text">
            <RouterLink :to="item.href">{{ item.text }}</RouterLink>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>
