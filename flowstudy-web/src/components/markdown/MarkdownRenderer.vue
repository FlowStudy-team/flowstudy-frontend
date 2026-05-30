<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css'

interface Props {
  modelValue: string
}

defineProps<Props>()
</script>

<template>
  <div class="document-md-renderer">
    <MdPreview editor-id="document-preview" :model-value="modelValue" />
  </div>
</template>

