<template>
  <div class="drawer lg:drawer-open h-screen">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <!-- Drawer side -->
    <div class="drawer-side z-40">
      <label for="drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="menu p-4 w-80 min-h-full bg-base-200">
        <!-- Theme & Controls -->
        <div class="space-y-4">
          <!-- App Title -->
          <div class="text-xl font-bold">iOS/Android Editor</div>

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

          <!-- View Controls -->
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
          <button class="btn btn-ghost btn-sm btn-block" @click="goBack">
            Back to Upload
          </button>
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
          <h1 class="text-2xl font-bold ml-2">iOS/Android Multi-file Editor</h1>
        </div>
      </div>

      <div class="p-4">
        <JsonTable :data="filesStore.stringsData" :files="filesStore.files" @back="goBack" ref="jsonTable" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import JsonTable from '../components/JsonTable.vue'

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

// Navigation guard - redirect to upload if no files
onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  if (!filesStore.files.length) {
    router.push('/')
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
</script>
