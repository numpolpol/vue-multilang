<template>
  <div v-if="mode === 'paging'" class="tabs-paging flex-shrink-0 px-4 pb-2">
    <div class="tabs w-full">
      <button 
        v-for="prefix in pagePrefixes" 
        :key="prefix" 
        :class="['tab', { 'tab-active': selectedPage === prefix }]" 
        @click="$emit('update:selectedPage', prefix)"
        :title="`Switch to ${prefix} section`"
      >
        {{ prefix }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'all' | 'paging'
  pagePrefixes: string[]
  selectedPage: string
}>()

defineEmits<{
  (e: 'update:selectedPage', value: string): void
}>()
</script>

<style scoped>
.tabs-paging {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: max-content;
  padding-bottom: 0.5rem;
}
.tab {
  padding: 0.4rem 1.2rem;
  border: 1px solid #ccc;
  border-bottom: none;
  background: #f9f9f9;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  color: #222;
  font-size: 0.98em;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: max-content;
  margin-bottom: 0.25rem;
}
.tab:hover {
  background: #e9e9e9;
  color: #111;
}
.tab-active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #fff;
  color: #222;
  box-shadow: 0 2px 8px 0 #0001;
}
</style>
