<template>
  <div class="h-screen flex flex-col w-full max-w-none json-table-container px-4">
    <!-- Search & Controls -->
    <div class="bg-base-200 flex-shrink-0 w-full px-4">
      <!-- Mode Indicator -->
      <div class="py-1 text-xs text-base-content/70">
        Mode: {{ mode === 'all' ? 'All Keys View' : 'Page Sections View' }}
        | {{ filteredKeys.length }} rows
        <span v-if="search.trim()">
          (filtered from {{ visibleKeys.length }})
        </span>
        <span v-if="mode === 'paging' && selectedPage">
          | Current: {{ selectedPage }}
        </span>
        <span v-if="mode === 'paging'">
          | {{ pagePrefixes.length }} sections available
        </span>
        <span v-if="highlightMode">
          | Highlight: ON
        </span>
        <span v-if="props.dualKeysMode">
          | Multi Key Mode: ON
        </span>
      </div>
      
      <!-- Search -->
      <div class="form-control py-2 w-full">
        <div class="input-group">
          <div class="flex items-center gap-2 w-full">
            <button class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input v-model="search" type="text" placeholder="Search keys or values..." class="input input-bordered w-full" />
            <button class="btn btn-primary btn-sm" @click="$emit('addKey')" title="Add New Key">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Key
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mode === 'paging'" class="tabs-paging flex-shrink-0 px-4 pb-2">
      <div class="tabs w-full">
        <button 
          v-for="prefix in pagePrefixes" 
          :key="prefix" 
          :class="['tab', { 'tab-active': selectedPage === prefix }]" 
          @click="selectedPage = prefix"
          :title="`Switch to ${prefix} section`"
        >
          {{ prefix }}
        </button>
      </div>
    </div>
    <!-- Table wrapper with horizontal scroll -->
    <div class="flex-1 overflow-auto w-full px-4" :class="mode === 'paging' ? 'flex gap-4' : ''">
      <!-- Preview Images Panel (only in paging mode) - Moved to left side -->
      <div v-if="mode === 'paging'" :class="[
        'flex-shrink-0 bg-base-100 border border-base-300 rounded-lg p-4 mr-auto flex flex-col h-full transition-all duration-300',
        isPreviewPanelMinimized ? 'w-12' : 'w-80'
      ]">
        <div class="space-y-4 flex flex-col h-full">
          <!-- Header with minimize button -->
          <div class="flex items-center justify-between">
            <h3 v-if="!isPreviewPanelMinimized" class="font-semibold text-lg">Preview Images</h3>
            <button 
              @click="isPreviewPanelMinimized = !isPreviewPanelMinimized"
              class="btn btn-xs btn-ghost"
              :title="isPreviewPanelMinimized ? 'Expand Preview Panel' : 'Minimize Preview Panel'"
            >
              <svg v-if="isPreviewPanelMinimized" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <!-- Content (hidden when minimized) -->
          <div v-if="!isPreviewPanelMinimized" class="space-y-4 flex flex-col h-full">
            <div class="text-xs text-base-content/70">
              {{ Object.keys(previewImages).length }} sections with images
            </div>
          
          <!-- Image Upload Area -->
          <div class="space-y-2 flex-shrink-0">
            <label class="label">
              <span class="label-text">Add Images for {{ selectedPage }} section</span>
            </label>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              class="file-input file-input-bordered file-input-sm w-full" 
              @change="onPreviewImagesSelected"
            />
            <label class="label">
              <span class="label-text-alt">Upload preview images to visualize this section</span>
            </label>
          </div>
          
          <!-- Uploaded Images Display -->
          <div v-if="previewImages[selectedPage]?.length" class="space-y-3 flex-1 flex flex-col">
            <div class="divider">Uploaded Images</div>
            <div class="space-y-3 flex-1 overflow-y-auto">
              <div 
                v-for="(image, index) in previewImages[selectedPage]" 
                :key="index"
                class="relative group"
              >
                <img 
                  :src="image.url" 
                  :alt="image.name"
                  class="object-contain border border-base-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full"
                  style="height: 200px;"
                  @click="openFullscreenImage(image, index, selectedPage)"
                />
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    class="btn btn-sm btn-error btn-circle"
                    @click="removePreviewImage(selectedPage, index)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div class="mt-1 text-xs text-base-content/70 truncate">
                  {{ image.name }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- No Images State -->
          <div v-else class="text-center py-8 text-base-content/50 flex-1 flex flex-col justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm">No preview images</p>
            <p class="text-xs">Upload images to visualize this section</p>
          </div>
          </div>
        </div>
      </div>
      
      <!-- Table container -->
      <div :class="mode === 'paging' ? 'flex-1' : 'w-full'">
        <table class="table w-full h-full">
          <thead>
            <tr>
              <!-- Fixed key column -->
              <th class="sticky left-0 z-10 bg-base-100" :style="{ width: columnWidths['key'] || '200px', minWidth: '150px' }">
                <div class="flex items-center gap-2">
                  <span>Key</span>
                    <!-- Multi key mode indicator -->
                    <div v-if="props.dualKeysMode" 
                       class="badge badge-accent badge-xs">
                    🔗
                    </div>
                  <div class="resizer" @mousedown="startResizing($event, 'key')"></div>
                </div>
              </th>
              <!-- Fixed paste column -->
              <th class="sticky" :style="{ left: `${keyColumnWidth}px`, width: '80px', minWidth: '80px' }">
                <div class="flex items-center gap-2">
                  <span>Paste</span>
                </div>
              </th>
              <!-- Language columns using LanguageColumnHeader -->
              <LanguageColumnHeader
                v-for="language in orderedLanguages" 
                :key="language.code"
                :language="language"
                :column-width="columnWidths[language.code] || '200px'"
                @resize="onLanguageColumnResize"
                @export="onLanguageColumnExport"
              />
              <!-- Delete column -->
              <th class="w-16 min-w-16">
                <div class="flex items-center justify-center">
                  <span class="text-xs">Delete</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="animate-pulse">
              <td colspan="100%" class="text-center py-8">
                <div class="loading loading-spinner"></div>
                <div class="mt-2">Loading...</div>
              </td>
            </tr>
            <tr v-else-if="filteredKeys.length === 0" class="hover:bg-transparent">
              <td colspan="100%" class="text-center py-8 text-base-content/50">
                No matching keys found
              </td>
            </tr>
            <template v-else v-for="key in filteredKeys" :key="key">
              <tr :class="rowClass(key)">
                <td class="sticky left-0 z-10 bg-base-100" :style="{ width: columnWidths['key'] || '200px' }">
                  <div v-if="isMergedKey(key)" class="space-y-1">
                    <div class="text-sm font-medium">
                      {{ getMergedKeyPrimary(key) }}
                    </div>
                    <div v-if="getMergedKeySecondary(key)" class="text-xs text-secondary">
                      ({{ getMergedKeySecondary(key) }})
                    </div>
                    <div class="badge badge-accent badge-xs">multi-key</div>
                  </div>
                  <div v-else>{{ key }}</div>
                </td>
                <td class="sticky z-10 bg-base-100" :style="{ left: `${keyColumnWidth}px`, width: '80px' }">
                  <button class="btn btn-xs btn-outline" @click="onPaste(key)">Paste</button>
                </td>
                <td v-for="language in orderedLanguages" :key="language.code">
                  <input 
                    :value="getDisplayValue(language, key)" 
                    @input="setLanguageDataValue(language.code, key, ($event.target as HTMLInputElement).value)"
                    class="input input-bordered w-full" 
                    :placeholder="`Enter ${language.name} text...`"
                  />
                </td>
                <!-- Delete button -->
                <td class="w-16 min-w-16">
                  <button 
                    class="btn btn-xs btn-error btn-circle"
                    @click="onDeleteKey(key)"
                    title="Delete this key"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Export Modal -->
    <dialog id="export_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Export Settings</h3>
        <!-- Platform Selection -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Platform Format</span>
          </label>
          <select v-model="exportPlatform" class="select select-bordered w-full">
            <option value="ios">iOS (.strings)</option>
            <option value="android">Android (strings.xml)</option>
          </select>
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeExportModal">Cancel</button>
          <button class="btn btn-primary" @click="downloadFiles">Export</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <!-- Fullscreen Image Modal with Key Annotations -->
    <dialog id="fullscreen_image_modal" class="modal">
      <div class="modal-box w-11/12 max-w-7xl h-5/6 p-0">
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="font-bold text-lg">{{ selectedFullscreenImage?.name || 'Image Preview' }} - Key Annotations</h3>
          <button class="btn btn-sm btn-circle btn-ghost" @click="closeFullscreenModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex h-full">
          <!-- Image Area -->
          <div class="flex-1 p-4 flex items-center justify-center">
            <div 
              ref="imageContainerRef"
              class="relative max-w-full max-h-full"
              style="min-height: 400px; min-width: 400px;"
            >
              <img 
                v-if="selectedFullscreenImage"
                :src="selectedFullscreenImage.url" 
                :alt="selectedFullscreenImage.name"
                class="max-w-full max-h-full object-contain border border-base-300 rounded-lg"
                style="max-height: 70vh;"
              />
              
              <!-- Key Number Indicators on Image -->
              <div 
                v-for="annotation in keyAnnotations"
                :key="annotation.keyName"
                class="absolute w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform"
                :style="{ 
                  left: annotation.x + '%', 
                  top: annotation.y + '%',
                  transform: 'translate(-50%, -50%)'
                }"
                @click="removeKeyAnnotation(annotation.keyName)"
                :title="`${annotation.keyName} - Click to remove`"
              >
                {{ annotation.number }}
              </div>
              
              <!-- Drop Zone Overlay (only visible during drag) -->
              <div 
                v-if="isDragging"
                class="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center"
              >
                <div class="text-primary font-bold">Drop key annotation here</div>
              </div>
            </div>
          </div>
          
          <!-- Key List Panel -->
          <div class="w-80 border-l bg-base-100 flex flex-col">
            <div class="p-4 border-b">
              <h4 class="font-semibold mb-2">Keys for {{ selectedImagePrefix }}</h4>
              <div class="text-sm text-base-content/70">
                {{ keyAnnotations.length }} of {{ currentPageKeys.length }} keys annotated
              </div>
            </div>
            
            <div class="flex-1 overflow-y-auto p-4 space-y-2">
              <div 
                v-for="(key, index) in currentPageKeys"
                :key="key"
                class="flex items-center justify-between p-3 border rounded-lg hover:bg-base-200 cursor-grab"
                :class="{
                  'bg-success/20 border-success': keyAnnotations.some(ann => ann.keyName === key),
                  'bg-base-100': !keyAnnotations.some(ann => ann.keyName === key)
                }"
                @mousedown="startDragKey(index, $event)"
              >
                <div class="flex-1 min-w-0">
                  <div class="font-medium text-sm truncate">{{ key }}</div>
                  <div class="text-xs text-base-content/70 truncate">
                    {{ filesStore.languages.find(lang => lang.data[key])?.data[key] || 'No value' }}
                  </div>
                </div>
                
                <div class="flex items-center gap-2 ml-2">
                  <!-- Show number if annotated -->
                  <div 
                    v-if="keyAnnotations.some(ann => ann.keyName === key)"
                    class="w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {{ keyAnnotations.find(ann => ann.keyName === key)?.number }}
                  </div>
                  
                  <!-- Drag indicator -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
              </div>
              
              <div v-if="currentPageKeys.length === 0" class="text-center py-8 text-base-content/50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3c0-.265.105-.52.293-.707L11.586 8.293a1 1 0 011.414 0L15 10.293A6 6 0 0117 9z" />
                </svg>
                <p>No keys found for this section</p>
              </div>
            </div>
            
            <!-- Instructions -->
            <div class="p-4 border-t bg-base-200">
              <h5 class="font-medium text-sm mb-2">How to use:</h5>
              <ul class="text-xs space-y-1 text-base-content/70">
                <li>• Drag key names from this panel onto the image</li>
                <li>• Numbered indicators will appear on the image</li>
                <li>• Click indicators to remove them</li>
                <li>• Positions are saved automatically when closed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeFullscreenModal">close</button>
      </form>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch, onBeforeUnmount } from 'vue'
