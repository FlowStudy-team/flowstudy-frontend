<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { OJLanguageOption } from '../../types/oj'

interface Props {
  languages: OJLanguageOption[]
  modelValue: OJLanguageOption['value']
  theme: 'light' | 'dark'
  fontSize: number
  running: boolean
  submitting: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [OJLanguageOption['value']]
  'update:theme': ['light' | 'dark']
  'update:fontSize': [number]
  run: []
  submit: []
  save: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const compactMode = ref(false)
const menuOpen = ref(false)
let observer: ResizeObserver | null = null
const COMPACT_THRESHOLD = 860

function closeMenu() {
  menuOpen.value = false
}

function onDocClick(event: MouseEvent) {
  if (!rootRef.value) return
  const target = event.target as Node | null
  if (target && !rootRef.value.contains(target)) {
    closeMenu()
  }
}

onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const width = entries[0]?.contentRect.width ?? 0
    compactMode.value = width < COMPACT_THRESHOLD
    if (!compactMode.value) {
      closeMenu()
    }
  })
  if (rootRef.value) observer.observe(rootRef.value)
  document.addEventListener('click', onDocClick)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  document.removeEventListener('click', onDocClick)
})
</script>

<template>
  <div ref="rootRef" class="oj-toolbar">
    <div class="oj-toolbar-left">
      <select :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as OJLanguageOption['value'])">
        <option v-for="language in languages" :key="language.value" :value="language.value">{{ language.label }}</option>
      </select>
      <div class="oj-inline-setting">
        <button class="secondary-btn" @click="emit('update:theme', theme === 'light' ? 'dark' : 'light')">
          {{ theme === 'light' ? '暗色' : '亮色' }}
        </button>
        <label class="oj-font-size">
          字号
          <input
            type="number"
            min="12"
            max="24"
            :value="fontSize"
            @change="emit('update:fontSize', Number(($event.target as HTMLInputElement).value))"
          />
        </label>
      </div>
    </div>
    <div class="oj-toolbar-right">
      <div v-if="compactMode" class="oj-more-wrap">
        <button class="secondary-btn" @click.stop="menuOpen = !menuOpen">更多</button>
        <div v-if="menuOpen" class="oj-more-menu">
          <button class="secondary-btn" @click="emit('save'); closeMenu()">保存草稿</button>
        </div>
      </div>
      <button v-else class="secondary-btn" @click="emit('save')">保存草稿</button>
      <button class="secondary-btn" :disabled="running || submitting" @click="emit('run')">
        {{ running ? '运行中...' : '运行' }}
      </button>
      <button class="primary-btn" :disabled="running || submitting" @click="emit('submit')">
        {{ submitting ? '提交中...' : '提交' }}
      </button>
    </div>
  </div>
</template>
