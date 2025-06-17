<template>
  <div class="drawer lg:drawer-open h-screen">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <!-- Drawer side -->
    <div class="drawer-side z-40">
      <label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="menu p-4 w-80 min-h-full bg-base-200">
        <!-- Theme & Controls -->
        <div class="space-y-4">

          <!-- Theme -->
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text font-semibold">Theme</span>
            </label>
            <select v-model="theme" class="select select-bordered w-full" @change="updateTheme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="zimablue">Zima Blue</option>
            </select>
          </div>

          <!-- View Controls (when in step 2) -->
          <template v-if="step === 2">
            <div class="divider">View Controls</div>
            
            <!-- View Mode -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Display Mode</span>
              </label>
              <div class="flex flex-col gap-2">
                <label class="label cursor-pointer justify-start gap-2">
                  <input type="radio" class="radio radio-sm" :value="'all'" v-model="viewMode" />
                  <span class="label-text">See All Keys</span>
                </label>
                <label class="label cursor-pointer justify-start gap-2">
                  <input type="radio" class="radio radio-sm" :value="'paging'" v-model="viewMode" />
                  <span class="label-text">Group by Prefix</span>
                </label>
              </div>
            </div>

            <!-- Highlight Mode -->
            <div class="form-control">
              <label class="label cursor-pointer justify-start gap-2">
                <input type="checkbox" class="toggle toggle-sm" v-model="highlightMode" />
                <span class="label-text">Highlight Changes</span>
              </label>
              <label class="label">
                <span class="label-text-alt">Highlight edited, duplicate, or identical values</span>
              </label>
            </div>

            <!-- Table Controls -->
            <div class="divider">Table Controls</div>
            
            <!-- Column Reset -->
            <button class="btn btn-sm btn-block" @click="resetColumnWidths">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
              Reset Column Widths
            </button>

            <!-- Search -->
            <div class="form-control">
              <label class="label">
                <span class="label-text font-semibold">Search</span>
                <span class="label-text-alt">{{ filteredCount }} / {{ totalKeys }} keys</span>
              </label>
              <div class="join w-full">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search keys or values..." 
                  class="input input-bordered input-sm join-item w-full" 
                  :class="{ 'input-error': noResults }"
                />
                <button 
                  class="btn btn-sm join-item" 
                  :class="{ 'btn-error': noResults }"
                  @click="clearSearch"
                  v-if="searchQuery"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <label class="label" v-if="noResults">
                <span class="label-text-alt text-error">No keys found</span>
              </label>
            </div>

            <!-- Export Options -->
            <div class="divider">Export Options</div>
            <div class="flex flex-col gap-2">
              <button class="btn btn-primary btn-sm btn-block" @click="jsonTable?.openExportModal('all')">
                Export All
              </button>
              <button class="btn btn-accent btn-sm btn-block" @click="jsonTable?.openExportModal('changed')">
                Export Changed
              </button>
              <button class="btn btn-sm btn-block" @click="jsonTable?.openExportModal('original')">
                Keep Order
              </button>
            </div>

            <!-- Back Button -->
            <div class="divider"></div>
            <button class="btn btn-ghost btn-sm btn-block" @click="reset">
              Back to Upload
            </button>
          </template>
        </div>
      </div>
    </div>
    
    <!-- Page content -->
    <div class="drawer-content">
      <!-- Navbar -->
      <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
        <div class="navbar-start">
          <label for="drawer" class="btn btn-square btn-ghost drawer-button lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </label>
          <h1 class="text-2xl font-bold ml-2">Home</h1>
        </div>
      </div>
    <div v-if="step === 1">
      <div class="alert alert-info shadow-lg mb-6">
        <div class="flex flex-col">
          <div class="font-bold mb-2">How to use:</div>
          <ol class="list-decimal list-inside space-y-2">
            <li><span class="font-semibold">Choose Files:</span> Select multiple iOS <span class="font-semibold">.strings</span> or Android <span class="font-semibold">string.xml</span> files (one per language, same keys).</li>
            <li><span class="font-semibold">Ready:</span> Click <span class="font-semibold">Ready</span> to load and edit all keys/values side-by-side.</li>
            <li><span class="font-semibold">View:</span> Use <span class="font-semibold">See All</span>/<span class="font-semibold">Paging</span> to switch key views.</li>
            <li><span class="font-semibold">Edit:</span> Edit values directly or use <span class="font-semibold">Paste</span> per row for quick input.</li>
            <li><span class="font-semibold">Export:</span> Use floating buttons to export all, changed, or keep order.</li>
            <li><span class="font-semibold">Back:</span> Use the floating <span class="font-semibold">Back</span> button to restart.</li>
          </ol>
          <div class="mt-4 text-sm">
            <span class="font-bold">Tips:</span> All processing is local. Key column scrolls if long. Use the same keys in all files. Supports both iOS and Android formats.
          </div>
        </div>
      </div>
      <div class="card bg-base-100 shadow-xl p-6">
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text font-semibold">Select Files</span>
          </label>
          <input type="file" multiple accept=".strings,.xml" class="file-input file-input-bordered w-full" @change="onFilesSelected" />
          <label class="label">
            <span class="label-text-alt">Select multiple .strings or .xml files</span>
          </label>
        </div>
        
        <div v-if="files.length > 0" class="mt-4">
          <div class="font-semibold mb-2">Selected Files:</div>
          <div class="bg-base-200 rounded-lg p-3">
            <ul class="list-disc list-inside space-y-1">
              <li v-for="file in files" :key="file.name" class="text-sm">
                {{ file.name }}
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="btn btn-primary" :disabled="files.length === 0" @click="step = 2">
            Start Editing
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="step === 2">
      <JsonTable :data="filesStore.stringsData" :files="filesStore.files" @back="reset" ref="jsonTable" />
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'
import JsonTable from '../components/JsonTable.vue'

interface JsonTableWithControls {
  mode: 'all' | 'paging'
  highlightMode: boolean
  search: string
  resetColumnWidths: () => void
  openExportModal: (mode: 'all' | 'changed' | 'original') => void
}

const filesStore = useFilesStore()
const files = ref<File[]>([])
const step = ref(1)
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
    totalKeys.value = newData.reduce((sum, fileData) => sum + Object.keys(fileData).length, 0)
    filteredCount.value = totalKeys.value
  },
  { immediate: true }
)

function updateTheme(event: Event) {
  const newTheme = (event.target as HTMLSelectElement).value
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
  theme.value = newTheme
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
})

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  files.value = Array.from(input.files)
  filesStore.setFiles(files.value)
  // Parse .strings files
  const readers = files.value.map(
    (file) =>
      new Promise<Record<string, string>>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            resolve(parseStrings(reader.result as string))
          } catch {
            resolve({})
          }
        }
        reader.readAsText(file)
      })
  )
  Promise.all(readers).then((parsed) => {
    filesStore.setStringsData(parsed)
  })
}

function reset() {
  files.value = []
  filesStore.setFiles([])
  step.value = 1
}

function resetColumnWidths() {
  if (jsonTable.value) {
    jsonTable.value.resetColumnWidths()
  }
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<style scoped>
.container {
  max-width: 900px;
}
.how-to-use-block {
  text-align: left;
}
</style>
