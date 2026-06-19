import { request } from './request'
import type { OJJudgeResult, OJLanguage, OJLanguageOption, OJProblem } from '../types/oj'

interface CoreProblemDetail {
  id: number
  chapterId: number
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
  const detail = await request<CoreProblemDetail>(`/problems/${problemId}`)
  return {
    id: String(detail.id),
    chapterId: detail.chapterId,
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

export async function runOjCode(): Promise<OJJudgeResult> {
  throw new Error('代码运行接口暂未接入')
}

export async function submitOjCode(): Promise<OJJudgeResult> {
  throw new Error('代码提交接口暂未接入')
}
