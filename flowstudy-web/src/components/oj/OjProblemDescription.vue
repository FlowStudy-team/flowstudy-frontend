<script setup lang="ts">
import type { OJProblem } from '../../types/oj'
import MarkdownRenderer from '../markdown/MarkdownRenderer.vue'

interface Props {
  problem: OJProblem
}

defineProps<Props>()
</script>

<template>
  <div class="oj-problem-description">
    <h1>{{ problem.title }}</h1>
    <div class="oj-problem-meta">
      <span class="oj-difficulty">{{ problem.difficulty }}</span>
      <span v-for="tag in problem.tags" :key="tag" class="oj-tag">{{ tag }}</span>
    </div>
    <MarkdownRenderer :model-value="problem.description" />
    <p><strong>输入描述：</strong>{{ problem.inputDesc }}</p>
    <p><strong>输出描述：</strong>{{ problem.outputDesc }}</p>
    <h3>样例</h3>
    <div v-for="(sample, idx) in problem.samples" :key="idx" class="oj-block">
      <p><strong>输入：</strong></p>
      <pre>{{ sample.input }}</pre>
      <p><strong>输出：</strong></p>
      <pre>{{ sample.output }}</pre>
      <p v-if="sample.explanation"><strong>解释：</strong>{{ sample.explanation }}</p>
    </div>
    <h3>限制</h3>
    <ul>
      <li v-for="item in problem.constraints" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>
