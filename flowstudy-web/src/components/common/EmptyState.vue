<script setup lang="ts">
defineProps<{ text?: string }>()
</script>

<template>
  <div class="card">{{ text ?? 'No data.' }}</div>
</template>
