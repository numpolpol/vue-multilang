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
        <div v-if="projectName" class="text-sm text-base-content/70 flex items-center gap-2">
          <span>Project:</span>
          <div v-if="!isEditingProjectName" class="flex items-center gap-2">
            <span class="font-medium">{{ projectName }}</span>
            <button 
              @click="startEditingProjectName" 
              class="btn btn-ghost btn-xs"
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
              class="input input-xs input-bordered bg-base-100 text-sm font-medium w-48"
              placeholder="Enter project name"
            />
            <button @click="saveProjectName" class="btn btn-success btn-xs" title="Save">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button @click="cancelEditingProjectName" class="btn btn-ghost btn-xs" title="Cancel">
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
      <div class="flex items-center gap-6">
        <div class="form-control">
          <label class="label pb-1">
            <span class="label-text text-xs font-medium">View Mode</span>
          </label>
          <div class="bg-base-200 rounded-lg p-2 flex gap-2">
            <label class="cursor-pointer flex items-center gap-2">
              <input 
                type="radio" 
                name="viewMode" 
                value="all" 
                :checked="viewMode === 'all'"
                @change="$emit('update:viewMode', 'all')"
                class="radio radio-sm radio-primary" 
              />
              <span class="text-sm">All Keys</span>
            </label>
            <label class="cursor-pointer flex items-center gap-2">
              <input 
                type="radio" 
                name="viewMode" 
                value="paging" 
                :checked="viewMode === 'paging'"
                @change="$emit('update:viewMode', 'paging')"
                class="radio radio-sm radio-primary" 
              />
              <span class="text-sm">Sections</span>
            </label>
          </div>
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
      <!-- Save Button -->
      <button class="btn btn-success btn-sm mr-2" @click="$emit('saveProject')" title="Save Project">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        Save
      </button>

      <!-- Export Button -->
      <button class="btn btn-accent btn-sm mr-4" @click="$emit('exportProject')" title="Export Project">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
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
  saveProject: []
  exportProject: []
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