import { useFilesStore } from '../stores/files'
import type { PreviewImage, KeyAnnotation } from '../stores/files'
import LanguageColumnHeader from './LanguageColumnHeader.vue'

const emit = defineEmits<{
  (e: 'update:mode', value: 'all' | 'paging'): void
  (e: 'update:search', value: string): void
  (e: 'update:highlightMode', value: boolean): void
  (e: 'change', payload: { key: string, fileName: string }): void
  (e: 'back'): void
  (e: 'export', files: Record<string, Record<string, string>>): void
  (e: 'removeLanguageColumn', index: number): void
  (e: 'addKey'): void
}>()

const props = defineProps<{
  data: Record<string, string>[]
  files: File[]
  skipColumns?: number
  dualKeysMode?: boolean
}>()

const mode = ref<'all' | 'paging'>('all')
const selectedPage = ref('')
const highlightMode = ref(false)
const search = ref('')
const skipColumns = ref(props.skipColumns || 0)

const loading = ref(false)
const isPreviewPanelMinimized = ref(false)

// Fullscreen image annotation mode
const selectedFullscreenImage = ref<PreviewImage | null>(null)
const selectedImageIndex = ref<number>(-1)
const selectedImagePrefix = ref<string>('')
const keyAnnotations = ref<KeyAnnotation[]>([])
const isDragging = ref(false)
const draggedKeyIndex = ref<number>(-1)
const imageContainerRef = ref<HTMLElement | null>(null)

