<template>
  <div class="navbar bg-gradient-to-r from-base-100 to-base-200 shadow-xl border-b border-base-300 flex-shrink-0 px-6">
    <div class="navbar-start">
      <label for="drawer" class="btn btn-square btn-ghost drawer-button hover:bg-primary/10 transition-all duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </label>
      <div class="flex flex-col ml-3">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Multi Language Editor
        </h1>
        <div v-if="projectName" class="text-sm text-base-content/70 flex items-center gap-2 mt-1">
          <span class="text-xs uppercase tracking-wide font-medium opacity-60">Project:</span>
          <div v-if="!isEditingProjectName" class="flex items-center gap-2">
            <span class="font-semibold text-base-content px-2 py-1 bg-base-200 rounded-md">{{ projectName }}</span>
            <button 
              @click="startEditingProjectName" 
              class="btn btn-ghost btn-xs hover:bg-primary/10 transition-all duration-200"
              title="Rename project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          <div v-else class="flex items-center gap-2">
            <input 
              ref="projectNameInput"
              v-model="editingProjectName"
              @blur="saveProjectName"
              @keyup.enter="saveProjectName"
              @keyup.escape="cancelEditingProjectName"
              class="input input-xs input-bordered bg-base-100 text-sm font-medium w-48 focus:ring-2 focus:ring-primary/20"
              placeholder="Enter project name"
            />
            <button @click="saveProjectName" class="btn btn-success btn-xs hover:scale-105 transition-transform" title="Save">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button @click="cancelEditingProjectName" class="btn btn-ghost btn-xs hover:scale-105 transition-transform" title="Cancel">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="navbar-center">
      <!-- Display Mode Selector -->
      <div class="flex items-center gap-8">
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-semibold uppercase tracking-wide text-base-content/60">View Mode</span>
          </label>
          <div class="bg-base-300/50 backdrop-blur-sm rounded-xl p-1 flex gap-1 border border-base-300/50">
            <label class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-base-100/80">
              <input 
                type="radio" 
                name="viewMode" 
                value="all" 
                :checked="viewMode === 'all'"
                @change="$emit('update:viewMode', 'all')"
                class="radio radio-sm radio-primary" 
              />
              <span class="text-sm font-medium">All Keys</span>
            </label>
            <label class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-base-100/80">
              <input 
                type="radio" 
                name="viewMode" 
                value="paging" 
                :checked="viewMode === 'paging'"
                @change="$emit('update:viewMode', 'paging')"
                class="radio radio-sm radio-primary" 
              />
              <span class="text-sm font-medium">Sections</span>
            </label>
          </div>
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
        
        <!-- Search Stats -->
        <div v-if="searchQuery" class="text-xs">
          <div class="font-medium text-primary">Search Active</div>
          <div class="text-base-content/70">{{ filteredCount }} / {{ totalKeys }} keys</div>
        </div>
      </div>
    </div>
    <div class="navbar-end">
      <!-- Export All Columns Button -->
      <button 
        class="btn btn-sm mr-2 btn-accent group transition-all duration-300 hover:scale-105" 
        @click="$emit('exportAllColumns')" 
        :title="'Export all language columns as separate .strings files'"
        :disabled="languageCount === 0"
      >
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">Export All</span>
        </div>
      </button>

      <!-- Save Button with enhanced status -->
      <button 
        class="btn btn-sm mr-2 group transition-all duration-300 btn-primary hover:scale-105"
        @click="$emit('saveProject')" 
        :title="'Download project as JSON file'"
      >
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">Save Project</span>

        </div>
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
import { ref, nextTick } from 'vue'
import { useFilesStore } from '../stores/files'

interface Props {
  savedCount: number
  totalKeys: number
  filteredCount: number
  searchQuery: string
  projectName?: string
  languageCount?: number
  viewMode: 'all' | 'paging'
  skipColumns: number
}

defineProps<Props>()

defineEmits<{
  toggleDrawer: []
  'update:viewMode': [value: 'all' | 'paging']
  'update:skipColumns': [value: number]
  saveProject: []
  exportAllColumns: []
}>()

const filesStore = useFilesStore()

// Project name editing
const isEditingProjectName = ref(false)
const editingProjectName = ref('')
const projectNameInput = ref<HTMLInputElement>()

function startEditingProjectName() {
  editingProjectName.value = filesStore.currentProject?.name || 'Untitled'
  isEditingProjectName.value = true
  nextTick(() => {
    projectNameInput.value?.focus()
    projectNameInput.value?.select()
  })
}

function saveProjectName() {
  const newName = editingProjectName.value.trim()
  if (newName && filesStore.currentProject) {
    filesStore.updateProjectName(newName)
  }
  isEditingProjectName.value = false
}

function cancelEditingProjectName() {
  isEditingProjectName.value = false
  editingProjectName.value = ''
}
</script>
