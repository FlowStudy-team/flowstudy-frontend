<script setup lang="ts">
defineProps<{ status: string }>()
</script>

<template>
  <span class="status-tag" :class="`st-${status.toLowerCase()}`">{{ status }}</span>
</template>
