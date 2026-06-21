export type OJLanguage = 'java' | 'cpp' | 'go' | 'python'
export type OJResultStatus =
  | 'PENDING'
  | 'COMPILING'
  | 'RUNNING'
  | 'COMPILE_ERROR'
  | 'COMPILING_ERROR'
  | 'RUNTIME_ERROR'
  | 'WRONG_ANSWER'
  | 'TIME_LIMIT_EXCEEDED'
  | 'MEMORY_LIMIT_EXCEEDED'
  | 'SYSTEM_ERROR'
  | 'ACCEPTED'

export interface OJProblem {
  id: string
  chapterId: number
  title: string
  difficulty: '简单' | '中等' | '困难'
  description: string
  inputDesc: string
  outputDesc: string
  samples: Array<{ input: string; output: string; explanation?: string }>
  constraints: string[]
  tags: string[]
  supportLanguages: OJLanguage[]
}

export interface OJLanguageOption {
  value: OJLanguage
  label: string
  template: string
  monacoLanguage: OJLanguage
}

export interface OJTestCaseResult {
  index: number
  input: string
  expected: string
  output: string
  status: OJResultStatus
  message?: string
}

export interface OJRunTestCase {
  input: string
  expectedOutput: string
}

export interface OJJudgeResult {
  runId?: string
  submissionId?: string
  status: OJResultStatus
  message: string
  runtimeMs?: number
  memoryKb?: number
  compileError?: string
  runtimeError?: string
  testCases: OJTestCaseResult[]
}
