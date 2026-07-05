<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import heroImage from '../../assets/hero.png'
import { fetchOjLanguageOptions, fetchOjProblemDetail, fetchOjRunDetail, fetchOjSubmissionDetail, runOjCode, submitOjCode } from '../../api/oj'
import AiSidebar from '../../components/ai/AiSidebar.vue'
import UserAvatarMenu from '../../components/common/UserAvatarMenu.vue'
import OjCodeEditor from '../../components/oj/OjCodeEditor.vue'
import OjEditorToolbar from '../../components/oj/OjEditorToolbar.vue'
import OjProblemDescription from '../../components/oj/OjProblemDescription.vue'
import OjSubmitResultPanel from '../../components/oj/OjSubmitResultPanel.vue'
import OjTestCasePanel from '../../components/oj/OjTestCasePanel.vue'
import { useAiStore } from '../../store/modules/ai'
import { useAuthStore } from '../../store/modules/auth'
import type { AiContext } from '../../types/ai'
import type { OJJudgeResult, OJLanguage, OJLanguageOption, OJProblem, OJRunTestCase } from '../../types/oj'
import { loadCodeDraft, saveCodeDraft } from '../../utils/codeDraftStorage'

const route = useRoute()
const aiStore = useAiStore()
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
const runTestCases = ref<OJRunTestCase[]>([])

const leftPanePercent = ref(45)
const editorPanePercent = ref(62)
const aiOpen = ref(false)
const aiWidth = ref(360)

const currentLanguageOption = computed(() => languages.value.find((item) => item.value === language.value))
const finalStatuses = new Set(['ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'RUNTIME_ERROR', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'SYSTEM_ERROR'])

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

function resetRunTestCases() {
  runTestCases.value = (problem.value?.samples ?? []).map((item) => ({
    input: item.input,
    expectedOutput: item.output,
  }))
  if (runTestCases.value.length === 0) {
    runTestCases.value = [{ input: '', expectedOutput: '' }]
  }
}

function addRunTestCase() {
  if (runTestCases.value.length >= 10) {
    result.value = { status: 'PENDING', message: '运行测试用例最多 10 组', testCases: [] }
    return
  }
  runTestCases.value.push({ input: '', expectedOutput: '' })
}

function removeRunTestCase(index: number) {
  if (runTestCases.value.length <= 1) return
  runTestCases.value.splice(index, 1)
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
  result.value = null
  try {
    const problemData = await fetchOjProblemDetail(problemId.value)
    const languageOptions = await fetchOjLanguageOptions(problemData.id, problemData.supportLanguages)
    problem.value = problemData
    languages.value = languageOptions
    language.value = languageOptions[0]?.value ?? 'java'
    resetRunTestCases()
    loadCodeForLanguage(language.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '题目加载失败'
  } finally {
    loading.value = false
  }
}

async function runCodeImpl() {
  if (!problem.value) return
  if (!isAuthed.value) {
    result.value = { status: 'PENDING', message: '请先登录后运行代码', testCases: [] }
    return
  }
  running.value = true
  result.value = { status: 'PENDING', message: '运行中...', testCases: [] }
  try {
    saveDraft()
    const created = await runOjCode({
      problemId: problem.value.id,
      language: language.value,
      code: code.value,
      testCases: runTestCases.value,
    })
    result.value = created
    if (!created.runId) return
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1000))
      const detail = await fetchOjRunDetail(created.runId)
      result.value = detail
      if (finalStatuses.has(detail.status)) {
        break
      }
    }
  } catch (err) {
    result.value = {
      status: 'PENDING',
      message: err instanceof Error ? err.message : '运行失败',
      testCases: [],
    }
  } finally {
    running.value = false
  }
}

async function runCode() {
  return runCodeImpl()
}

async function unusedRunPlaceholder() {
  result.value = { status: 'PENDING', message: '代码运行接口暂未接入', testCases: [] }
}

void unusedRunPlaceholder

