<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; pageSize: number; total: number }>()
const emit = defineEmits<{ change: [number] }>()
const maxPage = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <div class="pager">
    <button class="secondary-btn" :disabled="page <= 1" @click="emit('change', page - 1)">Prev</button>
    <span>{{ page }} / {{ maxPage }}</span>
    <button class="secondary-btn" :disabled="page >= maxPage" @click="emit('change', page + 1)">
      Next
    </button>
  </div>
</template>
