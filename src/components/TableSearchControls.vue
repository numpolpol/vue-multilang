<template>
  <div class="bg-base-200 flex-shrink-0 w-full px-4">
    <!-- Mode Indicator -->
    <div class="py-1 text-xs text-base-content/70">
      Mode: {{ mode === 'all' ? 'All Keys View' : 'Page Sections View' }}
      | {{ filteredKeysLength }} rows
      <span v-if="search.trim()">
        (filtered from {{ visibleKeysLength }})
      </span>
      <span v-if="mode === 'paging' && selectedPage">
        | Current: {{ selectedPage }}
      </span>
      <span v-if="mode === 'paging'">
        | {{ pagePrefixesLength }} sections available
      </span>
      <span v-if="dualKeysMode">
        | Multi Key Mode: ON
      </span>
    </div>
    
    <!-- Search -->
    <div class="form-control py-2 w-full">
      <div class="input-group">
        <div class="flex items-center gap-2 w-full">
          <button class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <input 
            :value="search" 
            @input="$emit('update:search', ($event.target as HTMLInputElement).value)" 
            type="text" 
            placeholder="Search keys or values..." 
            class="input input-bordered w-full" 
          />
          <button class="btn btn-primary btn-sm" @click="$emit('addKey')" title="Add New Key">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Key
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'all' | 'paging'
  search: string
  filteredKeysLength: number
  visibleKeysLength: number
  selectedPage: string
  pagePrefixesLength: number
  dualKeysMode?: boolean
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'addKey'): void
}>()
</script>
