<template>
  <th class="relative group" :style="{ width: columnWidth || '200px', minWidth: '150px' }">
    <div class="flex items-center gap-2 justify-between">
      <div class="flex items-center gap-2">
        <span class="font-medium">{{ language.code.toUpperCase() }}</span>
        <div v-if="language.hasFile" class="badge badge-success badge-xs">
          {{ language.fileType?.toUpperCase() }}
        </div>
      </div>
      
      <!-- Upload button -->
      <div class="flex items-center gap-1">
        <button 
          class="btn btn-xs btn-outline"
          @click="openSnippetModal"
          :title="`View code snippet for ${language.name}`"
        >
          📄
        </button>
        <button 
          class="btn btn-xs btn-outline"
          @click="exportColumn"
          :title="`Export ${language.name} column`"
        >
          💾
        </button>
        <button 
          class="btn btn-xs btn-outline"
          @click="openUploadModal"
          :title="`Upload file for ${language.name}`"
        >
          📁
        </button>>
        
        <!-- Column resizer -->
        <div class="resizer cursor-col-resize w-1 h-4 bg-base-300 hover:bg-primary" 
             @mousedown="startResizing"></div>
      </div>
    </div>
    
    <!-- Upload Modal -->
    <dialog :id="`upload_modal_${language.code}`" class="modal">
      <div class="modal-box max-w-lg">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <h3 class="font-bold text-xl mb-6 flex items-center gap-3">
          <div class="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            📁
          </div>
          Upload for {{ language.name }}
          <div class="badge badge-outline">{{ language.code.toUpperCase() }}</div>
        </h3>
        
        <div class="space-y-6">
          <!-- Current file info -->
          <div v-if="language.hasFile" class="alert alert-info">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div class="font-medium">Current: {{ language.fileType?.toUpperCase() }} file loaded</div>
                <div class="text-sm opacity-75">New upload will merge/replace existing keys</div>
              </div>
            </div>
          </div>
          
          <!-- Upload instructions -->
          <div v-else class="alert">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div class="font-medium">No file uploaded yet</div>
              <div class="text-sm opacity-75">Choose a file type below to get started</div>
            </div>
          </div>
          
          <!-- File type selection -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-medium">Choose file format</span>
            </label>
            <div class="space-y-4">
              <!-- iOS .strings file -->
              <label class="flex items-center gap-4 p-4 border-2 border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200 group">
                <div class="flex-shrink-0">
                  <div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span class="text-2xl">📱</span>
                  </div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-base">iOS Strings File</div>
                  <div class="text-sm text-base-content/70 mt-1">
                    <code class="bg-base-200 px-2 py-1 rounded text-xs">.strings</code> format
                  </div>
                  <div class="text-xs text-base-content/60 mt-1">
                    Example: "key" = "value";
                  </div>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <input 
                  type="file" 
                  accept=".strings"
                  class="hidden"
                  @change="onFileSelected($event)"
                />
              </label>
            </div>
          </div>
          
          <!-- Clear data option -->
          <div v-if="language.hasFile" class="divider">Manage Data</div>
          <div v-if="language.hasFile" class="form-control">
            <button class="btn btn-error btn-outline w-full gap-2" @click="clearLanguage">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all {{ language.name }} data
            </button>
          </div>
        </div>
        
        <div class="modal-action mt-8">
          <button class="btn btn-outline" @click="closeUploadModal">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeUploadModal">close</button>
      </form>
    </dialog>

    <!-- Export Format Selection Modal -->
    <dialog :id="`export_modal_${language.code}`" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Export {{ language.name }} Column</h3>
        <p class="text-sm text-base-content/70 mb-4">Export this column's data in iOS .strings format.</p>
        
        <!-- Platform Selection -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Export Format</span>
          </label>
          <div class="select select-bordered w-full flex items-center">
            iOS (.strings)
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn" @click="closeExportModal">Cancel</button>
          <button class="btn btn-primary" @click="confirmExport">Export</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeExportModal">close</button>
      </form>
    </dialog>

    <!-- Simple Snippet Modal -->
    <dialog :id="`snippet_modal_${language.code}`" class="modal">
      <div class="modal-box max-w-4xl">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        
        <h3 class="font-bold text-xl mb-4">
          Code Snippet for {{ language.name }}
        </h3>
        
        <div class="mockup-code">
          <pre><code>{{ generateSnippet() }}</code></pre>
        </div>
        
        <div class="modal-action">
          <button class="btn" onclick="this.closest('dialog').close()">Close</button>
          <button class="btn btn-primary" @click="copySnippet">Copy to Clipboard</button>
        </div>
      </div>
    </dialog>
  </th>
</template>

<script setup lang="ts">
import { useFilesStore } from '../stores/files'
import type { LanguageColumn } from '../stores/files'

interface Props {
  language: LanguageColumn
  columnWidth?: string
  allKeys?: string[]
}

interface Emits {
  (e: 'resize', data: { language: string, event: MouseEvent }): void
  (e: 'export', data: { language: string }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const filesStore = useFilesStore()

// Function to open the snippet modal
const openSnippetModal = () => {
  const modal = document.getElementById(`snippet_modal_${props.language.code}`) as HTMLDialogElement
  if (modal) {
    modal.showModal()
  }
}

// Function to generate snippet
const generateSnippet = () => {
  const entries = Object.entries(props.language.data || {})
  if (entries.length === 0) {
    return `// No strings available for ${props.language.name}\n`
  }
  
  return entries
    .map(([key, value]) => `"${key}" = "${value}";`)
    .join('\n')
}

// Function to copy snippet to clipboard
const copySnippet = async () => {
  try {
    await navigator.clipboard.writeText(generateSnippet())
    // Could add a toast notification here if needed
  } catch (error) {
    console.error('Failed to copy snippet:', error)
  }
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (file) {
    try {
      await filesStore.uploadFileToLanguage(props.language.code, file)
      
      // Show success message
      console.log(`Uploaded .strings file for ${props.language.name}`)
      
      // Clear input and close modal
      input.value = ''
      closeUploadModal()
    } catch (error) {
      console.error('Failed to upload file:', error)
      alert('Failed to parse file. Please check the format.')
    }
  }
}

function openUploadModal() {
  const modal = document.getElementById(`upload_modal_${props.language.code}`) as HTMLDialogElement
  modal.showModal()
}

function closeUploadModal() {
  const modal = document.getElementById(`upload_modal_${props.language.code}`) as HTMLDialogElement
  modal.close()
}

function clearLanguage() {
  if (confirm(`Clear all data for ${props.language.name}?`)) {
    filesStore.clearLanguageData(props.language.code)
    closeUploadModal()
  }
}

function startResizing(event: MouseEvent) {
  emit('resize', { language: props.language.code, event })
}

function exportColumn() {
  openExportModal()
}

function openExportModal() {
  const modal = document.getElementById(`export_modal_${props.language.code}`) as HTMLDialogElement
  modal.showModal()
}

function closeExportModal() {
  const modal = document.getElementById(`export_modal_${props.language.code}`) as HTMLDialogElement
  modal.close()
}

function confirmExport() {
  emit('export', { language: props.language.code })
  closeExportModal()
}
</script>

<style scoped>
.resizer {
  transition: background-color 0.2s;
}
</style>
