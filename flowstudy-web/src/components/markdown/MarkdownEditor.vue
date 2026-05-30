<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '开始写文档...',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [string]
}>()
</script>

<template>
  <div class="document-md-editor-wrap">
    <MdEditor
      class="document-md-editor"
      :height="'100%'"
      :style="{ height: '100%' }"
      :model-value="modelValue"
      :preview="true"
      :toolbars-exclude="['github']"
      :placeholder="placeholder"
      :readonly="disabled"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.document-md-editor-wrap {
  height: 100%;
  min-height: 0;
}
</style>
