import type { OJJudgeResult, OJLanguageOption, OJProblem } from '../types/oj'

const languageOptions: OJLanguageOption[] = [
  {
    value: 'java',
    label: 'Java',
    monacoLanguage: 'java',
    template:
      'class Solution {\n  public boolean containsNearbyDuplicate(int[] nums, int k) {\n    // TODO\n    return false;\n  }\n}\n',
  },
  {
    value: 'cpp',
    label: 'C++',
    monacoLanguage: 'cpp',
    template:
      '#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n  bool containsNearbyDuplicate(vector<int>& nums, int k) {\n    // TODO\n    return false;\n  }\n};\n',
  },
  {
    value: 'python',
    label: 'Python',
    monacoLanguage: 'python',
    template: 'class Solution:\n    def containsNearbyDuplicate(self, nums, k):\n        # TODO\n        return False\n',
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    monacoLanguage: 'javascript',
    template:
      'var containsNearbyDuplicate = function(nums, k) {\n  // TODO\n  return false;\n};\n',
  },
]

export async function fetchOjProblemDetail(problemId: string): Promise<OJProblem> {
  await new Promise((resolve) => setTimeout(resolve, 220))
  return {
    id: problemId,
    title: '219. 存在重复元素 II',
    difficulty: '简单',
    description:
      '给你一个整数数组 nums 和一个整数 k，判断数组中是否存在两个不同的索引 i 和 j，满足 nums[i] == nums[j] 且 abs(i - j) <= k。',
    inputDesc: '整数数组 nums 与整数 k。',
    outputDesc: '如果满足条件返回 true，否则返回 false。',
    samples: [
      { input: 'nums = [1,2,3,1], k = 3', output: 'true' },
      { input: 'nums = [1,0,1,1], k = 1', output: 'true' },
      { input: 'nums = [1,2,3,1,2,3], k = 2', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9', '0 <= k <= 10^5'],
    tags: ['哈希表', '数组', '滑动窗口'],
  }
}

export async function fetchOjLanguageOptions(): Promise<OJLanguageOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 80))
  return languageOptions
}

export async function runOjCode(code: string): Promise<OJJudgeResult> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  if (code.toLowerCase().includes('syntax_error')) {
    return {
      status: 'COMPILING_ERROR',
      message: '编译失败',
      compileError: 'Line 3: expected ; before return',
      testCases: [],
    }
  }
  if (code.toLowerCase().includes('runtime_error')) {
    return {
      status: 'RUNTIME_ERROR',
      message: '运行时错误',
      runtimeError: 'NullPointerException on line 7',
      runtimeMs: 2,
      memoryKb: 2250,
      testCases: [{ index: 1, input: '[1,2,3,1],3', expected: 'true', output: 'error', status: 'RUNTIME_ERROR' }],
    }
  }
  return {
    status: 'ACCEPTED',
    message: '运行成功',
    runtimeMs: 4,
    memoryKb: 2100,
    testCases: [
      { index: 1, input: '[1,2,3,1],3', expected: 'true', output: 'true', status: 'ACCEPTED' },
      { index: 2, input: '[1,0,1,1],1', expected: 'true', output: 'true', status: 'ACCEPTED' },
    ],
  }
}

export async function submitOjCode(code: string): Promise<OJJudgeResult> {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  if (code.toLowerCase().includes('wrong_answer')) {
    return {
      status: 'WRONG_ANSWER',
      message: '答案错误',
      runtimeMs: 6,
      memoryKb: 2300,
      testCases: [
        { index: 1, input: '[1,2,3,1],3', expected: 'true', output: 'false', status: 'WRONG_ANSWER' },
        { index: 2, input: '[1,0,1,1],1', expected: 'true', output: 'false', status: 'WRONG_ANSWER' },
      ],
    }
  }
  return {
    status: 'ACCEPTED',
    message: '提交通过',
    runtimeMs: 3,
    memoryKb: 2050,
    testCases: [
      { index: 1, input: '[1,2,3,1],3', expected: 'true', output: 'true', status: 'ACCEPTED' },
      { index: 2, input: '[1,0,1,1],1', expected: 'true', output: 'true', status: 'ACCEPTED' },
      { index: 3, input: '[1,2,3,1,2,3],2', expected: 'false', output: 'false', status: 'ACCEPTED' },
    ],
  }
}

