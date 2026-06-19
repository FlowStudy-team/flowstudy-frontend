<script setup lang="ts">
import type { DocumentFolder } from '../../types/document'

interface Props {
  folders: DocumentFolder[]
  selectedId?: number
  expandedIds: number[]
  showRoot?: boolean
}

withDefaults(defineProps<Props>(), {
  showRoot: true,
})

const emit = defineEmits<{
  select: [number | undefined]
  toggle: [number]
}>()
</script>

<template>
  <nav class="document-folder-tree">
    <button
      v-if="showRoot"
      class="folder-tree-root"
      :class="{ active: selectedId === undefined }"
      type="button"
      @click="emit('select', undefined)"
    >
      <span class="folder-icon">⌂</span>
      <span>全部文档</span>
    </button>
    <ul>
      <li v-for="folder in folders" :key="folder.id">
        <div class="folder-tree-row" :class="{ active: selectedId === folder.id }">
          <button
            class="folder-tree-toggle"
            type="button"
            :disabled="!folder.children?.length"
            @click.stop="emit('toggle', folder.id)"
          >
            {{ folder.children?.length ? (expandedIds.includes(folder.id) ? '⌄' : '›') : '' }}
          </button>
          <button class="folder-tree-name" type="button" @click="emit('select', folder.id)">
            <span class="folder-icon">▣</span>
            <span>{{ folder.name }}</span>
          </button>
        </div>
        <DocumentFolderTree
          v-if="folder.children?.length && expandedIds.includes(folder.id)"
          :folders="folder.children"
          :selected-id="selectedId"
          :expanded-ids="expandedIds"
          :show-root="false"
          @select="emit('select', $event)"
          @toggle="emit('toggle', $event)"
        />
      </li>
    </ul>
  </nav>
</template>
