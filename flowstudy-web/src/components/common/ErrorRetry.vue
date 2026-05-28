<script setup lang="ts">
defineProps<{ text: string }>()
const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="card error-box">
    <span>{{ text }}</span>
    <button class="secondary-btn" @click="emit('retry')">Retry</button>
  </div>
</template>
