<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAiStore } from '../../store/modules/ai'

const aiStore = useAiStore()
const { open, loading, messages, conversations, conversationId, noteLoading, noteResult, noteError } = storeToRefs(aiStore)
const input = ref('')
onMounted(() => {
  void aiStore.loadLatestConversation()
})

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
      <select
        v-if="conversations.length"
        :value="conversationId ?? ''"
        @change="aiStore.loadConversation(Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="item in conversations" :key="item.id" :value="item.id">
          {{ item.title || ('Conversation ' + item.id) }}
        </option>
      </select>
      <button class="secondary-btn small" @click="aiStore.newConversation">New</button>
      <button class="secondary-btn small" :disabled="noteLoading" @click="aiStore.generateNote">{{ noteLoading ? 'Generating...' : 'Generate note' }}</button>
      <button class="secondary-btn" @click="aiStore.toggle">Close</button>
    </header>
    <section class="drawer-body">
      <article v-if="noteResult" class="msg assistant"><strong>Learning note</strong><p>{{ noteResult }}</p></article>
      <p v-if="noteError" class="muted">{{ noteError }}</p>
      <p v-if="messages.length === 0" class="muted">Ask about current tutorial, blog, or problem.</p>
      <article v-for="msg in messages" :key="msg.id" class="msg" :class="msg.role">
        <strong>{{ msg.role === 'user' ? 'You' : 'AI' }}</strong>
        <p>{{ msg.content }}</p>
      </article>
      <p v-if="loading" class="muted">Streaming response...</p>
    </section>
    <footer class="drawer-footer">
      <input v-model="input" placeholder="Ask AI..." @keydown.enter="send" :disabled="loading" />
      <button v-if="loading" class="secondary-btn" @click="aiStore.cancel">Stop</button>
      <button v-else class="primary-btn small" :disabled="loading" @click="send">Send</button>
    </footer>
  </aside>
</template>
