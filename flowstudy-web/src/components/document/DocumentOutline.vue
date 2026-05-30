<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const outline = computed(() => {
  const lines = props.content.split('\n')
  return lines
    .map((line) => {
      const matched = /^(#{1,3})\s+(.+)$/.exec(line.trim())
      if (!matched) return null
      return { level: matched[1].length, text: matched[2] }
    })
    .filter((item): item is { level: number; text: string } => Boolean(item))
})
</script>

<template>
  <div class="document-outline">
    <h4>文章大纲</h4>
    <ul v-if="outline.length">
      <li v-for="(item, idx) in outline" :key="`${item.text}-${idx}`" :class="`lv-${item.level}`">{{ item.text }}</li>
    </ul>
    <p v-else class="muted">暂无标题结构</p>
  </div>
</template>