async function submitCode() {
  if (!problem.value) return
  if (!isAuthed.value) {
    result.value = { status: 'PENDING', message: '请先登录后提交代码', testCases: [] }
    return
  }
  submitting.value = true
  result.value = { status: 'PENDING', message: '提交中...', testCases: [] }
  try {
    saveDraft()
    const submitted = await submitOjCode({
      problemId: problem.value.id,
      language: language.value,
      code: code.value,
    })
    result.value = submitted
    if (!submitted.submissionId) return
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 1500))
      const detail = await fetchOjSubmissionDetail(submitted.submissionId)
      result.value = detail
      if (finalStatuses.has(detail.status)) {
        break
      }
    }
  } catch (err) {
    result.value = {
      status: 'PENDING',
      message: err instanceof Error ? err.message : '提交失败',
      testCases: [],
    }
  } finally {
    submitting.value = false
  }
}

watch(language, (nextLanguage) => loadCodeForLanguage(nextLanguage))
watch(code, () => saveDraft())
watch(problemId, initPage)

watch([problem, language, code, result], () => {
  const ctx: AiContext = {}
  if (problem.value) {
    ctx.problemTitle = problem.value.title
    ctx.problemDescription = problem.value.description
  }
  ctx.language = language.value
  ctx.userCode = code.value
  if (result.value) {
    ctx.submissionStatus = result.value.status
    if (result.value.compileError) ctx.compileMessage = result.value.compileError
    if (result.value.runtimeError) ctx.compileMessage = result.value.runtimeError
    const failed = result.value.testCases?.find(
      (tc) => tc.status !== 'ACCEPTED'
    )
    if (failed) {
      ctx.failedCaseInput = failed.input
      ctx.expectedOutput = failed.expected
      ctx.actualOutput = failed.output
    }
  }
  aiStore.setContext(ctx)
})

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
          <RouterLink to="/tutorials">教程阅读</RouterLink>
          <RouterLink to="/practice" class="active">算法练习</RouterLink>
          <RouterLink to="/document">学习文档</RouterLink>
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
              <div
                class="oj-right-top"
                :style="{ gridTemplateRows: `${editorPanePercent}% 8px ${100 - editorPanePercent}%` }"
              >
                <div class="oj-editor-pane">
                  <div class="oj-editor-toolbar-wrap">
                    <OjEditorToolbar
                      v-model="language"
                      :languages="languages"
                      :theme="theme"
                      :font-size="fontSize"
                      :running="running"
                      :submitting="submitting"
                      :run-available="true"
                      :submit-available="true"
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
                  <div class="card" style="overflow: auto;">
                    <div
                      class="section-title"
                      style="display: flex; align-items: center; justify-content: space-between; gap: 12px;"
                    >
                      <span>运行测试用例</span>
                      <span style="display: flex; gap: 8px;">
                        <button class="secondary-btn" type="button" @click="resetRunTestCases">重置示例</button>
                        <button
                          class="primary-btn"
                          type="button"
                          :disabled="runTestCases.length >= 10"
                          @click="addRunTestCase"
                        >
                          新增用例
                        </button>
                      </span>
                    </div>
                    <div
                      v-for="(item, index) in runTestCases"
                      :key="index"
                      class="card"
                      style="margin-top: 10px; padding: 12px; box-shadow: none;"
                    >
                      <div
                        style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;"
                      >
                        <strong>Case {{ index + 1 }}</strong>
                        <button
                          class="secondary-btn"
                          type="button"
                          :disabled="runTestCases.length <= 1"
                          @click="removeRunTestCase(index)"
                        >
                          删除
                        </button>
                      </div>
                      <label style="display: block; margin-bottom: 8px;">
                        <span>输入</span>
                        <textarea
                          v-model="item.input"
                          class="form-input"
                          rows="4"
                          style="width: 100%; margin-top: 6px;"
                        ></textarea>
                      </label>
                      <label style="display: block;">
                        <span>期望输出</span>
                        <textarea
                          v-model="item.expectedOutput"
                          class="form-input"
                          rows="3"
                          style="width: 100%; margin-top: 6px;"
                        ></textarea>
                      </label>
                    </div>
                  </div>
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
