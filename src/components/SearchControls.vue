<template>
  <div class="form-control">
    <label class="label">
      <span class="label-text font-semibold">Search</span>
      <span class="label-text-alt">{{ filteredCount }} / {{ totalKeys }} keys</span>
    </label>
    <div class="join w-full">
      <input 
        type="text" 
        :value="searchQuery" 
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        placeholder="Search... (empty:, key:, /regex/)" 
        class="input input-bordered input-sm join-item w-full" 
        title="Advanced search: empty: duplicate: key:pattern value:pattern lang:th:pattern /regex/ comma,separated" 
        :class="{ 'input-error': noResults }"
      />
      <button 
        class="btn btn-sm join-item" 
        :class="{ 'btn-error': noResults }"
        @click="$emit('clearSearch')"
        v-if="searchQuery"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
    <label class="label" v-if="noResults">
      <span class="label-text-alt text-error">No keys found</span>
    </label>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  searchQuery: string
  filteredCount: number
  totalKeys: number
  noResults: boolean
}

defineProps<Props>()

defineEmits<{
  'update:searchQuery': [value: string]
  clearSearch: []
}>()
</script>
