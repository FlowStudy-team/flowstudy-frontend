export type OJLanguage = 'java' | 'cpp' | 'go' | 'python'
export type OJResultStatus = 'PENDING' | 'COMPILE_ERROR' | 'COMPILING_ERROR' | 'RUNTIME_ERROR' | 'WRONG_ANSWER' | 'ACCEPTED'

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

export interface OJJudgeResult {
  submissionId?: string
  status: OJResultStatus
  message: string
  runtimeMs?: number
  memoryKb?: number
  compileError?: string
  runtimeError?: string
  testCases: OJTestCaseResult[]
}
