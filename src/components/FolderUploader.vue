<template>
  <div class="folder-uploader">
    <!-- Folder Upload Area -->
    <div class="upload-area mb-6">
      <div 
        class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
        :class="{
          'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragging,
          'border-red-500': hasError
        }"
        @click="selectFolder"
        @drop="onDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
      >
        <div class="space-y-4">
          <div class="text-6xl text-gray-400">📁</div>
          <div>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Select Folder with .strings Files
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mt-2">
              Drag and drop a folder here, or click to browse
            </p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Supports: en.strings, Localizable_th.strings, etc.
            </p>
          </div>
          <button 
            class="btn btn-primary"
            type="button"
          >
            Choose Folder
          </button>
        </div>
      </div>

      <!-- Hidden folder input -->
      <input
        ref="folderInput"
        type="file"
        webkitdirectory
        directory
        multiple
        accept=".strings"
        class="hidden"
        @change="onFolderSelected"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isProcessing" class="text-center py-8">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">Processing folder...</p>
    </div>

    <!-- Error State -->
    <div v-if="hasError && errorMessage" class="alert alert-error mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Preview Results -->
    <div v-if="importResult && !isProcessing" class="space-y-6">
      <!-- Summary -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Files Found</div>
          <div class="stat-value text-2xl">{{ importResult.files.length }}</div>
          <div class="stat-desc">{{ validFileCount }} valid .strings files</div>
        </div>
        <div class="stat">
          <div class="stat-title">Languages</div>
          <div class="stat-value text-2xl">{{ importResult.languages.length }}</div>
          <div class="stat-desc">Unique language codes</div>
        </div>
        <div class="stat">
          <div class="stat-title">Keys</div>
          <div class="stat-value text-2xl">{{ importResult.keyCount }}</div>
          <div class="stat-desc">Total localization keys</div>
        </div>
      </div>

      <!-- Warnings & Suggestions -->
      <div v-if="validation.warnings.length > 0 || validation.suggestions.length > 0" class="space-y-3">
        <div v-for="warning in validation.warnings" :key="warning" class="alert alert-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.876c1.417 0 2.36-1.485 1.952-2.723L13.833 4.603c-.322-.769-1.359-.769-1.681 0L6.095 18.277C5.687 19.515 6.63 21 8.047 21z" />
          </svg>
          <span>{{ warning }}</span>
        </div>

        <div v-for="suggestion in validation.suggestions" :key="suggestion" class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ suggestion }}</span>
        </div>
      </div>

      <!-- File List -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h3 class="card-title">Files to Import</h3>
          <div class="overflow-x-auto">
            <table class="table table-zebra w-full">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Language</th>
                  <th>Keys</th>
                  <th>Size</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in importResult.files" :key="file.name">
                  <td class="font-mono text-sm">{{ file.name }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="badge badge-outline">{{ file.languageCode }}</span>
                      <span class="text-sm">{{ file.languageName }}</span>
                    </div>
                  </td>
                  <td>
                    <span v-if="file.parseResult">{{ Object.keys(file.parseResult.data).length }}</span>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="text-sm">{{ formatFileSize(file.size) }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span v-if="file.isValidStrings" class="badge badge-success">Valid</span>
                      <span v-else class="badge badge-error">Invalid</span>
                      
                      <span 
                        v-if="file.parseResult && file.parseResult.duplicateCount > 0" 
                        class="badge badge-warning"
                        :title="`${file.parseResult.duplicateCount} duplicate keys`"
                      >
                        {{ file.parseResult.duplicateCount }} dupes
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Project Name Input -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Project Name</span>
        </label>
        <input
          v-model="projectName"
          type="text"
          placeholder="Enter project name..."
          class="input input-bordered w-full"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4 justify-end">
        <button 
          class="btn btn-ghost" 
          @click="reset"
        >
          Cancel
        </button>
        <button 
          class="btn btn-primary"
          :disabled="!validation.isValid || isImporting"
          @click="importProject"
        >
          <span v-if="isImporting" class="loading loading-spinner loading-sm"></span>
          {{ isImporting ? 'Importing...' : 'Import Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import { useNotifications } from '../composables/useNotifications'
import { 
  processFolderFiles, 
  validateFolderStructure, 
  generateProjectName,
  isStringsFile,
  type FolderImportResult 
} from '../utils/folderProcessor'

// Composables
const router = useRouter()
const filesStore = useFilesStore()
const { success, error, warning } = useNotifications()

// Refs
const folderInput = ref<HTMLInputElement>()
const isDragging = ref(false)
const isProcessing = ref(false)
const isImporting = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const importResult = ref<FolderImportResult | null>(null)
const projectName = ref('')

// Computed
const validFileCount = computed(() => 
  importResult.value?.files.filter(f => f.isValidStrings).length || 0
)

const validation = computed(() => {
  if (!importResult.value) {
    return { isValid: false, warnings: [], suggestions: [] }
  }
  return validateFolderStructure(importResult.value.files)
})

// Methods
const selectFolder = () => {
  folderInput.value?.click()
}

const onDrop = async (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const items = event.dataTransfer?.items
  if (!items) return

  const files: File[] = []
  
  // Handle dropped items
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry()
      if (entry?.isDirectory) {
        const folderFiles = await readDirectory(entry as FileSystemDirectoryEntry)
        files.push(...folderFiles)
      } else {
        const file = item.getAsFile()
        if (file && isStringsFile(file)) files.push(file)
      }
    }
  }

  if (files.length > 0) {
    await processFiles(files)
  }
}

const onFolderSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length > 0) {
    await processFiles(files)
  }
}

