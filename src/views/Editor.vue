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
      @addLanguageColumn="addLanguageColumn"
      @removeLanguageColumn="showRemoveLanguageDialog"
      @saveProjectToLocalStorage="saveProjectToLocalStorage"
      @saveProjectToFile="saveProjectToFile"
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
        @addKey="showAddKeyModal"
      />

      <div class="flex-1 overflow-hidden p-0 m-0 w-full">
        <JsonTable 
          :data="filesStore.stringsData" 
          :files="filesStore.files" 
          :skipColumns="skipColumns"
          :dualKeysMode="dualKeysMode"
          @back="goBack" 
          @removeLanguageColumn="removeLanguageColumn"
          @addKey="showAddKeyModal"
          ref="jsonTable" 
        />
      </div>
    </div>
    
    <!-- Add Key Modal -->
    <dialog id="add_key_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Add New Key</h3>
        <div class="space-y-4">
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
          
          <div v-if="addKeyError" class="alert alert-error">
            <span>{{ addKeyError }}</span>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="closeAddKeyModal">Cancel</button>
          <button class="btn btn-primary" @click="addNewKey" :disabled="!newKeyName.trim()">Add Key</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeAddKeyModal">close</button>
      </form>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'
import JsonTable from '../components/JsonTable.vue'
import EditorSidebar from '../components/EditorSidebar.vue'
import EditorNavbar from '../components/EditorNavbar.vue'

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

// Computed properties for search results
const filteredCount = ref(0)
const totalKeys = ref(0)
const noResults = ref(false)

// Add Key Modal
const newKeyName = ref('')
const newKeyDefaultValue = ref('')
const addKeyError = ref('')

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

function addLanguageColumn() {
  // Show file input dialog
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.strings,.xml'
  input.multiple = true // Allow multiple file selection
  input.onchange = async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || [])
    if (!files.length) return
    
    try {
      if (dualKeysMode.value) {
        // Process files with dual key support
        await processDualKeyFiles(files)
      } else {
        // Process files individually (existing behavior)
        for (const file of files) {
          await processSingleFile(file)
        }
      }
    } catch (error) {
      console.error('Failed to process files:', error)
      alert('Failed to parse one or more files. Please check the format.')
    }
  }
  input.click()
}

async function processDualKeyFiles(files: File[]) {
  const { groupFilesByLanguage, processFileGroups } = await import('../utils/strings')
  
  // Group files by language
  const groups = groupFilesByLanguage(files)
  
  // Process file groups with key merging enabled
  const { files: processedFiles, data: processedData, mergedKeys } = await processFileGroups(groups, true)
  
  // Update store with processed data
  const newFiles = [...filesStore.files, ...processedFiles]
  const newData = [...filesStore.stringsData, ...processedData]
  
  filesStore.setFiles(newFiles)
  filesStore.setStringsData(newData)
  filesStore.setFileGroups(groups)
  
  // Store merged keys information for UI display
  if (mergedKeys && mergedKeys.length > 0) {
    console.log('Merged keys:', mergedKeys)
    // You could add this to the store if you want to show merged keys info in the UI
  }
  
  // Update project if exists
  if (filesStore.currentProject) {
    filesStore.updateCurrentProject()
  }
  
  const mergeMessage = mergedKeys && mergedKeys.length > 0 
    ? ` ${mergedKeys.length} keys were merged based on matching values.`
    : ''
  
  alert(`Processed ${groups.length} language groups. ${groups.filter(g => g.hasBothFiles).length} have both .strings and .xml files.${mergeMessage}`)
}

async function processSingleFile(file: File) {
  const { readFileContent } = await import('../utils/strings')
  const content = await readFileContent(file)
  const data = parseStrings(content)
  
  // Add to existing files
  const newFiles = [...filesStore.files, file]
  const newData = [...filesStore.stringsData, data]
  
  filesStore.setFiles(newFiles)
  filesStore.setStringsData(newData)
  
  // Update project if exists
  if (filesStore.currentProject) {
    filesStore.updateCurrentProject()
  }
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

function removeLanguageColumn(index: number) {
  if (filesStore.files.length <= 1) {
    alert('Cannot remove the last language column!')
    return
  }
  
  const fileName = filesStore.files[index]?.name || 'this language'
  
  if (confirm(`Are you sure you want to remove "${fileName}" column? This action cannot be undone.`)) {
    // Create new arrays without the removed index
    const newFiles = filesStore.files.filter((_, i) => i !== index)
    const newData = filesStore.stringsData.filter((_, i) => i !== index)
    
    // Update store
    filesStore.setFiles(newFiles)
    filesStore.setStringsData(newData)
    
    // Update project if exists
    if (filesStore.currentProject) {
      filesStore.updateCurrentProject()
    }
    
    alert(`"${fileName}" column has been removed successfully!`)
  }
}

function showRemoveLanguageDialog() {
  if (filesStore.files.length <= 1) {
    alert('Cannot remove the last language column!')
    return
  }
  
  // Show selection dialog for which language to remove
  const options = filesStore.files.map((file, index) => 
    `${index + 1}. ${file.name.replace(/\.(strings|xml)$/, '')}`
  ).join('\n')
  
  const selection = prompt(
    `Which language would you like to remove?\n\nEnter the number (1-${filesStore.files.length}):\n\n${options}`
  )
  
  if (selection) {
    const index = parseInt(selection.trim()) - 1
    if (index >= 0 && index < filesStore.files.length) {
      removeLanguageColumn(index)
    } else {
      alert('Invalid selection! Please enter a valid number.')
    }
  }
}

// Add Key Modal
function showAddKeyModal() {
  newKeyName.value = ''
  newKeyDefaultValue.value = ''
  addKeyError.value = ''
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
  
  closeAddKeyModal()
}
</script>
