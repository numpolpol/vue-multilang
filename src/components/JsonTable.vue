<template>
  <div class="h-screen flex flex-col w-full max-w-none json-table-container px-4">
    <!-- Search & Controls -->
    <TableSearchControls
      :mode="mode"
      :search="search"
      :filtered-keys-length="filteredKeys.length"
      :visible-keys-length="visibleKeys.length"
      :selected-page="selectedPage"
      :page-prefixes-length="pagePrefixes.length"
      :searching="searching"
      @update:search="search = $event"
      @update:mode="mode = $event"
      @add-key="$emit('addKey')"
    />

    <!-- Page Tabs -->
    <PageTabs
      :mode="mode"
      :page-prefixes="filteredPagePrefixes"
      :selected-page="selectedPage"
      @update:selected-page="selectedPage = $event"
    />

    <!-- Table wrapper with horizontal scroll -->
    <div class="flex-1 overflow-auto w-full px-4">
      <!-- Table container -->
      <div class="w-full flex flex-col h-full">
        <div class="flex-1 overflow-auto relative">
          <table class="table w-full">
            <thead class="sticky top-0 z-30 bg-white shadow-md border-b border-base-200">
              <tr>
                <!-- Fixed key column -->
                <th class="sticky left-0 z-20 bg-white border-r border-base-200" :style="{ width: columnWidths['key'] || '200px', minWidth: '150px' }">
                  <div class="flex items-center gap-2">
                    <span>Key</span>
                    <div class="resizer" @mousedown="startResizing($event, 'key')"></div>
                  </div>
                </th>
                <!-- Fixed paste column -->
                <th class="sticky bg-white border-r border-base-200 z-20" :style="{ left: `${keyColumnWidth}px`, width: '80px', minWidth: '80px' }">
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
                :all-keys="filteredKeys"
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
                            <TableRow
                :key-name="key"
                :column-widths="columnWidths"
                :key-column-width="keyColumnWidth"
                :ordered-languages="orderedLanguages"
                :is-merged-key="false"
                :is-editing="editingKey === key"
                :edit-key-value="editKeyValue"
                :edit-key-error="editKeyError"
                :change-details="filesStore.getKeyChangeDetails(key)"
                @start-edit-key="startEditKey(key)"
                @save-edit-key="saveEditKey"
                @update-edit-key-value="editKeyValue = $event"
                @cancel-edit-key="cancelEditKey"
                @paste="onPaste(key)"
                @update-value="onUpdateValue(key, $event.languageCode, $event.value)"
                @delete="onDeleteKey(key)"
              />
            </template>
          </tbody>
        </table>
        </div>
      </div>
    </div>
    
    <!-- Export Changes Modal -->
    <dialog id="export_changes_modal" class="modal">
      <div class="modal-box w-11/12 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <h3 class="font-bold text-lg mb-4">Export All Languages - Changes Summary</h3>
        
        <div v-if="exportSummary" class="text-sm text-base-content/70 mb-4">
          Exporting {{ exportSummary.totalLanguages }} languages with {{ exportSummary.totalKeys }} keys total.
          <span v-if="exportSummary.changedKeys > 0" class="text-warning font-medium">
            {{ exportSummary.changedKeys }} keys have been modified from original import.
          </span>
          <span v-else class="text-success">
            No changes detected from original import.
          </span>
        </div>

        <!-- Changes List -->
        <div v-if="changedKeysWithDetails.length > 0" class="flex-1 overflow-hidden flex flex-col">
          <h4 class="font-semibold mb-2 text-warning">Modified Keys ({{ changedKeysWithDetails.length }})</h4>
          <div class="overflow-y-auto flex-1 space-y-2">
            <div v-for="keyDetail in changedKeysWithDetails" :key="keyDetail.key" 
                 class="border rounded-lg p-3 bg-base-100">
              <div class="font-medium text-sm mb-2">{{ keyDetail.key }}</div>
              <div class="space-y-1">
                <div v-for="change in keyDetail.changes" :key="change.languageCode" 
                     class="text-xs">
                  <div class="flex items-center gap-2">
                    <span class="badge badge-xs" :class="{
                      'badge-success': change.status === 'new',
                      'badge-warning': change.status === 'modified',
                      'badge-error': change.status === 'deleted'
                    }">{{ change.status }}</span>
                    <span class="font-medium">{{ change.languageName }}</span>
                  </div>
                  <div v-if="change.status === 'modified'" class="ml-4 space-y-0.5">
                    <div class="text-error">- {{ change.oldValue || '(empty)' }}</div>
                    <div class="text-success">+ {{ change.newValue || '(empty)' }}</div>
                  </div>
                  <div v-else-if="change.status === 'new'" class="ml-4">
                    <div class="text-success">+ {{ change.newValue || '(empty)' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else-if="exportSummary" class="text-center py-8 text-base-content/50">
          <div class="text-4xl mb-2">✅</div>
          <div>No changes detected. All files will be exported as originally imported.</div>
        </div>
        
        <div class="modal-action mt-4">
          <button class="btn" @click="closeExportChangesModal">Cancel</button>
          <button class="btn btn-primary" @click="confirmExportAll">
            <span v-if="exportSummary && exportSummary.changedKeys > 0">Export {{ exportSummary.totalLanguages }} Files with Changes</span>
            <span v-else>Export {{ exportSummary?.totalLanguages || 0 }} Files</span>
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeExportChangesModal">close</button>
      </form>
    </dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch, onBeforeUnmount, nextTick } from 'vue'
import { useFilesStore } from '../stores/files'
import { toStrings, toStringsWithStructure } from '../utils/strings'
import { hasSpecialCharactersInLanguageData } from '../utils/specialCharacters'
import LanguageColumnHeader from './LanguageColumnHeader.vue'
import TableSearchControls from './TableSearchControls.vue'
import PageTabs from './PageTabs.vue'
import TableRow from './TableRow.vue'

const emit = defineEmits<{
  (e: 'update:mode', value: 'all' | 'paging' | 'changes'): void
  (e: 'update:search', value: string): void
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
}>()

const mode = ref<'all' | 'paging' | 'changes'>('all')
const selectedPage = ref('')
const search = ref('')
const debouncedSearch = ref('')
const searchTimeout = ref<number | null>(null)
const skipColumns = ref(props.skipColumns || 0)

const loading = ref(false)
const searching = ref(false)

// Key editing state
const editingKey = ref<string | null>(null)
const editKeyValue = ref<string>('')
const editKeyError = ref<string>('')
const editKeyInput = ref<HTMLInputElement | null>(null)

// Export changes modal state
const exportSummary = ref<{
  totalLanguages: number
  totalKeys: number
  changedKeys: number
} | null>(null)
const changedKeysWithDetails = ref<Array<{
  key: string
  changes: Array<{
    languageCode: string
    languageName: string
    status: 'new' | 'modified' | 'deleted'
    oldValue?: string
    newValue?: string
  }>
}>>([]) 

// Get store instance
const filesStore = useFilesStore()

// Helper function to extract page prefix from key (allows dashes in prefix)
function getPagePrefix(key: string): string {
  // Find the first underscore and take everything before it as the prefix
  const underscoreIndex = key.indexOf('_')
  if (underscoreIndex === -1) return key // If no underscore, the whole key is the prefix
  return key.substring(0, underscoreIndex)
}

// Watch for changes to editingKey to focus the input

// Watch for changes to editingKey to focus the input
watch(editingKey, async () => {
  if (editingKey.value && editKeyInput.value) {
    await nextTick()
    editKeyInput.value?.focus()
    editKeyInput.value?.select()
  }
})

const allKeys = computed(() => {
  // Use language data from store instead of props.data
  if (filesStore.hasLanguageFiles) {
    // Get all unique keys
    return filesStore.allKeysFromLanguages
  }
  
  // Fallback to legacy structure
  if (!props.data || props.data.length === 0) return []
  const keySet = new Set<string>()

props.data.forEach(obj => {
    Object.keys(obj).forEach(key => keySet.add(key))
  })
  return Array.from(keySet)
})

// Debounced search implementation with adaptive delay
watch(search, (newValue) => {
  searching.value = true
  
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  // Adaptive delay based on search complexity and data size
  let delay = 300 // Default 300ms
  
  const query = newValue.trim()
  const dataSize = allKeys.value.length
  
  // Increase delay for complex searches
  if (query.includes(',') || query.startsWith('/') || query.includes(':')) {
    delay = 500 // Complex search modes
  }
  
  // Increase delay for large datasets
  if (dataSize > 500) {
    delay += 200
  }
  if (dataSize > 1000) {
    delay += 300
  }
  
  // Instant search for empty query
  if (!query) {
    delay = 0
    searching.value = false
  }
  
  searchTimeout.value = setTimeout(() => {
    debouncedSearch.value = newValue
    searching.value = false
  }, delay)
}, { immediate: true })

const pagePrefixes = computed(() => {
  const prefixes = new Set<string>()
  allKeys.value.forEach(key => {
    const prefix = getPagePrefix(key)
    if (prefix) prefixes.add(prefix)
  })
  return Array.from(prefixes)
})

// Filtered page prefixes - only show sections that have matching keys after search
const filteredPagePrefixes = computed(() => {
  const query = debouncedSearch.value.trim()
  if (!query) return pagePrefixes.value
  
  // Get all keys that match the search
  const matchingKeys = getFilteredKeysForQuery(query, allKeys.value)
  
  // Get prefixes of matching keys
  const matchingPrefixes = new Set<string>()
  matchingKeys.forEach(key => {
    const prefix = getPagePrefix(key)
    if (prefix) matchingPrefixes.add(prefix)
  })
  
  return Array.from(matchingPrefixes)
})

const visibleKeys = computed(() => {
  if (mode.value === 'all') return allKeys.value
  if (mode.value === 'changes') return filesStore.changedKeys
  if (!selectedPage.value) return []
  return allKeys.value.filter(key => getPagePrefix(key) === selectedPage.value)
})

// Enhanced search function - extracted for reuse
const getFilteredKeysForQuery = (query: string, keysToFilter: string[]) => {
  if (!query) return keysToFilter

  // Special search modes
  // 1. Empty values search: empty: or blank:
  if (query === 'empty:' || query === 'blank:') {
    return keysToFilter.filter(key => {
      if (!props.data || props.data.length === 0) return false
      return props.data.some(obj => {
        const value = obj?.[key] ?? ''
        return value === '' || value.trim() === ''
      })
    })
  }

  // 2. Duplicate values search: duplicate:
  if (query === 'duplicate:') {
    return keysToFilter.filter(key => {
      if (!props.data || props.data.length === 0) return false
      const values = props.data.map(obj => (obj?.[key] ?? '').trim()).filter(Boolean)
      const uniqueValues = new Set(values)
      return values.length > uniqueValues.size
    })
  }

  // 3. Key-only search: key:pattern
  if (query.startsWith('key:')) {
    const keyQuery = query.substring(4).toLowerCase()
    return keysToFilter.filter(key => key.toLowerCase().includes(keyQuery))
  }

  // 4. Value-only search: value:pattern
  if (query.startsWith('value:')) {
    const valueQuery = query.substring(6).toLowerCase()
    return keysToFilter.filter(key => {
      if (!props.data || props.data.length === 0) return false
      return props.data.some(obj => {
        const value = obj?.[key] ?? ''
        return value.toLowerCase().includes(valueQuery)
      })
    })
  }

  // 5. Special characters search: special:
  if (query === 'special:') {
    return keysToFilter.filter(key => {
      if (!props.data || props.data.length === 0) return false
      // Check if any language value for this key contains special characters
      return props.data.some(obj => {
        if (!obj || !obj[key]) return false
        return hasSpecialCharactersInLanguageData({ [key]: obj[key] }, key)
      })
    })
  }

  // 6. Language-specific search: lang:th:pattern
  const langMatch = query.match(/^lang:([a-z]{2,3}):(.*)/)
  if (langMatch) {
    const [, langCode, searchPattern] = langMatch
    const langIndex = props.data?.findIndex((_, index) => {
      // Find language by checking store or use index
      const filesStore = useFilesStore()
      return filesStore.languages[index]?.code === langCode
    })
    
    if (langIndex >= 0) {
      const pattern = searchPattern.toLowerCase()
      return keysToFilter.filter(key => {
        const value = props.data?.[langIndex]?.[key] ?? ''
        return value.toLowerCase().includes(pattern)
      })
    }
  }

  // 7. Regex mode: if query starts and ends with /, treat as regex
  if (query.length > 2 && query.startsWith('/') && query.endsWith('/')) {
    try {
      const pattern = query.slice(1, -1)
      const regex = new RegExp(pattern, 'i')
      return keysToFilter.filter(key => {
        // Search in key name
        if (regex.test(key)) return true
        // Search in values
        if (props.data && props.data.length > 0) {
          for (const obj of props.data) {
            if (obj && regex.test(obj[key] ?? '')) return true
          }
        }
        return false
      })
    } catch (e) {
      // Invalid regex, show no results and optionally display error
      console.warn('Invalid regex pattern:', query)
      return []
    }
  }

  // 8. Multi-term search: split by comma, search in priority order
  const terms = query.split(',').map(s => s.trim()).filter(Boolean)
  if (terms.length === 0) return keysToFilter
  
  const seen = new Set<string>()
  const result: string[] = []
  
  terms.forEach(term => {
    const q = term.toLowerCase()
    keysToFilter.forEach(key => {
      if (!seen.has(key)) {
        // Match key name
        let match = key.toLowerCase().includes(q)
        
        // Match values if not found in key
        if (!match && props.data && props.data.length > 0) {
          for (const obj of props.data) {
            if (obj && (obj[key] ?? '').toLowerCase().includes(q)) {
              match = true
              break
            }
          }
        }
        
        if (match) {
          seen.add(key)
          result.push(key)
        }
      }
    })
  })
  
  return result
}

// Enhanced search with multiple modes and better UX
const filteredKeys = computed(() => {
  const query = debouncedSearch.value.trim()
  return getFilteredKeysForQuery(query, visibleKeys.value)
})

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

// Auto-switch to first available section when search filters sections
watch([filteredPagePrefixes, debouncedSearch], () => {
  if (mode.value === 'paging' && debouncedSearch.value.trim()) {
    // If current page is not in filtered list, switch to first available
    if (selectedPage.value && !filteredPagePrefixes.value.includes(selectedPage.value)) {
      if (filteredPagePrefixes.value.length > 0) {
        selectedPage.value = filteredPagePrefixes.value[0]
      }
    }
  }
})

// Cleanup search timeout on unmount
onBeforeUnmount(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})



