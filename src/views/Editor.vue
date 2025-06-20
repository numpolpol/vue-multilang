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
        :searchQuery="searchQuery"
        :filteredCount="filteredCount"
        :totalKeys="totalKeys"
        :languageCount="filesStore.files.length"
        @toggleDrawer="toggleDrawer"
        @update:viewMode="viewMode = $event"
        @update:highlightMode="highlightMode = $event"
      />

      <div class="flex-1 overflow-hidden p-0 m-0 w-full">
        <JsonTable 
          :data="filesStore.stringsData" 
          :files="filesStore.files" 
          @back="goBack" 
          @removeLanguageColumn="removeLanguageColumn"
          ref="jsonTable" 
        />
      </div>
    </div>
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

// Computed properties for search results
const filteredCount = ref(0)
const totalKeys = ref(0)
const noResults = ref(false)

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
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    try {
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
    } catch (error) {
      console.error('Failed to parse file:', error)
      alert('Failed to parse file. Please check the format.')
    }
  }
  input.click()
}

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
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
</script>
