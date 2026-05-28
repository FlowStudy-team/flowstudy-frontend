export type JudgeStatus = 'PENDING' | 'RUNNING' | 'AC' | 'WA' | 'TLE' | 'RE' | 'CE'

export interface ProblemDetail {
  id: string
  title: string
  description: string
  inputDesc: string
  outputDesc: string
  samples: Array<{ input: string; output: string }>
  constraints: string[]
  languages: string[]
  starterCode: Record<string, string>
}

export interface TestCaseResult {
  index: number
  status: JudgeStatus
  runtimeMs: number
  memoryKb: number
}

export interface SubmissionDetail {
  id: string
  problemId: string
  status: JudgeStatus
  runtimeMs: number
  memoryKb: number
  language: string
  createdAt: string
  testCases: TestCaseResult[]
}
