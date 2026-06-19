<script setup lang="ts">
import { reactive, watch } from 'vue'

interface Props {
  open: boolean
  parentName?: string
  loading?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [string]
}>()

const form = reactive({
  name: '',
})

watch(
  () => props.open,
  (open) => {
    if (open) form.name = ''
  },
)

function submit() {
  const name = form.name.trim()
  if (!name) return
  emit('submit', name)
}
</script>

<template>
  <div v-if="open" class="document-dialog-mask" @click.self="emit('close')">
    <section class="document-dialog document-folder-dialog">
      <header>
        <h3>新建文件夹</h3>
      </header>
      <div class="document-dialog-body">
        <p class="muted">位置：{{ parentName || '全部文档' }}</p>
        <label>文件夹名称</label>
        <input v-model="form.name" placeholder="输入文件夹名称" @keydown.enter="submit" />
        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
      <footer>
        <button class="secondary-btn" type="button" :disabled="loading" @click="emit('close')">取消</button>
        <button class="primary-btn" type="button" :disabled="loading || !form.name.trim()" @click="submit">
          {{ loading ? '创建中...' : '创建' }}
        </button>
      </footer>
    </section>
  </div>
</template>
