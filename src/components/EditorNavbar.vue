<template>
  <div class="navbar bg-base-100 shadow-lg flex-shrink-0 px-4">
    <div class="navbar-start">
      <label for="drawer" class="btn btn-square btn-ghost drawer-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </label>
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold">iOS/Android Multi-file Editor</h1>
        <div v-if="projectName" class="text-sm text-base-content/70">
          Project: {{ projectName }}
        </div>
      </div>
    </div>
    <div class="navbar-end">
      <button class="btn btn-ghost btn-sm" @click="$emit('toggleDrawer')" title="Toggle Sidebar">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  projectName?: string
}

defineProps<Props>()

defineEmits<{
  toggleDrawer: []
}>()
</script>
