<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { fetchOjLanguageOptions, fetchOjProblemDetail, runOjCode, submitOjCode } from '../../api/oj'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import OjCodeEditor from '../../components/oj/OjCodeEditor.vue'
import OjEditorToolbar from '../../components/oj/OjEditorToolbar.vue'
import OjProblemDescription from '../../components/oj/OjProblemDescription.vue'
import OjSubmitResultPanel from '../../components/oj/OjSubmitResultPanel.vue'
import OjTestCasePanel from '../../components/oj/OjTestCasePanel.vue'
import { useAuthStore } from '../../store/modules/auth'
import type { OJJudgeResult, OJLanguage, OJLanguageOption, OJProblem } from '../../types/oj'
import { loadCodeDraft, saveCodeDraft } from '../../utils/codeDraftStorage'

const route = useRoute()
const authStore = useAuthStore()
const isAuthed = computed(() => authStore.isAuthenticated)
const problemId = computed(() => String(route.params.problemId))

const loading = ref(false)
const error = ref('')
const running = ref(false)
const submitting = ref(false)

const problem = ref<OJProblem | null>(null)
const languages = ref<OJLanguageOption[]>([])
const language = ref<OJLanguage>('java')
const code = ref('')
const theme = ref<'light' | 'dark'>('light')
const fontSize = ref(15)
const result = ref<OJJudgeResult | null>(null)

const leftPanePercent = ref(45)
const editorPanePercent = ref(62)
const aiOpen = ref(false)
const aiWidth = ref(360)

const currentLanguageOption = computed(() => languages.value.find((item) => item.value === language.value))

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function loadCodeForLanguage(targetLanguage: OJLanguage) {
  if (!problem.value) return
  const draft = loadCodeDraft(problem.value.id, targetLanguage)
  if (draft) {
    code.value = draft
    return
  }
  code.value = languages.value.find((item) => item.value === targetLanguage)?.template ?? ''
}

function saveDraft() {
  if (!problem.value) return
  saveCodeDraft(problem.value.id, language.value, code.value)
}

function onStartResizeHorizontal(event: MouseEvent) {
  const container = (event.currentTarget as HTMLElement).closest('.oj-layout') as HTMLElement | null
  if (!container) return
  const rect = container.getBoundingClientRect()
  const startX = event.clientX
  const startWidth = leftPanePercent.value
  const onMove = (e: MouseEvent) => {
    const deltaPx = e.clientX - startX
    leftPanePercent.value = clamp(startWidth + (deltaPx / rect.width) * 100, 25, 70)
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function onStartResizeVertical(event: MouseEvent) {
  const container = (event.currentTarget as HTMLElement).closest('.oj-right-main') as HTMLElement | null
  if (!container) return
  const rect = container.getBoundingClientRect()
  const startY = event.clientY
  const startHeight = editorPanePercent.value
  const onMove = (e: MouseEvent) => {
    const deltaPx = e.clientY - startY
    editorPanePercent.value = clamp(startHeight + (deltaPx / rect.height) * 100, 35, 82)
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

async function initPage() {
  loading.value = true
  error.value = ''
  try {
    const [problemData, languageOptions] = await Promise.all([
      fetchOjProblemDetail(problemId.value),
      fetchOjLanguageOptions(),
    ])
    problem.value = problemData
    languages.value = languageOptions
    language.value = languageOptions[0]?.value ?? 'java'
    loadCodeForLanguage(language.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目加载失败'
  } finally {
    loading.value = false
  }
}

async function runCode() {
  if (running.value || submitting.value) return
  if (!code.value.trim()) {
    result.value = { status: 'COMPILING_ERROR', message: '提交前代码不能为空', compileError: 'Code is empty', testCases: [] }
    return
  }
  running.value = true
  saveDraft()
  try {
    result.value = await runOjCode(code.value)
  } finally {
    running.value = false
  }
}

async function submitCode() {
  if (running.value || submitting.value) return
  if (!code.value.trim()) {
    result.value = { status: 'COMPILING_ERROR', message: '提交前代码不能为空', compileError: 'Code is empty', testCases: [] }
    return
  }
  submitting.value = true
  saveDraft()
  try {
    result.value = await submitOjCode(code.value)
  } finally {
    submitting.value = false
  }
}

watch(language, (nextLanguage) => loadCodeForLanguage(nextLanguage))
watch(code, () => saveDraft())

onMounted(initPage)
onBeforeUnmount(() => {
  window.onmousemove = null
  window.onmouseup = null
})
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
          <RouterLink class="secondary-btn link-btn" to="/practice">返回题单</RouterLink>
          <RouterLink v-if="!isAuthed" class="primary-btn link-btn" to="/login">登录</RouterLink>
          <UserAvatarMenu v-if="isAuthed" />
        </div>
      </header>

      <div v-if="loading" class="card" style="margin: 16px;">加载中...</div>
      <div v-else-if="error" class="card error" style="margin: 16px;">{{ error }}</div>
      <div
        v-else-if="problem"
        class="oj-layout"
        :style="{ gridTemplateColumns: `${leftPanePercent}% 8px ${100 - leftPanePercent}%` }"
      >
        <div class="oj-left">
          <OjProblemDescription :problem="problem" />
        </div>
        <div class="oj-resizer oj-resizer-v" @mousedown="onStartResizeHorizontal"></div>
        <div class="oj-right">
          <div
            class="oj-right-shell ai-sidebar-host"
            :class="{ 'ai-open': aiOpen }"
            :style="{ gridTemplateColumns: aiOpen ? `minmax(0,1fr) ${aiWidth + 8}px` : 'minmax(0,1fr) 48px' }"
          >
            <div class="oj-right-main">
              <div class="oj-right-top" :style="{ gridTemplateRows: `${editorPanePercent}% 8px ${100 - editorPanePercent}%` }">
                <div class="oj-editor-pane">
                  <div class="oj-editor-toolbar-wrap">
                    <OjEditorToolbar
                      v-model="language"
                      :languages="languages"
                      :theme="theme"
                      :font-size="fontSize"
                      :running="running"
                      :submitting="submitting"
                      @update:theme="theme = $event"
                      @update:font-size="fontSize = $event"
                      @run="runCode"
                      @submit="submitCode"
                      @save="saveDraft"
                    />
                  </div>
                  <OjCodeEditor
                    v-model="code"
                    :language="currentLanguageOption?.monacoLanguage ?? 'java'"
                    :theme="theme"
                    :font-size="fontSize"
                    @run="runCode"
                    @save="saveDraft"
                  />
                </div>
                <div class="oj-resizer oj-resizer-h" @mousedown="onStartResizeVertical"></div>
                <div class="oj-bottom">
                  <OjSubmitResultPanel :result="result" />
                  <OjTestCasePanel :test-cases="result?.testCases ?? []" />
                </div>
              </div>
            </div>
            <AiSidebar
              v-model="aiOpen"
              :width="aiWidth"
              @update:width="aiWidth = $event"
              title="AI 助手"
              empty-text="可基于当前题目提问。"
              collapsed-text="展开 AI"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
