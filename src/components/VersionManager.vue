<template>
  <div class="space-y-4">
    <!-- Version Management Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Project Versions</h3>
      <button 
        @click="showCreateVersionModal = true"
        class="btn btn-primary btn-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Version
      </button>
    </div>

    <!-- Current Version Info -->
    <div v-if="currentVersionInfo" class="alert alert-info">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div>
        <div class="font-semibold">Current Version: {{ currentVersionInfo.name }}</div>
        <div class="text-sm">{{ formatDate(currentVersionInfo.timestamp) }}</div>
      </div>
    </div>

    <!-- Versions List -->
    <div class="space-y-2">
      <h4 class="font-medium">All Versions ({{ versions.length }})</h4>
      
      <div v-if="versions.length === 0" class="text-center py-8 text-base-content/50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <p>No versions created yet</p>
        <p class="text-xs">Create a version to save the current state</p>
      </div>

      <div v-else class="space-y-2">
        <div 
          v-for="version in sortedVersions" 
          :key="version.id"
          class="card bg-base-200 shadow-sm"
        >
          <div class="card-body p-4">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h5 class="font-semibold">{{ version.name }}</h5>
                  <div v-if="version.id === currentVersionId" class="badge badge-primary badge-sm">Current</div>
                </div>
                <div class="text-sm text-base-content/70">{{ formatDate(version.timestamp) }}</div>
                <div v-if="version.description" class="text-sm mt-1">{{ version.description }}</div>
              </div>
              
              <div class="flex items-center gap-2">
                <!-- Load Version Button -->
                <button 
                  @click="loadVersion(version.id)"
                  :disabled="version.id === currentVersionId"
                  class="btn btn-sm btn-outline"
                  title="Load this version"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load
                </button>
                
                <!-- Compare Button -->
                <button 
                  @click="selectVersionForComparison(version.id)"
                  class="btn btn-sm btn-secondary"
                  :class="{ 'btn-active': selectedVersions.includes(version.id) }"
                  title="Select for comparison"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare
                </button>
                
                <!-- Delete Button -->
                <button 
                  @click="deleteVersion(version.id)"
                  :disabled="version.id === currentVersionId"
                  class="btn btn-sm btn-error btn-outline"
                  title="Delete version"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compare Section -->
    <div v-if="selectedVersions.length > 0" class="card bg-base-300">
      <div class="card-body p-4">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium">Version Comparison</h4>
            <div class="text-sm text-base-content/70">
              Selected: {{ selectedVersions.length }}/2 versions
            </div>
          </div>
          
          <div class="flex gap-2">
            <button 
              @click="selectedVersions = []"
              class="btn btn-sm btn-ghost"
            >
              Clear
            </button>
            <button 
              @click="showComparison"
              :disabled="selectedVersions.length !== 2"
              class="btn btn-sm btn-primary"
            >
              Compare Versions
            </button>
          </div>
        </div>
        
        <div v-if="selectedVersions.length === 2" class="mt-2 text-sm">
          <div class="flex items-center gap-2">
            <span class="badge badge-outline">Before:</span>
            <span>{{ getVersionName(selectedVersions[0]) }}</span>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <span class="badge badge-outline">After:</span>
            <span>{{ getVersionName(selectedVersions[1]) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Create Version Modal -->
  <dialog id="create_version_modal" class="modal" :class="{ 'modal-open': showCreateVersionModal }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Create New Version</h3>
      
      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Version Name *</span>
          </label>
          <input 
            v-model="newVersionName" 
            type="text" 
            placeholder="e.g., v1.0.0, Release Candidate, Beta 1"
            class="input input-bordered w-full"
            :class="{ 'input-error': versionNameError }"
            @keydown.enter="createVersion"
          />
          <label v-if="versionNameError" class="label">
            <span class="label-text-alt text-error">{{ versionNameError }}</span>
          </label>
        </div>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Description (Optional)</span>
          </label>
          <textarea 
            v-model="newVersionDescription" 
            placeholder="Describe what changed in this version..."
            class="textarea textarea-bordered w-full"
            rows="3"
          ></textarea>
        </div>
        
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-sm">
            This will save the current state of all translations and images as a new version.
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button @click="cancelCreateVersion" class="btn">Cancel</button>
        <button @click="createVersion" class="btn btn-primary" :disabled="!newVersionName.trim()">
          Create Version
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="cancelCreateVersion">close</button>
    </form>
  </dialog>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useFilesStore } from '../stores/files'

const emit = defineEmits<{
  (e: 'showDiff', beforeVersionId: string, afterVersionId: string): void
}>()

const filesStore = useFilesStore()

// Version creation
const showCreateVersionModal = ref(false)
const newVersionName = ref('')
const newVersionDescription = ref('')
const versionNameError = ref('')

// Version comparison
const selectedVersions = ref<string[]>([])

// Computed properties
const versions = computed(() => filesStore.getVersions())
const currentVersionId = computed(() => filesStore.getCurrentVersionId())

const sortedVersions = computed(() => {
  return [...versions.value].sort((a, b) => b.timestamp - a.timestamp)
})

const currentVersionInfo = computed(() => {
  if (!currentVersionId.value) return null
  return versions.value.find(v => v.id === currentVersionId.value)
})

// Methods
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function createVersion() {
  versionNameError.value = ''
  
  if (!newVersionName.value.trim()) {
    versionNameError.value = 'Version name is required'
    return
  }
  
  // Check for duplicate version names
  if (versions.value.some(v => v.name === newVersionName.value.trim())) {
    versionNameError.value = 'Version name already exists'
    return
  }
  
  const success = filesStore.createVersion(
    newVersionName.value.trim(),
    newVersionDescription.value.trim() || undefined
  )
  
  if (success) {
    cancelCreateVersion()
  } else {
    versionNameError.value = 'Failed to create version'
  }
}

function cancelCreateVersion() {
  showCreateVersionModal.value = false
  newVersionName.value = ''
  newVersionDescription.value = ''
  versionNameError.value = ''
}

function loadVersion(versionId: string) {
  if (confirm('Loading this version will replace your current work. Are you sure?')) {
    const success = filesStore.loadVersion(versionId)
    if (!success) {
      alert('Failed to load version')
    }
  }
}

function deleteVersion(versionId: string) {
  const version = versions.value.find(v => v.id === versionId)
  if (!version) return
  
  if (confirm(`Are you sure you want to delete version "${version.name}"? This action cannot be undone.`)) {
    const success = filesStore.deleteVersion(versionId)
    if (!success) {
      alert('Failed to delete version')
    }
    
    // Remove from selected versions if it was selected
    selectedVersions.value = selectedVersions.value.filter(id => id !== versionId)
  }
}

function selectVersionForComparison(versionId: string) {
  const index = selectedVersions.value.indexOf(versionId)
  
  if (index >= 0) {
    // Unselect
    selectedVersions.value.splice(index, 1)
  } else {
    // Select
    if (selectedVersions.value.length >= 2) {
      // Replace oldest selection
      selectedVersions.value.shift()
    }
    selectedVersions.value.push(versionId)
  }
}

function getVersionName(versionId: string): string {
  const version = versions.value.find(v => v.id === versionId)
  return version?.name || 'Unknown Version'
}

function showComparison() {
  if (selectedVersions.value.length === 2) {
    emit('showDiff', selectedVersions.value[0], selectedVersions.value[1])
  }
}
</script>