// Get store instance
const filesStore = useFilesStore()

// Helper function to extract page prefix from key (allows dashes in prefix)
function getPagePrefix(key: string): string {
  // Find the first underscore and take everything before it as the prefix
  const underscoreIndex = key.indexOf('_')
  if (underscoreIndex === -1) return key // If no underscore, the whole key is the prefix
  return key.substring(0, underscoreIndex)
}

// Use preview images from store
const previewImages = computed(() => filesStore.previewImages)

function onPreviewImagesSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !selectedPage.value) return
  
  const files = Array.from(input.files)
  const prefix = selectedPage.value
  
  const newImages: PreviewImage[] = []
  
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        const previewImage: PreviewImage = {
          name: file.name,
          url: dataUrl,
          data: dataUrl
        }
        newImages.push(previewImage)
        
        if (newImages.length === files.filter(f => f.type.startsWith('image/')).length) {
          // All files processed, add to store
          filesStore.addPreviewImages(prefix, newImages)
        }
      }
      reader.readAsDataURL(file)
    }
  })
  
  // Clear the input
  input.value = ''
}

function removePreviewImage(prefix: string, index: number) {
  filesStore.removePreviewImage(prefix, index)
}

// Fullscreen image functionality
function openFullscreenImage(image: PreviewImage, imageIndex: number, prefix: string) {
  selectedFullscreenImage.value = image
  selectedImageIndex.value = imageIndex
  selectedImagePrefix.value = prefix
  
  // Initialize key annotations from the image or create empty array
  keyAnnotations.value = image.keyAnnotations ? [...image.keyAnnotations] : []
  
  const modal = document.getElementById('fullscreen_image_modal') as HTMLDialogElement
  modal.showModal()
}

