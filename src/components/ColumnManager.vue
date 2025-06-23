<template>
  <div class="space-y-4">
    <div class="divider">Column Management</div>
    
    <!-- Add Language Column -->
    <div class="space-y-2">
      <h4 class="font-medium text-sm">Add Language Column</h4>
      <div class="join w-full">
        <select v-model="newLanguageCode" class="select select-bordered select-sm join-item flex-1">
          <option value="" disabled>Select Language</option>
          <option v-for="lang in availableLanguages" :key="lang.code" :value="lang.code">
            {{ lang.name }} ({{ lang.code.toUpperCase() }})
          </option>
        </select>
        <button 
          class="btn btn-primary btn-sm join-item"
          @click="addLanguage"
          :disabled="!newLanguageCode"
        >
          Add
        </button>
      </div>
    </div>
    
    <!-- Current Columns with Move Controls -->
    <div class="space-y-2">
      <h4 class="font-medium text-sm">Current Columns</h4>
      <div class="space-y-1">
        <div 
          v-for="(language, index) in orderedLanguages" 
          :key="language.code"
          class="p-2 bg-base-200 rounded-lg space-y-2"
        >          
          <!-- Language info row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="font-medium text-sm truncate">{{ language.name }}</span>
              <span class="text-xs text-base-content/60 shrink-0">({{ language.code.toUpperCase() }})</span>
              <div v-if="language.hasFile" class="badge badge-success badge-xs shrink-0">
                {{ language.fileType?.toUpperCase() }}
              </div>
            </div>
            
            <!-- Remove button -->
            <button 
              class="btn btn-error btn-xs btn-circle shrink-0"
              @click="removeLanguage(language.code)"
              :title="`Remove ${language.name} column`"
              :disabled="orderedLanguages.length <= 1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Move Controls row -->
          <div class="flex items-center gap-1 w-full">
            <!-- Move Up/Down -->
            <button 
              class="btn btn-xs btn-ghost flex-1"
              @click="moveLanguage(index, 'up')"
              :disabled="index === 0"
              :title="'Move ' + language.name + ' up'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
              Up
            </button>
            
            <button 
              class="btn btn-xs btn-ghost flex-1"
              @click="moveLanguage(index, 'down')"
              :disabled="index === orderedLanguages.length - 1"
              :title="'Move ' + language.name + ' down'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              Down
            </button>
            
            <!-- Quick Jump -->
            <button 
              class="btn btn-xs btn-outline flex-1"
              @click="moveLanguageToPosition(index, 0)"
              :disabled="index === 0"
              :title="'Move ' + language.name + ' to first'"
            >
              ⇈ First
            </button>
            
            <button 
              class="btn btn-xs btn-outline flex-1"
              @click="moveLanguageToPosition(index, orderedLanguages.length - 1)"
              :disabled="index === orderedLanguages.length - 1"
              :title="'Move ' + language.name + ' to last'"
            >
              ⇊ Last
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="orderedLanguages.length === 0" class="text-center py-4 text-base-content/50">
        No language columns. Add one above to get started.
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="space-y-2">
      <h4 class="font-medium text-sm">Quick Actions</h4>
      
      <!-- Quick Add Common Languages -->
      <div class="space-y-1">
        <div class="text-xs text-base-content/60">Quick Add:</div>
        <div class="grid grid-cols-2 gap-1">
          <button 
            v-for="lang in commonLanguages.slice(0, 6)" 
            :key="lang.code"
            class="btn btn-outline btn-xs text-xs"
            @click="quickAddLanguage(lang.code, lang.name)"
            :disabled="orderedLanguages.some(l => l.code === lang.code)"
          >
            {{ lang.name }}
          </button>
        </div>
      </div>
      
      <!-- Reorder Presets -->
      <div class="space-y-1">
        <div class="text-xs text-base-content/60">Auto Sort:</div>
        <div class="grid grid-cols-2 gap-1">
          <button 
            class="btn btn-xs btn-outline text-xs"
            @click="sortLanguagesAlphabetically"
            :disabled="orderedLanguages.length <= 1"
          >
            A-Z
          </button>
          <button 
            class="btn btn-xs btn-outline text-xs"
            @click="sortLanguagesByCode"
            :disabled="orderedLanguages.length <= 1"
          >
            Code
          </button>
          <button 
            class="btn btn-xs btn-outline text-xs"
            @click="moveFilesFirst"
            :disabled="orderedLanguages.length <= 1"
            title="Move languages with files to the top"
          >
            Files First
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useFilesStore } from '../stores/files'