if (mode.value === 'paging' && !selectedPage.value && filteredPagePrefixes.value.length > 0) {
  selectedPage.value = filteredPagePrefixes.value[0]
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
        
        // Update key value directly
        filesStore.updateKeyValue(language.code, key, value)
      }
    }
  } catch (e) {
    alert('Unable to read clipboard.');
  }
}

// Handle value updates from TableRow
function onUpdateValue(key: string, languageCode: string, value: string) {
  setLanguageDataValue(languageCode, key, value)
}

// Delete key functionality
function onDeleteKey(key: string) {
  if (confirm(`Are you sure you want to delete the key "${key}"? This will remove it from all languages.`)) {
    // Delete key from all languages
    filesStore.deleteKeyFromAllLanguages(key)
  }
}

// Column export functionality

function exportLanguageColumn(languageCode: string) {
  // Find the language data
  const language = orderedLanguages.value.find(lang => lang.code === languageCode)
  if (!language) {
    alert(`Language ${languageCode} not found`)
    return
  }

  // Get ALL keys data for this language (not just filtered keys)
  // This ensures structure preservation and complete export
  const columnData: Record<string, string> = {}
  
  // Use all keys from the language data to preserve complete structure
  Object.keys(language.data).forEach(key => {
    columnData[key] = language.data[key] || ''
  })

  if (Object.keys(columnData).length === 0) {
    alert('No data to export for this column')
    return
  }

  // Create filename (always exports complete file regardless of filters)
  let filename = `${languageCode}`

  // Generate iOS .strings content with structure preservation
  let content: string
  if (language.originalStructure) {
    // Use structure-preserving export to maintain comments and order
    content = toStringsWithStructure(columnData, language.originalStructure)
  } else {
    // Use standard export
    content = toStrings(columnData)
  }
  filename += '.strings'
  const mimeType = 'text/plain;charset=utf-8'

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
const orderedLanguages = computed(() => {
  // Directly use the store's languages array, which is already properly ordered
  return filesStore.languages
})

function onLanguageColumnResize(data: { language: string, event: MouseEvent }) {
  startResizing(data.event, data.language)
}

function onLanguageColumnExport(data: { language: string }) {
  exportLanguageColumn(data.language)
}

// Export all columns functionality - show changes modal first
function exportAllColumns() {
  if (orderedLanguages.value.length === 0) {
    alert('No languages available to export')
    return
  }

  // Prepare export summary
  const totalKeys = allKeys.value.length
  const changedKeys = filesStore.changedKeys
  
  exportSummary.value = {
    totalLanguages: orderedLanguages.value.length,
    totalKeys,
    changedKeys: changedKeys.length
  }
  
  // Get detailed changes for each changed key
  changedKeysWithDetails.value = changedKeys.map(key => {
    const changes = filesStore.getKeyChangeDetails(key)
    return {
      key,
      changes: changes || []
    }
  }).filter(item => item.changes.length > 0)
  
  // Show the modal
  const modal = document.getElementById('export_changes_modal') as HTMLDialogElement
  if (modal) {
    modal.showModal()
  }
}

// Export changes detail as a text file
function exportChangesDetail() {
  if (!exportSummary.value || !changedKeysWithDetails.value) return
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const projectName = filesStore.currentProject?.name || 'Unnamed Project'
  
  let content = `# Export Changes Summary\n\n`
  content += `**Project:** ${projectName}\n`
  content += `**Export Date:** ${new Date().toLocaleString()}\n`
  content += `**Total Languages:** ${exportSummary.value.totalLanguages}\n`
  content += `**Total Keys:** ${exportSummary.value.totalKeys}\n`
  content += `**Changed Keys:** ${exportSummary.value.changedKeys}\n\n`
  
  if (exportSummary.value.changedKeys === 0) {
    content += `## No Changes Detected\n\n`
    content += `All files are exported as originally imported with no modifications.\n`
  } else {
    content += `## Detailed Changes\n\n`
    
    changedKeysWithDetails.value.forEach((item, index) => {
      content += `### ${index + 1}. Key: "${item.key}"\n\n`
      
      item.changes.forEach(change => {
        content += `**${change.languageName} (${change.languageCode}):** `
        if (change.status === 'modified') {
          content += `Modified\n`
          content += `- **Original:** "${change.oldValue || ''}"\n`
          content += `- **Current:** "${change.newValue || ''}"\n\n`
        } else if (change.status === 'new') {
          content += `Added\n`
          content += `- **Value:** "${change.newValue || ''}"\n\n`
        } else if (change.status === 'deleted') {
          content += `Deleted\n`
          content += `- **Original Value:** "${change.oldValue || ''}"\n\n`
        }
      })
    })
  }
  
  content += `---\n`
  content += `Generated by Vue Multi-Language Editor\n`
  
  // Download the changes detail file
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${projectName}_changes_${timestamp}.md`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// Confirm export after viewing changes
function confirmExportAll() {
  if (!exportSummary.value) return
  
  // Export changes detail file first
  exportChangesDetail()
  
  // Export each language column with a delay to prevent browser blocking
  orderedLanguages.value.forEach((language, index) => {
    setTimeout(() => {
      exportLanguageColumn(language.code)
    }, index * 100) // 100ms delay between downloads
  })

  // Show success message
  setTimeout(() => {
    const fileCount = exportSummary.value?.totalLanguages || 0
    alert(`Started downloading ${fileCount} language files + 1 changes detail file. Please check your downloads folder.`)
  }, (exportSummary.value?.totalLanguages || 0) * 100 + 500)
  
  // Close modal
  closeExportChangesModal()
}

// Close export changes modal
function closeExportChangesModal() {
  const modal = document.getElementById('export_changes_modal') as HTMLDialogElement
  if (modal) {
    modal.close()
  }
  exportSummary.value = null
  changedKeysWithDetails.value = []
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
  // Simple key update - no merged key logic needed in iOS-only mode
  filesStore.updateKeyValue(languageCode, key, value)
  emit('change', { key, fileName: languageCode })
}



// Key editing functions
function startEditKey(key: string) {
  editingKey.value = key
  editKeyValue.value = key
  editKeyError.value = ''
  // Focus the input in the next tick
  nextTick(() => {
    if (editKeyInput.value) {
      editKeyInput.value.focus()
      editKeyInput.value.select()
    }
  })
}

function cancelEditKey() {
  editingKey.value = null
  editKeyValue.value = ''
  editKeyError.value = ''
}

function saveEditKey() {
  if (!editingKey.value || !editKeyValue.value.trim()) {
    editKeyError.value = 'Key cannot be empty'
    return
  }
  
  const oldKey = editingKey.value
  const newKey = editKeyValue.value.trim()
  
  if (oldKey === newKey) {
    cancelEditKey()
    return
  }
  
  // Check if key already exists
  const allKeys = filesStore.allKeysFromLanguages
  if (allKeys.includes(newKey)) {
    editKeyError.value = 'Key already exists'
    return
  }
  
  // Attempt to rename the key
  const success = filesStore.renameKey(oldKey, newKey)
  if (success) {
    cancelEditKey()
    emit('change', { key: newKey, fileName: 'key-renamed' })
  } else {
    editKeyError.value = 'Failed to rename key'
  }
}

// CSV Export functionality
async function exportToCSV() {
  console.log('🟡 exportToCSV called in JsonTable.vue')
  console.log('🟡 orderedLanguages:', orderedLanguages.value)
  console.log('filteredKeys:', filteredKeys.value)
  
  if (orderedLanguages.value.length === 0) {
    alert('No languages available to export')
    return
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const projectName = filesStore.currentProject?.name || 'Unnamed Project'
  
  // Use filtered keys (respects current filtering and section mode)
  const keysToExport = filteredKeys.value
  
  console.log('keysToExport length:', keysToExport.length)
  
  if (keysToExport.length === 0) {
    alert('No keys to export (try clearing filters)')
    return
  }

  // Create CSV content
  let csvContent = ''
  
  // Header row
  const headers = ['Key', ...orderedLanguages.value.map(lang => lang.name)]
  csvContent += headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n'
  
  console.log('CSV headers:', headers)
  
  // Data rows
  keysToExport.forEach(key => {
    const row = [key]
    
    // Add values for each language
    orderedLanguages.value.forEach(language => {
      const value = language.data[key] || ''
      // Escape quotes and wrap in quotes
      const escapedValue = value.replace(/"/g, '""')
      row.push(`"${escapedValue}"`)
    })
    
    csvContent += row.join(',') + '\n'
  })

  // Create filename based on export context
  let filename = `${projectName}_export_${timestamp}.csv`
  
  // Add context to filename if filtering is active
  if (search.value.trim()) {
    filename = `${projectName}_filtered_export_${timestamp}.csv`
  } else if (mode.value === 'paging' && selectedPage.value) {
    const section = selectedPage.value.replace(/[^a-zA-Z0-9]/g, '_')
    filename = `${projectName}_section_${section}_export_${timestamp}.csv`
  }

  console.log('CSV filename:', filename)
  console.log('CSV content preview:', csvContent.substring(0, 200))

  // Simple and reliable CSV download
  try {
    // Create blob with BOM for better Excel compatibility
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.href = url
    link.download = filename
    link.style.display = 'none'
    
    // Add to body and trigger download
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)
    
    console.log('CSV download triggered successfully')
    
  } catch (error) {
    console.error('Error creating CSV download:', error)
    
    // Fallback: copy to clipboard and show instructions
    try {
      await navigator.clipboard.writeText(csvContent)
      alert(`CSV export failed to download, but the content has been copied to your clipboard.\n\nPlease:\n1. Create a new file with name: ${filename}\n2. Paste the content\n3. Save the file\n\nContent preview:\n${csvContent.substring(0, 200)}...`)
    } catch (clipError) {
      alert(`CSV export failed. Please copy this content manually and save as ${filename}:\n\n${csvContent.substring(0, 500)}...`)
    }
  }
  
  console.log('Download initiated')
  
  // Show success notification with download location hint
  const contextInfo = search.value.trim() 
    ? `filtered (${keysToExport.length} keys)` 
    : mode.value === 'paging' && selectedPage.value 
      ? `section "${selectedPage.value}" (${keysToExport.length} keys)`
      : `all keys (${keysToExport.length} keys)`
      
  setTimeout(() => {
    alert(`CSV export initiated!\n\n` +
          `Exported: ${contextInfo}\n` +
          `Languages: ${orderedLanguages.value.length}\n` +
          `File: ${filename}\n\n` +
          `If the download didn't start automatically, please check:\n` +
          `• Your Downloads folder\n` +
          `• Browser download settings\n` +
          `• Pop-up blocker settings`)
  }, 200)
}

defineExpose({
  mode,
  search,
  skipColumns,
  exportAllColumns,
  exportToCSV
})
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

/* Sticky columns - improved */
.sticky {
  position: sticky !important;
  z-index: 10;
  background: white !important;
}

/* Enhanced sticky header styling */
thead.sticky {
  position: sticky !important;
  top: 0 !important;
  z-index: 30 !important;
  background: white !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Sticky columns with higher z-index */
th.sticky {
  position: sticky !important;
  z-index: 20 !important;
  background: white !important;
}

/* Ensure sticky elements stay on top */
.sticky {
  transition: box-shadow 0.2s ease-in-out;
}

.sticky:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.left-0 {
  left: 0;
}

/* Table layout - improved for sticky headers */
.table {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
}

/* Ensure proper table container height */
.flex-1.overflow-auto {
  height: 0; /* Force flex item to respect parent height */
  min-height: 200px;
}

td, th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-bottom: 1px solid #e5e5e5;
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
