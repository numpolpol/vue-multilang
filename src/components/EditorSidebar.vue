<template>
  <div class="drawer-side z-40">
    <label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <div class="menu p-4 w-80 min-h-full bg-base-200 overflow-y-auto">
      <div class="space-y-3 flex flex-col h-full">
        <!-- Theme Selector -->
        <div class="flex-shrink-0">
          <ThemeSelector :theme="theme" @updateTheme="$emit('updateTheme', $event)" />
        </div>

        <!-- Project Management -->
        <div class="flex-shrink-0">
          <div class="divider my-2 text-sm">Project</div>
          
          <!-- Save Project -->
          <div class="flex gap-1">
            <button class="btn btn-xs btn-outline flex-1 text-xs" @click="$emit('saveProjectToLocalStorage')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save
            </button>
            <button class="btn btn-xs btn-outline flex-1 text-xs" @click="$emit('saveProjectToFile')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download
            </button>
          </div>
        </div>

        <!-- Column Manager -->
        <div class="flex-shrink-0">
          <ColumnManager 
            @language-added="(code) => $emit('languageAdded', code)"
            @language-removed="(code) => $emit('languageRemoved', code)"
            @languages-reordered="(from, to) => $emit('languagesReordered', from, to)"
          />
        </div>

        <!-- Table Controls -->
        <div class="flex-shrink-0">
          <div class="divider my-2 text-sm">Table Controls</div>
        </div>

        <!-- Search Controls -->
        <div class="flex-shrink-0">
          <SearchControls
            :searchQuery="searchQuery"
            :filteredCount="filteredCount"
            :totalKeys="totalKeys"
            :noResults="noResults"
            @update:searchQuery="$emit('update:searchQuery', $event)"
            @clearSearch="$emit('clearSearch')"
          />
        </div>

        <!-- Export Controls -->
        <div class="flex-shrink-0">
          <ExportControls
            @exportAll="$emit('exportAll')"
            @exportChanged="$emit('exportChanged')"
            @exportOriginal="$emit('exportOriginal')"
            @goBack="$emit('goBack')"
          />
        </div>
        
        <!-- Version Management -->
        <div class="flex-1 min-h-0">
          <div class="divider my-2 text-sm">Version Management</div>
          <div class="overflow-y-auto max-h-full">
            <VersionManager @showDiff="handleShowDiff" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ThemeSelector from './ThemeSelector.vue'
import SearchControls from './SearchControls.vue'
import ExportControls from './ExportControls.vue'
import VersionManager from './VersionManager.vue'
import ColumnManager from './ColumnManager.vue'

interface Props {
  theme: string
  searchQuery: string
  filteredCount: number
  totalKeys: number
  noResults: boolean
  languageCount: number
  languages: string[]
}

defineProps<Props>()

const emit = defineEmits<{
  updateTheme: [event: Event]
  'update:searchQuery': [value: string]
  clearSearch: []
  exportAll: []
  exportChanged: []
  exportOriginal: []
  goBack: []
  saveProjectToLocalStorage: []
  saveProjectToFile: []
  showVersionDiff: [beforeVersionId: string, afterVersionId: string]
  languageAdded: [languageCode: string]
  languageRemoved: [languageCode: string]
  languagesReordered: [fromIndex: number, toIndex: number]
}>()

function handleShowDiff(beforeVersionId: string, afterVersionId: string) {
  emit('showVersionDiff', beforeVersionId, afterVersionId)
}
</script>