const emit = defineEmits<{
  languageAdded: [languageCode: string]
  languageRemoved: [languageCode: string]
  languagesReordered: [fromIndex: number, toIndex: number]
}>()

const filesStore = useFilesStore()

const newLanguageCode = ref('')

// Get current languages from store
const orderedLanguages = computed(() => filesStore.languages)

// Common languages list (expanded)
const commonLanguages = [
  { code: 'en', name: 'English' },
  { code: 'th', name: 'Thai' },
  { code: 'km', name: 'Khmer' },
  { code: 'my', name: 'Myanmar' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ms', name: 'Malay' },
  { code: 'tl', name: 'Filipino' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'ur', name: 'Urdu' },
]

// Available languages (excluding already added ones)
const availableLanguages = computed(() => {
  const existingCodes = orderedLanguages.value.map(lang => lang.code)
  return commonLanguages.filter(lang => !existingCodes.includes(lang.code))
})

function addLanguage() {
  if (!newLanguageCode.value) return
  
  const selectedLang = commonLanguages.find(lang => lang.code === newLanguageCode.value)
  if (!selectedLang) return
  
  filesStore.addLanguageColumn(selectedLang.code, selectedLang.name)
  emit('languageAdded', selectedLang.code)
  newLanguageCode.value = ''
}

function quickAddLanguage(code: string, name: string) {
  filesStore.addLanguageColumn(code, name)
  emit('languageAdded', code)
}

function removeLanguage(languageCode: string) {
  if (orderedLanguages.value.length <= 1) {
    alert('Cannot remove the last language column')
    return
  }
  
  if (confirm(`Are you sure you want to remove the ${languageCode.toUpperCase()} column? This will delete all data in this column.`)) {
    filesStore.removeLanguageColumn(languageCode)
    emit('languageRemoved', languageCode)
  }
}

// Move functions with button controls
function moveLanguage(index: number, direction: 'up' | 'down') {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= orderedLanguages.value.length) return
  
  filesStore.reorderLanguageColumns(index, targetIndex)
  emit('languagesReordered', index, targetIndex)
}

function moveLanguageToPosition(fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex) return
  
  filesStore.reorderLanguageColumns(fromIndex, toIndex)
  emit('languagesReordered', fromIndex, toIndex)
}

// Sorting functions
function sortLanguagesAlphabetically() {
  const sorted = [...orderedLanguages.value].sort((a, b) => a.name.localeCompare(b.name))
  reorderToMatch(sorted)
}

function sortLanguagesByCode() {
  const sorted = [...orderedLanguages.value].sort((a, b) => a.code.localeCompare(b.code))
  reorderToMatch(sorted)
}

function moveFilesFirst() {
  const withFiles = orderedLanguages.value.filter(lang => lang.hasFile)
  const withoutFiles = orderedLanguages.value.filter(lang => !lang.hasFile)
  const sorted = [...withFiles, ...withoutFiles]
  reorderToMatch(sorted)
}

function reorderToMatch(targetOrder: typeof orderedLanguages.value) {
  // Apply multiple moves to achieve the target order
  targetOrder.forEach((targetLang, targetIndex) => {
    const currentIndex = orderedLanguages.value.findIndex(lang => lang.code === targetLang.code)
    if (currentIndex !== targetIndex && currentIndex !== -1) {
      filesStore.reorderLanguageColumns(currentIndex, targetIndex)
    }
  })
  emit('languagesReordered', -1, -1) // Signal that reordering happened
}
</script>

<style scoped>
/* Compact sidebar-friendly interface */
.btn-xs {
  min-height: 1.5rem;
  height: 1.5rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  font-size: 0.75rem;
}

.language-row {
  transition: background-color 0.2s ease;
}

.language-row:hover {
  background-color: rgba(var(--b3), 1);
}

/* Ensure text doesn't overflow in sidebar */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Grid layout for compact buttons */
.grid-cols-2 > * {
  min-width: 0; /* Allow flex items to shrink */
}

/* Compact spacing for dense layout */
.space-y-1 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.25rem;
}

.space-y-2 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 0.5rem;
}
</style>