function closeFullscreenModal() {
  // Save key annotations before closing
  if (selectedImagePrefix.value && selectedImageIndex.value >= 0) {
    filesStore.saveImageKeyAnnotations(
      selectedImagePrefix.value, 
      selectedImageIndex.value, 
      keyAnnotations.value
    )
  }
  
  // Reset state
  selectedFullscreenImage.value = null
  selectedImageIndex.value = -1
  selectedImagePrefix.value = ''
  keyAnnotations.value = []
  isDragging.value = false
  draggedKeyIndex.value = -1
  
  const modal = document.getElementById('fullscreen_image_modal') as HTMLDialogElement
  modal.close()
}

// Get current page keys for annotation
const currentPageKeys = computed(() => {
  if (!selectedImagePrefix.value) return []
  return visibleKeys.value.filter(key => getPagePrefix(key) === selectedImagePrefix.value)
})

// Drag and drop functionality for key annotations
function startDragKey(keyIndex: number, event: MouseEvent) {
  isDragging.value = true
  draggedKeyIndex.value = keyIndex
  
  // Prevent default drag behavior
  event.preventDefault()
  
  // Add global mouse move and mouse up listeners
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove(_event: MouseEvent) {
  if (!isDragging.value || !imageContainerRef.value) return
  
  // Update cursor to show dragging state
  document.body.style.cursor = 'grabbing'
}

function onDragEnd(event: MouseEvent) {
  if (!isDragging.value || !imageContainerRef.value || draggedKeyIndex.value < 0) {
    cleanupDrag()
    return
  }
  
  const rect = imageContainerRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  
  // Only add if within bounds
  if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
    const keyName = currentPageKeys.value[draggedKeyIndex.value]
    const existingIndex = keyAnnotations.value.findIndex(ann => ann.keyName === keyName)
    
    const annotation: KeyAnnotation = {
      keyName,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
      number: existingIndex >= 0 ? keyAnnotations.value[existingIndex].number : keyAnnotations.value.length + 1
    }
    
    if (existingIndex >= 0) {
      // Update existing annotation
      keyAnnotations.value[existingIndex] = annotation
    } else {
      // Add new annotation
      keyAnnotations.value.push(annotation)
    }
  }
  
  cleanupDrag()
}

