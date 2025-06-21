<template>
  <div class="navbar bg-base-100 shadow-lg flex-shrink-0 px-4">
    <div class="navbar-start">
      <label for="drawer" class="btn btn-square btn-ghost drawer-button">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </label>
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold">Multi Language Editor</h1>
        <div v-if="projectName" class="text-sm text-base-content/70">
          Project: {{ projectName }}
        </div>
      </div>
    </div>
    <div class="navbar-center">
      <!-- Display Mode Selector -->
      <div class="flex items-center gap-6">
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-medium">View Mode</span>
          </label>
          <select 
            :value="viewMode" 
            @change="$emit('update:viewMode', ($event.target as HTMLSelectElement).value as 'all' | 'paging')"
            class="select select-bordered select-sm w-32"
          >
            <option value="all">All Keys</option>
            <option value="paging">Sections</option>
          </select>
        </div>
        
        <!-- Highlight Mode Toggle -->
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-medium">Highlight Changes</span>
          </label>
          <input 
            type="checkbox" 
            :checked="highlightMode"
            @change="$emit('update:highlightMode', ($event.target as HTMLInputElement).checked)"
            class="toggle toggle-sm toggle-primary" 
          />
        </div>
        
        <!-- Skip Columns Configuration -->
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-medium">Skip Columns</span>
          </label>
          <select 
            :value="skipColumns" 
            @change="$emit('update:skipColumns', parseInt(($event.target as HTMLSelectElement).value))"
            class="select select-bordered select-sm w-24"
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        
        <!-- Multi Key Mode Toggle -->
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-medium">Multi Keys (Auto-merge matching values)</span>
          </label>
          <input 
            type="checkbox" 
            :checked="dualKeysMode"
            @change="$emit('update:dualKeysMode', ($event.target as HTMLInputElement).checked)"
            class="toggle toggle-sm toggle-accent" 
          />
        </div>
        
        <!-- Search Stats -->
        <div v-if="searchQuery" class="text-xs">
          <div class="font-medium text-primary">Search Active</div>
          <div class="text-base-content/70">{{ filteredCount }} / {{ totalKeys }} keys</div>
        </div>
      </div>
    </div>
    <div class="navbar-end">
      <!-- Add Key Button -->
      <button class="btn btn-primary btn-sm mr-4" @click="$emit('addKey')" title="Add New Key">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Key
      </button>
      
      <!-- Project Stats -->
      <div class="text-xs text-base-content/70 mr-4">
        <div v-if="totalKeys">{{ totalKeys }} keys total</div>
        <div v-if="languageCount">{{ languageCount }} languages</div>
      </div>
      
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
  viewMode: 'all' | 'paging'
  highlightMode: boolean
  searchQuery?: string
  filteredCount?: number
  totalKeys?: number
  languageCount?: number
  skipColumns: number
  dualKeysMode: boolean
}

defineProps<Props>()

defineEmits<{
  toggleDrawer: []
  'update:viewMode': [value: 'all' | 'paging']
  'update:highlightMode': [value: boolean]
  'update:skipColumns': [value: number]
  'update:dualKeysMode': [value: boolean]
  addKey: []
}>()
</script>
