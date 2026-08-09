<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { PublishDocumentPayload } from '../../types/document'

interface Props {
  open: boolean
  seedTitle: string
  seedSummary: string
  seedTags: string[]
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  submit: [PublishDocumentPayload]
}>()

const form = reactive<PublishDocumentPayload>({
  title: '',
  summary: '',
  coverUrl: '',
  tags: [],
  visible: true,
  allowComment: true,
})

watch(
  () => props.open,
  (value) => {
    if (!value) return
    form.title = props.seedTitle
    form.summary = props.seedSummary
    form.tags = props.seedTags.slice()
    form.coverUrl = ''
    form.visible = true
    form.allowComment = true
  },
  { immediate: true },
)

function onTagsInput(raw: string) {
  form.tags = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
</script>

<template>
  <div v-if="open" class="document-dialog-mask" @click.self="emit('close')">
    <section class="document-dialog">
      <header>
        <h3>发布为博客</h3>
      </header>
      <div class="document-dialog-body">
        <label>博客标题</label>
        <input v-model="form.title" />
        <label>摘要</label>
        <textarea v-model="form.summary" rows="3" />
        <label>封面 URL</label>
        <input v-model="form.coverUrl" placeholder="暂用 URL，后续可接上传" />
        <label>标签（逗号分隔）</label>
        <input :value="form.tags.join(', ')" @input="onTagsInput(($event.target as HTMLInputElement).value)" />
      </div>
      <div v-if="props.error" class="error-box" style="margin-bottom: 12px; padding: 8px 12px; border-radius: 6px; background: #fff0f0; color: #d44; font-size: 13px;">
        {{ props.error }}
      </div>
      <footer>
        <button class="secondary-btn" @click="emit('close')">取消</button>
        <button class="primary-btn" @click="emit('submit', form)">确认发布</button>
      </footer>
    </section>
  </div>
</template>