function cleanupDrag() {
  isDragging.value = false
  draggedKeyIndex.value = -1
  document.body.style.cursor = ''
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

function removeKeyAnnotation(keyName: string) {
  const index = keyAnnotations.value.findIndex(ann => ann.keyName === keyName)
  if (index >= 0) {
    keyAnnotations.value.splice(index, 1)
    // Renumber remaining annotations
    keyAnnotations.value.forEach((ann, idx) => {
      ann.number = idx + 1
    })
  }
}

const allKeys = computed(() => {
  // Use language data from store instead of props.data
  if (filesStore.hasLanguageFiles) {
    if (props.dualKeysMode) {
      // Use merged keys when dual key mode is enabled
      return filesStore.allKeysFromLanguages
    } else {
      // Normal mode - get all unique keys
      return filesStore.allKeysFromLanguages
    }
  }
  
  // Fallback to legacy structure
  if (!props.data || props.data.length === 0) return []
  const keySet = new Set<string>()
  props.data.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => keySet.add(k))
    }
  })
  return Array.from(keySet)
})

const pagePrefixes = computed(() => {
  const prefixes = new Set<string>()
  allKeys.value.forEach(key => {
    const prefix = getPagePrefix(key)
    if (prefix) prefixes.add(prefix)
  })
  return Array.from(prefixes)
})

const visibleKeys = computed(() => {
  if (mode.value === 'all') return allKeys.value
  if (!selectedPage.value) return []
  return allKeys.value.filter(key => getPagePrefix(key) === selectedPage.value)
})

const filteredKeys = computed(() => {
  if (!search.value.trim()) return visibleKeys.value
  const q = search.value.trim().toLowerCase()
  return visibleKeys.value.filter(key => {
    if (key.toLowerCase().includes(q)) return true
    if (props.data && props.data.length > 0) {
      for (const obj of props.data) {
        if (obj && (obj[key] ?? '').toLowerCase().includes(q)) return true
      }
    }
    return false
  })
})

// Track original values for highlight
const originalData = ref(props.data ? props.data.map(obj => ({ ...obj })) : [])
watch(() => props.data, (newVal) => {
  if (newVal && originalData.value.length !== newVal.length) {
    originalData.value = newVal.map(obj => ({ ...obj }))
  }
}, { deep: true })

// Watch for skipColumns prop changes
watch(() => props.skipColumns, (newVal) => {
  skipColumns.value = newVal || 0
}, { immediate: true })

// Initialize selected page when mode changes to paging
watch([mode, pagePrefixes], () => {
  if (mode.value === 'paging' && !selectedPage.value && pagePrefixes.value.length > 0) {
    selectedPage.value = pagePrefixes.value[0]
  }
})

// Cleanup is handled by the store now
onBeforeUnmount(() => {
  // No cleanup needed since we're using data URLs stored in the store
})

function isAllEqual(key: string): boolean {
  if (!props.data || props.data.length === 0) return false
  const values = props.data.map(obj => obj?.[key] ?? '')
  return values.length > 0 && values.every(v => v === values[0])
}

function isEdited(key: string): boolean {
  if (!props.data || props.data.length === 0) return false
  for (let i = 0; i < props.data.length; i++) {
    if ((props.data[i]?.[key] ?? '') !== (originalData.value[i]?.[key] ?? '')) {
      return true
    }
  }
  return false
}

function isDuplicateValue(key: string): boolean {
  if (!props.data || props.data.length === 0) return false
  const valueCount: Record<string, number> = {};
  for (const obj of props.data) {
    if (!obj) continue
    const val = (obj[key] ?? '').trim();
    if (!val) continue;
    valueCount[val] = (valueCount[val] || 0) + 1;
    if (valueCount[val] > 1) return true;
  }
  return false;
}

function rowClass(key: string) {
  if (!highlightMode.value) return ''
  if (isEdited(key)) return 'row-edited'
  if (isDuplicateValue(key)) return 'row-duplicate'
  if (isAllEqual(key)) return 'row-all-equal'
  return ''
}

if (mode.value === 'paging' && !selectedPage.value && pagePrefixes.value.length > 0) {
  selectedPage.value = pagePrefixes.value[0]
}

