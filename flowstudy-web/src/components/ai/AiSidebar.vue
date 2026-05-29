<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAiStore } from '../../store/modules/ai'

interface Props {
  modelValue: boolean
  width: number
  title?: string
  emptyText?: string
  collapsedText?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 对话侧栏',
  emptyText: '可基于当前内容提问。',
  collapsedText: '展开 AI',
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'update:width': [number]
}>()

const aiStore = useAiStore()
const { loading, messages } = storeToRefs(aiStore)
const input = ref('')
const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function onStartResize(event: MouseEvent) {
  const host = (event.currentTarget as HTMLElement).closest('.ai-sidebar-host') as HTMLElement | null
  if (!host) return
  const rect = host.getBoundingClientRect()
  const startX = event.clientX
  const startWidth = props.width
  const onMove = (e: MouseEvent) => {
    const delta = startX - e.clientX
    const next = startWidth + delta
    const maxWidth = Math.floor(rect.width * 0.55)
    emit('update:width', clamp(next, 280, Math.max(320, maxWidth)))
  }
  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

async function send() {
  const text = input.value.trim()
  if (!text) return
  input.value = ''
  await aiStore.send(text)
}
</script>

<template>
  <div class="shared-ai-shell" :class="{ open }">
    <div v-if="open" class="shared-ai-resizer" @mousedown="onStartResize"></div>
    <aside v-if="open" class="shared-ai-panel">
      <div class="shared-ai-header">
        <strong>{{ title }}</strong>
        <button class="secondary-btn" @click="open = false">隐藏</button>
      </div>
      <div class="shared-ai-body">
        <p v-if="messages.length === 0" class="muted">{{ emptyText }}</p>
        <article v-for="msg in messages" :key="msg.id" class="msg" :class="msg.role">
          <strong>{{ msg.role === 'user' ? '你' : 'AI' }}</strong>
          <p>{{ msg.content }}</p>
        </article>
        <p v-if="loading" class="muted">AI 正在生成...</p>
      </div>
      <div class="shared-ai-footer">
        <input v-model="input" placeholder="输入你的问题" @keydown.enter="send" />
        <button class="primary-btn small" :disabled="loading" @click="send">发送</button>
      </div>
    </aside>
    <div v-else class="shared-ai-collapsed">
      <button class="reader-ai-toggle secondary-btn" @click="open = true">{{ collapsedText }}</button>
    </div>
  </div>
</template>

