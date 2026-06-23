import { request } from './request'
import type { OJJudgeResult, OJLanguage, OJLanguageOption, OJProblem, OJRunTestCase } from '../types/oj'

interface CoreProblemDetail {
  id: number
  blogId: number
  title: string
  descriptionMd: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  inputDescription?: string
  outputDescription?: string
  sampleCases: Array<{ input: string; output: string }>
  supportLanguages: string[]
  timeLimitMs: number
  memoryLimitMb: number
  acceptedCount?: number
  submitCount?: number
}

interface CoreProblemTemplate {
  problemId: number
  language: string
  code: string
}

interface CoreCreateSubmissionResponse {
  submitId: number
  status: OJJudgeResult['status']
}

interface CoreCreateRunResponse {
  runId: number
  status: OJJudgeResult['status']
}

interface CoreSubmissionDetail {
  submitId: number
  problemId: number
  problemTitle: string
  language: string
  status: OJJudgeResult['status']
  timeUsedMs?: number | null
  memoryUsedKb?: number | null
  score?: number | null
  compileMessage?: string | null
  runtimeMessage?: string | null
  createdAt: string
  caseResults: CoreJudgeCaseResult[]
}

interface CoreRunDetail {
  runId: number
  problemId: number
  problemTitle: string
  language: string
  status: OJJudgeResult['status']
  timeUsedMs?: number | null
  memoryUsedKb?: number | null
  compileMessage?: string | null
  runtimeMessage?: string | null
  createdAt: string
  caseResults: CoreJudgeCaseResult[]
}

interface CoreJudgeCaseResult {
  caseIndex: number
  status: OJJudgeResult['status']
  timeUsedMs?: number | null
  memoryUsedKb?: number | null
  input?: string | null
  expectedOutput?: string | null
  actualOutput?: string | null
  errorMessage?: string | null
}

const languageMeta: Record<OJLanguage, { label: string; monacoLanguage: OJLanguage }> = {
  java: { label: 'Java', monacoLanguage: 'java' },
  cpp: { label: 'C++', monacoLanguage: 'cpp' },
  go: { label: 'Go', monacoLanguage: 'go' },
  python: { label: 'Python', monacoLanguage: 'python' },
}

const difficultyText: Record<CoreProblemDetail['difficulty'], OJProblem['difficulty']> = {
  EASY: '简单',
  MEDIUM: '中等',
  HARD: '困难',
}

function normalizeLanguage(language: string): OJLanguage | null {
  const normalized = language.trim().toLowerCase()
  return normalized in languageMeta ? (normalized as OJLanguage) : null
}

export async function fetchOjProblemDetail(problemId: string): Promise<OJProblem> {
  if (!/^\d+$/.test(problemId)) {
    throw new Error(`题目 ID ${problemId} 不是后端可识别的数字 ID`)
  }
  const detail = await request<CoreProblemDetail>(`/problems/${problemId}`)
  return {
    id: String(detail.id),
    blogId: detail.blogId,
    title: detail.title,
    difficulty: difficultyText[detail.difficulty],
    description: detail.descriptionMd,
    inputDesc: detail.inputDescription ?? '',
    outputDesc: detail.outputDescription ?? '',
    samples: detail.sampleCases,
    constraints: [
      `时间限制：${detail.timeLimitMs} ms`,
      `内存限制：${detail.memoryLimitMb} MB`,
    ],
    tags: [difficultyText[detail.difficulty]],
    supportLanguages: detail.supportLanguages
      .map(normalizeLanguage)
      .filter((language): language is OJLanguage => language !== null),
  }
}

export async function fetchOjLanguageOptions(
  problemId: string,
  supportLanguages: OJLanguage[],
): Promise<OJLanguageOption[]> {
  const options = await Promise.all(
    supportLanguages.map(async (language) => {
      const template = await request<CoreProblemTemplate>(`/problems/${problemId}/template?language=${language}`)
      const meta = languageMeta[language]
      return {
        value: language,
        label: meta.label,
        monacoLanguage: meta.monacoLanguage,
        template: template.code,
      }
    }),
  )
  return options
}

export async function runOjCode(params: {
  problemId: string
  language: OJLanguage
  code: string
  testCases: OJRunTestCase[]
}): Promise<OJJudgeResult> {
  const response = await request<CoreCreateRunResponse>(`/problems/${params.problemId}/runs`, {
    method: 'POST',
    body: JSON.stringify({
      language: params.language,
      code: params.code,
      testCases: params.testCases.map((item) => ({
        input: item.input,
        expectedOutput: item.expectedOutput,
      })),
    }),
  })
  return {
    runId: String(response.runId),
    status: response.status,
    message: `运行任务已创建，运行 ID：${response.runId}。当前状态：${response.status}`,
    testCases: [],
  }
}

export async function fetchOjRunDetail(runId: string): Promise<OJJudgeResult> {
  const detail = await request<CoreRunDetail>(`/runs/${runId}`)
  return {
    runId: String(detail.runId),
    status: detail.status,
    message: `运行 ID：${detail.runId}，当前状态：${detail.status}`,
    runtimeMs: detail.timeUsedMs ?? undefined,
    memoryKb: detail.memoryUsedKb ?? undefined,
    compileError: detail.compileMessage ?? undefined,
    runtimeError: detail.runtimeMessage ?? undefined,
    testCases: detail.caseResults.map((item) => ({
      index: item.caseIndex,
      input: item.input ?? '',
      expected: item.expectedOutput ?? '',
      output: item.actualOutput ?? '',
      status: item.status,
      message: item.errorMessage ?? undefined,
    })),
  }
}

export function unusedRunPlaceholder() {
  throw new Error('代码运行接口暂未接入')
}

export async function submitOjCode(params: {
  problemId: string
  language: OJLanguage
  code: string
}): Promise<OJJudgeResult> {
  const response = await request<CoreCreateSubmissionResponse>(`/problems/${params.problemId}/submissions`, {
    method: 'POST',
    body: JSON.stringify({
      language: params.language,
      code: params.code,
    }),
  })
  return {
    submissionId: String(response.submitId),
    status: response.status,
    message: `提交成功，提交 ID：${response.submitId}。当前状态：${response.status}`,
    testCases: [],
  }
}

export async function fetchOjSubmissionDetail(submissionId: string): Promise<OJJudgeResult> {
  const detail = await request<CoreSubmissionDetail>(`/submissions/${submissionId}`)
  return {
    submissionId: String(detail.submitId),
    status: detail.status,
    message: `提交 ID：${detail.submitId}，当前状态：${detail.status}`,
    runtimeMs: detail.timeUsedMs ?? undefined,
    memoryKb: detail.memoryUsedKb ?? undefined,
    compileError: detail.compileMessage ?? undefined,
    runtimeError: detail.runtimeMessage ?? undefined,
    testCases: detail.caseResults.map((item) => ({
      index: item.caseIndex,
      input: item.input ?? '',
      expected: item.expectedOutput ?? '',
      output: item.actualOutput ?? '',
      status: item.status,
      message: item.errorMessage ?? undefined,
    })),
  }
}