/**
 * Paste functionality with configurable column skipping
 * When pasting tabular data (e.g., from Google Sheets), users can configure
 * how many leading columns to skip. This is useful when the source data
 * has extra columns that shouldn't be included in the translation.
 * 
 * Example: If source has "Name | Category | English | Thai | Khmer"
 * and you want only "English | Thai | Khmer", set skipColumns to 2
 */
async function onPaste(key: string) {
  try {
    const text = await navigator.clipboard.readText();
    let values = text.split('\t');
    if (values.length < orderedLanguages.value.length) {
      values = text.split(/\r?\n/);
    }
    
    // Skip the specified number of columns
    const skipCount = skipColumns.value || 0;
    if (skipCount > 0 && values.length > skipCount) {
      values = values.slice(skipCount);
    }
    
    // Update language data
    for (let i = 0; i < orderedLanguages.value.length; i++) {
      if (values[i] !== undefined) {
        const language = orderedLanguages.value[i]
        const value = values[i].trim()
        
        // ถ้าเป็น merged key ต้องอัพเดททุก key ที่ถูกรวมไว้
        if (isMergedKey(key)) {
          const allMergedKeys = getAllKeysFromMergedKey(key)
          allMergedKeys.forEach((individualKey: string) => {
            filesStore.updateKeyValue(language.code, individualKey, value)
          })
        } else {
          filesStore.updateKeyValue(language.code, key, value)
        }
      }
    }
  } catch (e) {
    alert('Unable to read clipboard.');
  }
}

// Delete key functionality
function onDeleteKey(key: string) {
  if (confirm(`Are you sure you want to delete the key "${key}"? This will remove it from all languages.`)) {
    // If it's a merged key, we need to delete all individual keys
    if (isMergedKey(key)) {
      const allMergedKeys = getAllKeysFromMergedKey(key)
      allMergedKeys.forEach((individualKey: string) => {
        filesStore.deleteKeyFromAllLanguages(individualKey)
      })
    } else {
      filesStore.deleteKeyFromAllLanguages(key)
    }
  }
}

// Export functionality
const exportPlatform = ref<'ios' | 'android'>('ios')
const exportMode = ref<'all' | 'changed' | 'original'>('all')

function openExportModal(mode: 'all' | 'changed' | 'original') {
  exportMode.value = mode
  const modal = document.getElementById('export_modal') as HTMLDialogElement
  modal.showModal()
}

function closeExportModal() {
  const modal = document.getElementById('export_modal') as HTMLDialogElement
  modal.close()
}