const processFiles = async (files: File[]) => {
  hasError.value = false
  errorMessage.value = ''
  isProcessing.value = true
  
  try {
    const result = await processFolderFiles(files)
    
    if (result.hasErrors && result.errors.length > 0) {
      errorMessage.value = result.errors.join('; ')
      hasError.value = true
    }
    
    if (result.files.length === 0) {
      errorMessage.value = 'No .strings files found in the selected folder'
      hasError.value = true
      return
    }
    
    importResult.value = result
    projectName.value = generateProjectName(result.files)
    
    // Show warnings if any
    if (result.totalDuplicates > 0) {
      warning(`Found ${result.totalDuplicates} duplicate keys across files`, 'Latest values will be used')
    }
    
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Failed to process folder'
    hasError.value = true
  } finally {
    isProcessing.value = false
  }
}

const importProject = async () => {
  if (!importResult.value || !validation.value.isValid) return
  
  isImporting.value = true
  
  try {
    // Create new project with the imported languages
    await filesStore.createNewProject(projectName.value)
    
    // Import all languages
    for (const language of importResult.value.languages) {
      await filesStore.addLanguageColumn(language.code, language.name)
      
      // Set the data for this language
      const columnIndex = filesStore.languages.findIndex((col: any) => col.code === language.code)
      if (columnIndex !== -1) {
        filesStore.languages[columnIndex].data = { ...language.data }
        filesStore.languages[columnIndex].hasFile = true
        filesStore.languages[columnIndex].fileType = 'strings'
        // Preserve structure data for comment preservation
        filesStore.languages[columnIndex].originalStructure = language.originalStructure
        filesStore.languages[columnIndex].originalContent = language.originalContent
      }
    }
    
    // Sync to legacy structure
    filesStore.syncLanguagesToFiles()
    
    success(`Successfully imported ${importResult.value.languages.length} languages`, 
           `Project "${projectName.value}" created with ${importResult.value.keyCount} keys`)
    
    // Navigate to editor
    router.push('/editor')
    
  } catch (err) {
    error('Import failed', err instanceof Error ? err.message : 'Unknown error occurred')
  } finally {
    isImporting.value = false
  }
}

const reset = () => {
  importResult.value = null
  projectName.value = ''
  hasError.value = false
  errorMessage.value = ''
  isDragging.value = false
  
  if (folderInput.value) {
    folderInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Helper function to read directory entries recursively
const readDirectory = (directoryEntry: FileSystemDirectoryEntry): Promise<File[]> => {
  return new Promise((resolve) => {
    const files: File[] = []
    const reader = directoryEntry.createReader()
    
    const readEntries = () => {
      reader.readEntries(async (entries) => {
        if (entries.length === 0) {
          resolve(files)
          return
        }
        
        for (const entry of entries) {
          if (entry.isFile && entry.name.toLowerCase().endsWith('.strings')) {
            const file = await getFileFromEntry(entry as FileSystemFileEntry)
            if (file) files.push(file)
          } else if (entry.isDirectory) {
            const subFiles = await readDirectory(entry as FileSystemDirectoryEntry)
            files.push(...subFiles)
          }
        }
        
        readEntries() // Continue reading
      })
    }
    
    readEntries()
  })
}

const getFileFromEntry = (fileEntry: FileSystemFileEntry): Promise<File | null> => {
  return new Promise((resolve) => {
    fileEntry.file(resolve, () => resolve(null))
  })
}

// Cleanup on unmount
onMounted(() => {
  reset()
})
</script>

<style scoped>
.folder-uploader {
  max-width: 800px;
  margin: 0 auto;
}

.upload-area {
  transition: all 0.3s ease;
}
</style>