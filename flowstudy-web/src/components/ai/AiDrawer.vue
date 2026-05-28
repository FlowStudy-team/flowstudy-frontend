<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAiStore } from '../../store/modules/ai'

const aiStore = useAiStore()
const { open, loading, messages } = storeToRefs(aiStore)
const input = ref('')

async function send() {
  const content = input.value.trim()
  if (!content) return
  input.value = ''
  await aiStore.send(content)
}
</script>

<template>
  <aside v-if="open" class="ai-drawer">
    <header class="drawer-header">
      <strong>AI Assistant</strong>
      <button class="secondary-btn" @click="aiStore.toggle">Close</button>
    </header>
    <section class="drawer-body">
      <p v-if="messages.length === 0" class="muted">Ask about current article or problem.</p>
      <article v-for="msg in messages" :key="msg.id" class="msg" :class="msg.role">
        <strong>{{ msg.role === 'user' ? 'You' : 'AI' }}</strong>
        <p>{{ msg.content }}</p>
      </article>
      <p v-if="loading" class="muted">Streaming response...</p>
    </section>
    <footer class="drawer-footer">
      <input v-model="input" placeholder="Ask AI..." @keydown.enter="send" />
      <button class="primary-btn small" :disabled="loading" @click="send">Send</button>
    </footer>
  </aside>
</template>
