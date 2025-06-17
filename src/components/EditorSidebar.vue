<template>
  <div class="drawer-side z-40">
    <label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <div class="menu p-4 w-80 min-h-full bg-base-200">
      <div class="space-y-4">
        <!-- Theme Selector -->
        <ThemeSelector :theme="theme" @updateTheme="$emit('updateTheme', $event)" />

        <!-- View Controls -->
        <ViewControls 
          :viewMode="viewMode" 
          :highlightMode="highlightMode"
          @update:viewMode="$emit('update:viewMode', $event)"
          @update:highlightMode="$emit('update:highlightMode', $event)"
        />

        <!-- Table Controls -->
        <div class="divider">Table Controls</div>
        
        <!-- Column Reset -->
        <button class="btn btn-sm btn-block" @click="$emit('resetColumnWidths')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Reset Column Widths
        </button>

        <!-- Search Controls -->
        <SearchControls
          :searchQuery="searchQuery"
          :filteredCount="filteredCount"
          :totalKeys="totalKeys"
          :noResults="noResults"
          @update:searchQuery="$emit('update:searchQuery', $event)"
          @clearSearch="$emit('clearSearch')"
        />

        <!-- Export Controls -->
        <ExportControls
          @exportAll="$emit('exportAll')"
          @exportChanged="$emit('exportChanged')"
          @exportOriginal="$emit('exportOriginal')"
          @goBack="$emit('goBack')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ThemeSelector from './ThemeSelector.vue'
import ViewControls from './ViewControls.vue'
import SearchControls from './SearchControls.vue'
import ExportControls from './ExportControls.vue'

interface Props {
  theme: string
  viewMode: 'all' | 'paging'
  highlightMode: boolean
  searchQuery: string
  filteredCount: number
  totalKeys: number
  noResults: boolean
}

defineProps<Props>()

defineEmits<{
  updateTheme: [event: Event]
  'update:viewMode': [value: 'all' | 'paging']
  'update:highlightMode': [value: boolean]
  resetColumnWidths: []
  'update:searchQuery': [value: string]
  clearSearch: []
  exportAll: []
  exportChanged: []
  exportOriginal: []
  goBack: []
}>()
</script>
