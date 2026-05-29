<script setup lang="ts">
import type { OJTestCaseResult } from '../../types/oj'

interface Props {
  testCases: OJTestCaseResult[]
}

defineProps<Props>()
</script>

<template>
  <div class="oj-panel">
    <h3>测试用例</h3>
    <div v-if="!testCases.length" class="muted">暂无运行结果</div>
    <div v-for="item in testCases" :key="item.index" class="oj-testcase">
      <strong>Case {{ item.index }}</strong>
      <span class="muted">{{ item.status }}</span>
      <p>输入：{{ item.input }}</p>
      <p>期望：{{ item.expected }}</p>
      <p>输出：{{ item.output }}</p>
      <p v-if="item.message" class="error">{{ item.message }}</p>
    </div>
  </div>
</template>

