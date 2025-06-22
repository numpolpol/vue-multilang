<template>
  <div class="drawer h-screen p-0 m-0 w-full max-w-none">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <!-- Drawer Sidebar -->
    <EditorSidebar
      :theme="theme"
      :searchQuery="searchQuery"
      :filteredCount="filteredCount"
      :totalKeys="totalKeys"
      :noResults="noResults"
      :languageCount="filesStore.files.length"
      :languages="filesStore.files.map(file => file.name.replace(/\.(strings|xml)$/, ''))"
      @updateTheme="updateTheme"
      @resetColumnWidths="resetColumnWidths"
      @update:searchQuery="searchQuery = $event"
      @clearSearch="clearSearch"
      @exportAll="jsonTable?.openExportModal('all')"
      @exportChanged="jsonTable?.openExportModal('changed')"
      @exportOriginal="jsonTable?.openExportModal('original')"
      @goBack="goBack"
      @saveProjectToLocalStorage="saveProjectToLocalStorage"
      @saveProjectToFile="saveProjectToFile"
      @showVersionDiff="showVersionDiff"
    />
    
    <!-- Page content -->
    <div class="drawer-content flex flex-col h-screen p-0 m-0 w-full max-w-none">
      <!-- Navbar -->
      <EditorNavbar 
        :projectName="filesStore.currentProject?.name"
        :viewMode="viewMode"
        :highlightMode="highlightMode"
        :skipColumns="skipColumns"
        :dualKeysMode="dualKeysMode"
        :searchQuery="searchQuery"
        :filteredCount="filteredCount"
        :totalKeys="totalKeys"
        :languageCount="filesStore.files.length"
        @toggleDrawer="toggleDrawer"
        @update:viewMode="viewMode = $event"
        @update:highlightMode="highlightMode = $event"
        @update:skipColumns="skipColumns = $event"
        @update:dualKeysMode="dualKeysMode = $event"
        @saveProject="saveProjectToLocalStorage"
        @exportProject="jsonTable?.openExportModal('all')"
      />

      <div class="flex-1 overflow-hidden p-0 m-0 w-full">
        <JsonTable 
          :data="filesStore.stringsData" 
          :files="filesStore.files" 
          :skipColumns="skipColumns"
          :dualKeysMode="dualKeysMode"
          @back="goBack" 
          @addKey="showAddKeyModal"
          ref="jsonTable" 
        />
      </div>
    </div>
    
    <!-- Add Key Modal -->
    <dialog id="add_key_modal" class="modal">
      <div class="modal-box w-11/12 max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Add New Keys</h3>
        
        <!-- Mode Selector -->
        <div class="tabs tabs-boxed mb-4">
          <button 
            :class="['tab', { 'tab-active': addKeyMode === 'single' }]" 
            @click="addKeyMode = 'single'"
          >
            Single Key
          </button>
          <button 
            :class="['tab', { 'tab-active': addKeyMode === 'bulk' }]" 
            @click="addKeyMode = 'bulk'"
          >
            Bulk Keys
          </button>
        </div>

        <!-- Single Key Mode -->
        <div v-if="addKeyMode === 'single'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Key Name</span>
            </label>
            <input 
              v-model="newKeyName" 
              type="text" 
              placeholder="e.g., welcome_message or home_title"
              class="input input-bordered w-full"
              @keydown.enter="addNewKey"
            />
            <label class="label">
              <span class="label-text-alt">Use underscore for grouping (e.g., home_title, settings_button)</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Default Value (optional)</span>
            </label>
            <input 
              v-model="newKeyDefaultValue" 
              type="text" 
              placeholder="Default text for all languages"
              class="input input-bordered w-full"
              @keydown.enter="addNewKey"
            />
          </div>
        </div>

        <!-- Bulk Keys Mode -->
        <div v-if="addKeyMode === 'bulk'" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Key Names (one per line or comma-separated)</span>
            </label>
            <textarea 
              v-model="bulkKeyNames" 
              class="textarea textarea-bordered h-32"
              placeholder="common_ok
common_cancel
common_confirm

