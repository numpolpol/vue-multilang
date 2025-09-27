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
      :languages="filesStore.files.map(file => file.name.replace(/\.(strings)$/, ''))"
      @updateTheme="updateTheme"
      @update:searchQuery="searchQuery = $event"
      @clearSearch="clearSearch"
      @goBack="goBack"
      @saveProjectToFile="saveProjectToFile"
      @languageAdded="onLanguageAdded"
      @languageRemoved="onLanguageRemoved"
      @languagesReordered="onLanguagesReordered"
    />
    
    <!-- Page content -->
    <div class="drawer-content flex flex-col h-screen p-0 m-0 w-full max-w-none">
      <!-- Navbar -->
      <EditorNavbar 
        :saved-count="filesStore.languages.length"
        :total-keys="totalKeys"
        :filtered-count="filteredCount"
        :search-query="searchQuery"
        :project-name="filesStore.currentProject?.name"
        :language-count="filesStore.languages.length"
        :view-mode="viewMode"
        :skip-columns="skipColumns"
        @toggle-drawer="toggleDrawer"
        @update:view-mode="viewMode = $event"
        @update:skip-columns="skipColumns = $event"
        @save-project="saveProjectToFile"
        @export-all-columns="exportAllColumns"
      />

      <div class="flex-1 overflow-hidden p-0 m-0 w-full">
        <JsonTable 
          :data="filesStore.stringsData" 
          :files="filesStore.files" 
          :skip-columns="skipColumns"
          @back="goBack" 
          @add-key="showAddKeyModal"
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import JsonTable from '../components/JsonTable.vue'
import EditorSidebar from '../components/EditorSidebar.vue'
import EditorNavbar from '../components/EditorNavbar.vue'

interface JsonTableWithControls {
  mode: 'all' | 'paging'
  search: string
  skipColumns: number
  openExportModal: (mode: 'all' | 'changed' | 'original') => void
  exportAllColumns: () => void
}

const router = useRouter()
const filesStore = useFilesStore()
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)
const jsonTable = ref<JsonTableWithControls | null>(null)

// View controls
const viewMode = ref<'all' | 'paging'>('all')
const searchQuery = ref('')
const skipColumns = ref(0)

// Computed properties for search results
const filteredCount = ref(0)
const totalKeys = ref(0)
const noResults = ref(false)

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
})

// Watch for viewMode changes
watch(viewMode, (newMode) => {
  if (jsonTable.value) {
    jsonTable.value.mode = newMode
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

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}

function saveProjectToFile() {
  if (!filesStore.currentProject) {
    alert('No project to save. Please create a project or load languages first.')
    return
  }

  // Check if there's any data to save
  const hasData = filesStore.languages.some(lang => lang.hasFile && Object.keys(lang.data).length > 0)
  if (!hasData) {
    alert('No language data to save. Please import some files first.')
    return
  }

  filesStore.saveProjectToFile()
  alert('Project file downloaded successfully!')
}

// Language column management
function onLanguageAdded(languageCode: string) {
  console.log('Language added:', languageCode)
  // The store already handles the addition, no additional action needed
}

function onLanguageRemoved(languageCode: string) {
  console.log('Language removed:', languageCode)
  // The store already handles the removal, no additional action needed
}

function onLanguagesReordered(fromIndex: number, toIndex: number) {
  console.log('Languages reordered:', fromIndex, '->', toIndex)
  // The store already handles the reordering, no additional action needed
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

// Export all columns functionality
function exportAllColumns() {
  if (jsonTable.value && jsonTable.value.exportAllColumns) {
    jsonTable.value.exportAllColumns()
  } else {
    console.error('JsonTable reference not available or exportAllColumns method not found')
  }
}
</script>
