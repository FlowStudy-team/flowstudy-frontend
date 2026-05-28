import type { ProblemDetail, SubmissionDetail } from '../../types/problem'

export async function fetchProblemDetail(problemId: string): Promise<ProblemDetail> {
  await new Promise((resolve) => setTimeout(resolve, 320))
  return {
    id: problemId,
    title: `Two Sum Variant ${problemId}`,
    description: 'Find indices of two numbers that sum to target.',
    inputDesc: 'An integer array nums and integer target.',
    outputDesc: 'Return two indices.',
    samples: [
      { input: 'nums=[2,7,11,15], target=9', output: '[0,1]' },
      { input: 'nums=[3,2,4], target=6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 1e5', '-1e9 <= nums[i] <= 1e9'],
    languages: ['TypeScript', 'Java', 'Go', 'Python'],
    starterCode: {
      TypeScript: 'export function solve(nums: number[], target: number): number[] {\n  return []\n}',
      Java: 'class Solution { int[] solve(int[] nums, int target) { return new int[]{}; } }',
      Go: 'func solve(nums []int, target int) []int {\n  return []int{}\n}',
      Python: 'def solve(nums, target):\n    return []',
    },
  }
}

export async function submitSolution(params: {
  problemId: string
  language: string
  code: string
}): Promise<SubmissionDetail> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  const accepted = !params.code.toLowerCase().includes('fail')
  return {
    id: `s-${Date.now()}`,
    problemId: params.problemId,
    status: accepted ? 'AC' : 'WA',
    runtimeMs: accepted ? 32 : 28,
    memoryKb: accepted ? 3200 : 2800,
    language: params.language,
    createdAt: new Date().toISOString(),
    testCases: [
      { index: 1, status: 'AC', runtimeMs: 10, memoryKb: 1600 },
      { index: 2, status: accepted ? 'AC' : 'WA', runtimeMs: 18, memoryKb: 1900 },
    ],
  }
}