Or comma-separated:
common_ok, common_cancel, common_confirm"
            ></textarea>
            <label class="label">
              <span class="label-text-alt">{{ parsedBulkKeys.length }} keys detected</span>
            </label>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Default Value for All Keys (optional)</span>
            </label>
            <input 
              v-model="bulkDefaultValue" 
              type="text" 
              placeholder="Default text for all keys and all languages"
              class="input input-bordered w-full"
            />
          </div>

          <!-- Preview -->
          <div v-if="parsedBulkKeys.length > 0" class="bg-base-200 rounded-lg p-3">
            <div class="text-sm font-medium mb-2">Preview keys to be added:</div>
            <div class="text-xs space-y-1 max-h-32 overflow-y-auto">
              <div v-for="key in parsedBulkKeys" :key="key" class="flex items-center gap-2">
                <div class="w-2 h-2 bg-primary rounded-full"></div>
                <span class="font-mono">{{ key }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="addKeyError" class="alert alert-error mt-4">
          <span>{{ addKeyError }}</span>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="closeAddKeyModal">Cancel</button>
          <button 
            class="btn btn-primary" 
            @click="addKeyMode === 'single' ? addNewKey() : addBulkKeys()" 
            :disabled="addKeyMode === 'single' ? !newKeyName.trim() : parsedBulkKeys.length === 0"
          >
            {{ addKeyMode === 'single' ? 'Add Key' : `Add ${parsedBulkKeys.length} Keys` }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeAddKeyModal">close</button>
      </form>
    </dialog>
    
    <!-- Version Diff Modal -->
    <dialog id="version_diff_modal" class="modal" :class="{ 'modal-open': showVersionDiffModal }">
      <div class="modal-box w-11/12 max-w-7xl h-5/6 p-0">
        <div class="p-6 h-full overflow-auto">
          <VersionDiff 
            v-if="showVersionDiffModal && diffBeforeVersionId && diffAfterVersionId"
            :beforeVersionId="diffBeforeVersionId"
            :afterVersionId="diffAfterVersionId"
            @close="closeVersionDiff"
          />
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeVersionDiff">close</button>
      </form>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import JsonTable from '../components/JsonTable.vue'
import EditorSidebar from '../components/EditorSidebar.vue'
import EditorNavbar from '../components/EditorNavbar.vue'
import VersionDiff from '../components/VersionDiff.vue'

interface JsonTableWithControls {
  mode: 'all' | 'paging'
  highlightMode: boolean
  search: string
  skipColumns: number
  resetColumnWidths: () => void
  openExportModal: (mode: 'all' | 'changed' | 'original') => void
}

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)
const jsonTable = ref<JsonTableWithControls | null>(null)

// View controls
const viewMode = ref<'all' | 'paging'>('all')
const highlightMode = ref(false)
const searchQuery = ref('')
const skipColumns = ref(0)
const dualKeysMode = ref(false)

// Watch dualKeysMode changes and sync with store
watch(dualKeysMode, (newValue) => {
  filesStore.setDualKeysMode(newValue)
}, { immediate: true })

// Computed properties for search results
const filteredCount = ref(0)
const totalKeys = ref(0)
const noResults = ref(false)

// Version diff state
const showVersionDiffModal = ref(false)
const diffBeforeVersionId = ref('')
const diffAfterVersionId = ref('')

// Add Key Modal
const newKeyName = ref('')
const newKeyDefaultValue = ref('')
const addKeyError = ref('')
const addKeyMode = ref<'single' | 'bulk'>('single')
const bulkKeyNames = ref('')
const bulkDefaultValue = ref('')

// Computed property for parsing bulk keys
const parsedBulkKeys = computed(() => {
  if (!bulkKeyNames.value.trim()) return []
  
  // Split by newlines or commas and clean up
  const keys = bulkKeyNames.value
    .split(/[\n,]/)
    .map(key => key.trim())
    .filter(key => key.length > 0)
    .filter((key, index, arr) => arr.indexOf(key) === index) // Remove duplicates
  
  return keys
})

// Navigation guard - redirect to upload if no files and no project
onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  if (!filesStore.files.length && !filesStore.currentProject) {
    router.push('/')
  }
  
  // Load preview images from current project if available
  if (filesStore.currentProject?.previewImages) {
    filesStore.setPreviewImages(filesStore.currentProject.previewImages)
  }
})

// Watch for viewMode changes
watch(viewMode, (newMode) => {
  if (jsonTable.value) {
    jsonTable.value.mode = newMode
  }
})

// Watch for highlightMode changes
watch(highlightMode, (newValue) => {
  if (jsonTable.value) {
    jsonTable.value.highlightMode = newValue
  }
})

// Watch for search query changes
watch(searchQuery, (newValue) => {
  if (jsonTable.value) {
    jsonTable.value.search = newValue
  }
})

// Watch for skipColumns changes
watch(skipColumns, (newValue) => {
  if (jsonTable.value) {
    jsonTable.value.skipColumns = newValue
  }
})

// Watch for dualKeysMode changes
watch(dualKeysMode, (newValue) => {
  filesStore.setUseDualKeys(newValue)
  // TODO: Re-process files when dual keys mode is toggled
})

// Watch for filesStore changes to update totalKeys
watch(
  () => filesStore.stringsData,
  (newData) => {
    if (newData && newData.length > 0) {
      const allKeys = new Set<string>()
      newData.forEach(obj => Object.keys(obj || {}).forEach(k => allKeys.add(k)))
      totalKeys.value = allKeys.size
      filteredCount.value = totalKeys.value
    } else {
      totalKeys.value = 0
      filteredCount.value = 0
    }
  },
  { immediate: true }
)