function downloadFiles() {
  closeExportModal()
  
  props.files.forEach((file, idx) => {
    let finalData: Record<string, string> = {}
    const data = props.data[idx]
    
    if (exportMode.value === 'all') {
      finalData = { ...data }
    } else if (exportMode.value === 'changed') {
      Object.keys(data).forEach(key => {
        if (data[key] !== originalData.value[idx]?.[key]) {
          finalData[key] = data[key]
        }
      })
    } else if (exportMode.value === 'original') {
      // Keep original file order by using original data as base
      finalData = { ...originalData.value[idx], ...data }
    }

    const fileName = file.name
    const fileContent = exportPlatform.value === 'ios' 
      ? toStringsFile(finalData)
      : toAndroidStringsFile(finalData)
    
    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportPlatform.value === 'ios' 
      ? fileName 
      : fileName.replace('.strings', '.xml')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

function toStringsFile(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `"${key}" = "${value.replace(/"/g, '\\"')}";`)
    .join('\n')
}

function toAndroidStringsFile(data: Record<string, string>): string {
  const xmlContent = Object.entries(data)
    .map(([key, value]) => `    <string name="${key}">${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '\\"')}</string>`)
    .join('\n')
  return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${xmlContent}\n</resources>`
}

function exportLanguageColumn(languageCode: string, format: 'ios' | 'android' = 'ios') {
  // Find the language data
  const language = orderedLanguages.value.find(lang => lang.code === languageCode)
  if (!language) {
    alert(`Language ${languageCode} not found`)
    return
  }

  // Get the filtered keys data for this language
  const columnData: Record<string, string> = {}
  filteredKeys.value.forEach(key => {
    if (isMergedKey(key)) {
      const primaryKey = getMergedKeyPrimary(key)
      columnData[primaryKey] = language.data[primaryKey] || ''
    } else {
      columnData[key] = language.data[key] || ''
    }
  })

  if (Object.keys(columnData).length === 0) {
    alert('No data to export for this column')
    return
  }

  // Create filename with current filter info
  let filename = `${languageCode}`
  if (search.value.trim()) {
    filename += `_filtered`
  }
  if (mode.value === 'paging' && selectedPage.value) {
    filename += `_${selectedPage.value}`
  }

  // Generate content based on format
  let content: string
  let mimeType: string

  if (format === 'ios') {
    content = toStringsFile(columnData)
    filename += '.strings'
    mimeType = 'text/plain;charset=utf-8'
  } else if (format === 'android') {
    content = toAndroidStringsFile(columnData)
    filename += '.xml'
    mimeType = 'application/xml;charset=utf-8'
  } else {
    alert('Unsupported export format')
    return
  }

  // Download the file
  const blob = new Blob([content], { type: mimeType })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Column resizing
const columnWidths = ref<Record<string, string>>({})
let isResizing = false
let currentResizer: string | null = null
let startX = 0
let startWidth = 0

// Column ordering
const columnOrder = ref<number[]>([])
// Column ordering for languages
const languageOrder = ref<number[]>([])
const orderedLanguages = computed(() => {
  const languages = filesStore.languages
  if (languageOrder.value.length === 0) return languages
  return languageOrder.value.map(index => languages[index])
})

// Initialize language order
watch(() => filesStore.languages, () => {
  initializeLanguageColumns()
}, { immediate: true })

function initializeLanguageColumns() {
  if (filesStore.languages && filesStore.languages.length > 0) {
    languageOrder.value = filesStore.languages.map((_, index) => index)
  } else {
    languageOrder.value = []
  }
}

function onLanguageColumnResize(data: { language: string, event: MouseEvent }) {
  startResizing(data.event, data.language)
}

function onLanguageColumnExport(data: { language: string, format: 'ios' | 'android' }) {
  exportLanguageColumn(data.language, data.format)
}

// Event handlers for LanguageColumnHeader (removed unused ones)

// Initialize column order
watch(() => props.files, () => {
  initializeColumns()
}, { immediate: true })

function initializeColumns() {
  if (props.files && props.files.length > 0) {
    columnOrder.value = props.files.map((_, index) => index)
  } else {
    columnOrder.value = []
  }
  
  // Load saved column widths from localStorage
  try {
    const savedWidths = localStorage.getItem('columnWidths')
    if (savedWidths) {
      columnWidths.value = JSON.parse(savedWidths)
    }
  } catch (error) {
    console.warn('Failed to parse saved column widths:', error)
    columnWidths.value = {}
  }
}

// Key column width computation
const keyColumnWidth = computed(() => {
  const width = columnWidths.value['key']
  if (!width) return 200
  return parseInt(width)
})

function startResizing(event: MouseEvent, columnKey: string) {
  isResizing = true
  currentResizer = columnKey
  startX = event.pageX
  
  const target = event.target as HTMLElement
  const column = target.closest('th')
  if (column) {
    startWidth = column.offsetWidth
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResizing)
}

function handleMouseMove(event: MouseEvent) {
  if (!isResizing || !currentResizer) return
  
  const diff = event.pageX - startX
  const newWidth = Math.max(100, startWidth + diff) // Minimum width of 100px
  columnWidths.value[currentResizer] = `${newWidth}px`
  
  // Save column widths to localStorage
  localStorage.setItem('columnWidths', JSON.stringify(columnWidths.value))
}

function stopResizing() {
  isResizing = false
  currentResizer = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResizing)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResizing)
})

// Safe data access functions
function setLanguageDataValue(languageCode: string, key: string, value: string) {
  // ถ้าเป็น merged key ต้องอัพเดททุก key ที่ถูกรวมไว้
  if (isMergedKey(key)) {
    // ดึงทุก key ที่ถูกรวมไว้
    const allMergedKeys = getAllKeysFromMergedKey(key)
    
    // อัพเดททุก key
    allMergedKeys.forEach(individualKey => {
      filesStore.updateKeyValue(languageCode, individualKey, value)
    })
    
    // ส่ง event สำหรับ primary key
    const primaryKey = getMergedKeyPrimary(key)
    emit('change', { key: primaryKey, fileName: languageCode })
  } else {
    // กรณี key ปกติ
    filesStore.updateKeyValue(languageCode, key, value)
    emit('change', { key, fileName: languageCode })
  }
}

// Helper functions for merged keys
function isMergedKey(key: string): boolean {
  return key.includes(' + ')
}

function getMergedKeyPrimary(key: string): string {
  if (!isMergedKey(key)) return key
  return key.split(' + ')[0] || key
}

function getMergedKeySecondary(key: string): string {
  if (!isMergedKey(key)) return ''
  const parts = key.split(' + ')
  // Return all keys except the first one (primary key)
  return parts.slice(1).join(' + ') || ''
}

function getAllKeysFromMergedKey(key: string): string[] {
  if (!isMergedKey(key)) return [key]
  return key.split(' + ')
}

function getDisplayValue(language: any, key: string): string {
  // ถ้าเป็น merged key ให้ใช้ primary key เพื่อดึงค่า
  if (isMergedKey(key)) {
    const primaryKey = getMergedKeyPrimary(key)
    return language.data[primaryKey] || ''
  }
  // กรณี key ปกติ
  return language.data[key] || ''
}

defineExpose({
  mode,
  highlightMode,
  search,
  skipColumns,
  resetColumnWidths,
  openExportModal
})

function resetColumnWidths() {
  columnWidths.value = {}
  localStorage.removeItem('columnWidths')
}
</script>

<style scoped>
.table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 0.5rem; }
.input-bordered { width: 100%; }
td:first-of-type, th:first-of-type {
  text-align: left;
}
td:nth-of-type(1) {
  text-align: left;
}
td:nth-of-type(2) {
  text-align: left;
}

.toolbar-search-top {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 4px 0 #0001;
}
.toolbar, .toolbar-label, .toolbar-radio, .toolbar-checkbox {
  color: #111;
}
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.toolbar-label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #444;
}
.toolbar-radio, .toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.97em;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.15rem 0.7rem;
  border: 1px solid #e0e0e0;
}
.toolbar-checkbox {
  margin-left: 0.5rem;
}
.tabs-paging {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  max-width: 100%;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-width: max-content;
  padding-bottom: 0.5rem;
}
.tab {
  padding: 0.4rem 1.2rem;
  border: 1px solid #ccc;
  border-bottom: none;
  background: #f9f9f9;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  color: #222;
  font-size: 0.98em;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: max-content;
  margin-bottom: 0.25rem;
}
.tab:hover {
  background: #e9e9e9;
  color: #111;
}
.tab-active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #fff;
  color: #222;
  box-shadow: 0 2px 8px 0 #0001;
}
.row-edited { background: #e6ffe6 !important; color: #222 !important; }
.row-all-equal { background: #ffeaea !important; color: #222 !important; }
.row-duplicate { background: #fff3cd !important; color: #222 !important; }
.toolbar-descs {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  font-size: 0.97em;
  color: #666;
}
.toolbar-desc {
  background: #f3f3f3;
  border-radius: 0.5rem;
  padding: 0.15rem 0.7rem;
}
.toolbar-desc-inline {
  display: inline-block;
  margin-left: 0.5em;
  font-size: 0.95em;
  color: #888;
  background: none;
  padding: 0;
}
.toolbar-radio-group {
  display: inline-flex;
  gap: 0.5rem;
}

/* Full screen layout */
.h-screen {
  height: 100vh;
}

.flex-1 {
  flex: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.overflow-auto {
  overflow: auto;
}

/* Column resizing */
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background: rgba(0, 0, 0, 0.1);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.resizer:hover,
.resizing {
  background: rgba(0, 0, 0, 0.2);
}

/* Sticky columns */
.sticky {
  position: sticky;
  z-index: 10;
  background: inherit;
}

.left-0 {
  left: 0;
}

/* Table layout */
.table {
  table-layout: fixed;
}

td, th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Make sure inputs don't overflow */
.input {
  max-width: 100%;
  box-sizing: border-box;
}

/* Component-specific full width layout */
.json-table-container {
  width: 100% !important;
  max-width: none !important;
}

.json-table-container .table {
  width: 100% !important;
  max-width: none !important;
}

/* Dual key mode badge styling */
.badge.badge-accent.badge-xs {
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Tooltip z-index override to ensure tooltips appear on top of everything */
.tooltip:before,
.tooltip:after {
  z-index: 9999 !important;
}

.tooltip {
  z-index: 9999 !important;
}

/* Ensure tooltip content is always visible */
.tooltip:hover:before,
.tooltip:hover:after {
  z-index: 10000 !important;
  opacity: 1 !important;
  visibility: visible !important;
}
</style>
