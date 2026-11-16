<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProjectNode } from '../services/structure'

const props = withDefaults(defineProps<{
  node: ProjectNode
  selectedId: string
  depth?: number
  expandKey: number
  collapseKey: number
  autoOpen?: boolean
}>(), { depth: 0, autoOpen: false })

const emit = defineEmits<{ select: [id: string] }>()
const isOpen = ref(props.depth === 0 || props.autoOpen || props.expandKey > props.collapseKey)
const hasChildren = computed(() => Boolean(props.node.children?.length))

watch(() => props.expandKey, () => { isOpen.value = true })
watch(() => props.collapseKey, () => { isOpen.value = props.depth === 0 })
watch(() => props.autoOpen, value => { if (value) isOpen.value = true })

function activate() {
  emit('select', props.node.id)
  if (hasChildren.value) isOpen.value = !isOpen.value
}
</script>

<template>
  <div class="tree-node">
    <div class="tree-row" :class="{ selected: selectedId === node.id, 'is-folder': node.kind === 'folder' }" :style="{ '--depth': depth }">
      <button v-if="hasChildren" class="tree-chevron" type="button" :aria-label="isOpen ? 'Yig‘ish' : 'Ochish'" @click="isOpen = !isOpen">{{ isOpen ? '⌄' : '›' }}</button>
      <span v-else class="tree-spacer"></span>
      <button class="tree-item" type="button" :aria-current="selectedId === node.id ? 'true' : undefined" @click="activate">
        <span class="node-icon" :class="node.kind">{{ node.kind === 'folder' ? '▰' : node.kind === 'data' ? '{ }' : '▤' }}</span>
        <span class="node-name">{{ node.name }}</span>
        <span v-if="node.badge" class="node-badge">{{ node.badge }}</span>
      </button>
    </div>
    <div v-if="hasChildren && isOpen" class="tree-children">
      <TreeNode v-for="child in node.children" :key="child.id" :node="child" :selected-id="selectedId" :depth="depth + 1" :expand-key="expandKey" :collapse-key="collapseKey" :auto-open="autoOpen" @select="emit('select', $event)" />
    </div>
  </div>
</template>