function updateTheme(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

function clearSearch() {
  searchQuery.value = ''
}

function goBack() {
  filesStore.reset()
  router.push('/')
}

function resetColumnWidths() {
  if (jsonTable.value) {
    jsonTable.value.resetColumnWidths()
  }
}

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function saveProjectToLocalStorage() {
  if (filesStore.saveProjectToLocalStorage()) {
    const imageCount = Object.keys(filesStore.previewImages).reduce((total, key) => 
      total + (filesStore.previewImages[key]?.length || 0), 0
    )
    alert(`Project saved to local storage successfully!\n${imageCount} preview images included.`)
  } else {
    alert('Failed to save project. Please try again.')
  }
}

function saveProjectToFile() {
  const imageCount = Object.keys(filesStore.previewImages).reduce((total, key) => 
    total + (filesStore.previewImages[key]?.length || 0), 0
  )
  filesStore.saveProjectToFile()
  // Show a brief notification that images are included
  if (imageCount > 0) {
    setTimeout(() => {
      alert(`Project downloaded with ${imageCount} preview images included!`)
    }, 100)
  }
}

// Add Key Modal
function showAddKeyModal() {
  newKeyName.value = ''
  newKeyDefaultValue.value = ''
  addKeyError.value = ''
  addKeyMode.value = 'single'
  bulkKeyNames.value = ''
  bulkDefaultValue.value = ''
  const modal = document.getElementById('add_key_modal') as HTMLDialogElement
  if (modal) {
    modal.showModal()
  }
}

function closeAddKeyModal() {
  const modal = document.getElementById('add_key_modal') as HTMLDialogElement
  if (modal) {
    modal.close()
  }
}

function addNewKey() {
  const keyName = newKeyName.value.trim()
  const defaultValue = newKeyDefaultValue.value.trim()
  
  if (!keyName) {
    addKeyError.value = 'Key Name is required.'
    return
  }
  
  // Ensure we have at least one language before adding keys
  if (filesStore.languages.length === 0) {
    filesStore.createDefaultLanguage()
  }
  
  // Check for duplicate keys using the new language structure
  const allKeys = filesStore.hasLanguageFiles 
    ? filesStore.allKeysFromLanguages 
    : filesStore.allKeys
    
  if (allKeys.includes(keyName)) {
    addKeyError.value = 'Key already exists. Please choose a different name.'
    return
  }
  
  // Add key to all languages
  if (filesStore.hasLanguageFiles) {
    filesStore.addKeyToAllLanguages(keyName, defaultValue)
  } else {
    // Fallback to legacy structure
    const success = filesStore.addKey(keyName, defaultValue)
    if (!success) {
      addKeyError.value = 'Failed to add key. Please try again.'
      return
    }
  }
  
  // Force reactivity update
  nextTick(() => {
    console.log('Added key:', keyName, 'All keys now:', filesStore.allKeysFromLanguages)
  })
  
  closeAddKeyModal()
}

function addBulkKeys() {
  const keys = parsedBulkKeys.value
  const defaultValue = bulkDefaultValue.value.trim()
  
  if (keys.length === 0) {
    addKeyError.value = 'Please enter at least one key name.'
    return
  }
  
  // Ensure we have at least one language before adding keys
  if (filesStore.languages.length === 0) {
    filesStore.createDefaultLanguage()
  }
  
  // Check for duplicate keys
  const allKeys = filesStore.hasLanguageFiles 
    ? filesStore.allKeysFromLanguages 
    : filesStore.allKeys
  
  const duplicates = keys.filter(key => allKeys.includes(key))
  if (duplicates.length > 0) {
    addKeyError.value = `The following keys already exist: ${duplicates.join(', ')}`
    return
  }
  
  // Add all keys
  let successCount = 0
  if (filesStore.hasLanguageFiles) {
    keys.forEach(key => {
      filesStore.addKeyToAllLanguages(key, defaultValue)
      successCount++
    })
  } else {
    // Fallback to legacy structure
    keys.forEach(key => {
      const success = filesStore.addKey(key, defaultValue)
      if (success) successCount++
    })
  }
  
  if (successCount === keys.length) {
    // Force reactivity update
    nextTick(() => {
      console.log('Added bulk keys:', keys, 'All keys now:', filesStore.allKeysFromLanguages)
    })
    closeAddKeyModal()
  } else {
    addKeyError.value = `Only ${successCount} out of ${keys.length} keys were added successfully.`
  }
}

// Version Diff Modal
function showVersionDiff(beforeVersionId: string, afterVersionId: string) {
  diffBeforeVersionId.value = beforeVersionId
  diffAfterVersionId.value = afterVersionId
  showVersionDiffModal.value = true
}

function closeVersionDiff() {
  showVersionDiffModal.value = false
  diffBeforeVersionId.value = ''
  diffAfterVersionId.value = ''
}
</script>
