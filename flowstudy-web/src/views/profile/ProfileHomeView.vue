<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '../../components/common/EmptyState.vue'
import ErrorRetry from '../../components/common/ErrorRetry.vue'
import LoadingBlock from '../../components/common/LoadingBlock.vue'
import { getCurrentUser } from '../../api/modules/auth'
import { fetchLearningOverview, type LearningOverview } from '../../api/modules/learning'
import { fetchTokenAccount, type TokenAccount } from '../../api/modules/store'
import type { User } from '../../types/auth'

const loading = ref(true)
const error = ref('')
const user = ref<User | null>(null)
const overview = ref<LearningOverview | null>(null)
const account = ref<TokenAccount | null>(null)
const currentYear = new Date().getFullYear()
const startDate = `${currentYear - 3}-01-01`
const endDate = `${currentYear}-12-31`
const displayName = computed(() => user.value?.nickname || user.value?.username || 'Learner')

async function load() {
  loading.value = true; error.value = ''
  try {
    const [currentUser, learningOverview, tokenAccount] = await Promise.all([getCurrentUser(), fetchLearningOverview(startDate, endDate), fetchTokenAccount()])
    user.value = currentUser; overview.value = learningOverview; account.value = tokenAccount
  } catch (err) { error.value = err instanceof Error ? err.message : '个人数据加载失败' } finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <section>
    <LoadingBlock v-if="loading" />
    <ErrorRetry v-else-if="error" :text="error" @retry="load" />
    <template v-else-if="user && overview && account">
      <div class="profile-heading"><div><p class="eyebrow">MY FLOWSTUDY</p><h2>{{ displayName }}的学习空间</h2><p>{{ user.email || '暂未设置邮箱' }}</p></div><RouterLink class="primary-btn link-btn" to="/store">购买 Token</RouterLink></div>
      <div class="grid">
        <article class="card"><h3>可用 Token</h3><strong class="profile-number">{{ account.availableTokens.toLocaleString() }}</strong><p>总额度 {{ account.totalTokens.toLocaleString() }}</p></article>
        <article class="card"><h3>学习天数</h3><strong class="profile-number">{{ overview.learningDays }}</strong><p>最近四年有行为的日期</p></article>
        <article class="card"><h3>连续学习</h3><strong class="profile-number">{{ overview.streakDays }} 天</strong><p>从今天向前计算</p></article>
        <article class="card"><h3>通过题目</h3><strong class="profile-number">{{ overview.solvedProblemCount }}</strong><p>代码提交通过的不同题目</p></article>
      </div>
      <section class="card"><div class="profile-section-head"><h3>快捷入口</h3><RouterLink to="/progress">查看学习概览</RouterLink></div><div class="profile-links"><RouterLink class="secondary-btn link-btn" to="/practice">算法练习</RouterLink><RouterLink class="secondary-btn link-btn" to="/me/submissions">提交记录</RouterLink><RouterLink class="secondary-btn link-btn" to="/document">我的文档</RouterLink><RouterLink class="secondary-btn link-btn" to="/store">会员与订单</RouterLink></div></section>
      <section class="card"><h3>学习数据说明</h3><EmptyState text="打开文章、文档或提交代码后，真实行为会逐步出现在学习概览热力图中。" /></section>
    </template>
  </section>
</template>

<style scoped>
.profile-heading,.profile-section-head { display:flex; justify-content:space-between; align-items:center; gap:16px; }.profile-heading p { color:#7188a2; }.eyebrow { color:#5b88b2; font-size:12px; letter-spacing:2px; margin:0; }.profile-number { display:block; margin:8px 0; font-size:30px; color:#1e6ed8; }.profile-links { display:flex; gap:10px; flex-wrap:wrap; }
</style>
