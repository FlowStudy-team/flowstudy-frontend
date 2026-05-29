<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: string
  language: 'java' | 'cpp' | 'python' | 'javascript'
  theme: 'light' | 'dark'
  fontSize: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [string]
  run: []
  save: []
}>()

const containerRef = ref<HTMLElement | null>(null)
let editorInstance: import('monaco-editor').editor.IStandaloneCodeEditor | null = null
let monacoRef: typeof import('monaco-editor') | null = null

async function setupMonaco() {
  if (!containerRef.value) return
  const monaco = await import('monaco-editor')
  monacoRef = monaco
  editorInstance = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme === 'dark' ? 'vs-dark' : 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: props.fontSize,
    scrollBeyondLastLine: false,
  })
  editorInstance.onDidChangeModelContent(() => {
    emit('update:modelValue', editorInstance?.getValue() ?? '')
  })

  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => emit('run'))
  editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => emit('save'))
}

watch(
  () => props.modelValue,
  (value) => {
    if (!editorInstance) return
    if (editorInstance.getValue() !== value) {
      editorInstance.setValue(value)
    }
  },
)

watch(
  () => props.language,
  (value) => {
    if (!editorInstance || !monacoRef) return
    const model = editorInstance.getModel()
    if (model) {
      monacoRef.editor.setModelLanguage(model, value)
    }
  },
)

watch(
  () => props.theme,
  (value) => {
    if (!monacoRef) return
    monacoRef.editor.setTheme(value === 'dark' ? 'vs-dark' : 'vs')
  },
)

watch(
  () => props.fontSize,
  (value) => {
    if (!editorInstance) return
    editorInstance.updateOptions({ fontSize: value })
  },
)

onMounted(setupMonaco)

onBeforeUnmount(() => {
  editorInstance?.dispose()
  editorInstance = null
})
</script>

<template>
  <div ref="containerRef" class="oj-code-editor"></div>
</template>

