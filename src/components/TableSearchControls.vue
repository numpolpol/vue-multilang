<template>
  <div class="bg-base-200 flex-shrink-0 w-full px-4">
    <!-- Mode Selector & Indicator -->
    <div class="flex justify-between items-center py-1">
      <div class="flex gap-2">
        <div class="btn-group">
          <button 
            class="btn btn-xs" 
            :class="{ 'btn-active': mode === 'all' }"
            @click="$emit('update:mode', 'all')"
            title="Show all keys"
          >
            All
          </button>
          <button 
            class="btn btn-xs" 
            :class="{ 'btn-active': mode === 'paging' }"
            @click="$emit('update:mode', 'paging')"
            title="Group by page sections"
          >
            Pages
          </button>
          <button 
            class="btn btn-xs" 
            :class="{ 'btn-active': mode === 'changes' }"
            @click="$emit('update:mode', 'changes')"
            title="Show only changed keys"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 1v1a1 1 0 001 1h6a1 1 0 001-1V5M7 8v8a2 2 0 002 2h6a2 2 0 002-2V8M8 12l2 2 4-4" />
            </svg>
            Changes
          </button>
        </div>
      </div>
      <div class="text-xs text-base-content/70">
        {{ mode === 'all' ? 'All Keys View' : mode === 'changes' ? 'Changes Only View' : 'Page Sections View' }}
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
    </div>
    
    <!-- Search -->
    <div class="form-control py-2 w-full">
      <div class="input-group">
        <div class="flex items-center gap-2 w-full">
          <button class="btn btn-square btn-ghost" :class="{ 'loading': searching }">
            <svg v-if="!searching" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span v-else class="loading loading-spinner loading-md"></span>
          </button>
          <input 
            :value="search" 
            @input="$emit('update:search', ($event.target as HTMLInputElement).value)" 
            type="text" 
            placeholder="Search... (try: empty:, key:, value:, /regex/, lang:th:)" 
            class="input input-bordered w-full" 
            :class="{ 'input-warning': searching }"
            title="Search modes: empty: (blank values), key:pattern (keys only), value:pattern (values only), lang:th:pattern (specific language), /regex/ (regex pattern), term1,term2 (multiple terms)" 
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
  mode: 'all' | 'paging' | 'changes'
  search: string
  filteredKeysLength: number
  visibleKeysLength: number
  selectedPage: string
  pagePrefixesLength: number
  dualKeysMode?: boolean
  searching?: boolean
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:mode', value: 'all' | 'paging' | 'changes'): void
  (e: 'addKey'): void
}>()
</script>
