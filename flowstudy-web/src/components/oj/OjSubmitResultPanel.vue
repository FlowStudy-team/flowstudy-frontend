<script setup lang="ts">
import type { OJJudgeResult } from '../../types/oj'

interface Props {
  result: OJJudgeResult | null
}

const props = defineProps<Props>()

function statusText(status: OJJudgeResult['status']) {
  const map: Record<OJJudgeResult['status'], string> = {
    PENDING: '等待中',
    COMPILING_ERROR: '编译错误',
    RUNTIME_ERROR: '运行错误',
    WRONG_ANSWER: '答案错误',
    ACCEPTED: '通过',
  }
  return map[status]
}

function statusClass(status: OJJudgeResult['status']) {
  if (status === 'ACCEPTED') return 'st-ac'
  if (status === 'COMPILING_ERROR' || status === 'RUNTIME_ERROR' || status === 'WRONG_ANSWER') return 'st-wa'
  return 'st-pending'
}
</script>

<template>
  <div class="oj-panel">
    <h3>评测结果</h3>
    <div v-if="!props.result" class="muted">请先运行或提交代码</div>
    <template v-else>
      <p><span class="status-tag" :class="statusClass(props.result.status)">{{ statusText(props.result.status) }}</span></p>
      <p>{{ props.result.message }}</p>
      <p v-if="props.result.runtimeMs !== undefined">运行时间：{{ props.result.runtimeMs }} ms</p>
      <p v-if="props.result.memoryKb !== undefined">内存：{{ props.result.memoryKb }} KB</p>
      <pre v-if="props.result.compileError" class="oj-error-block">{{ props.result.compileError }}</pre>
      <pre v-if="props.result.runtimeError" class="oj-error-block">{{ props.result.runtimeError }}</pre>
    </template>
  </div>
</template>

