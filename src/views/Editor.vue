<template>
  <div class="drawer h-screen p-0 m-0 w-full max-w-none">
    <input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" />
    
    <!-- Drawer Sidebar -->
    <EditorSidebar
      :theme="theme"
      :viewMode="viewMode"
      :highlightMode="highlightMode"
      :searchQuery="searchQuery"
      :filteredCount="filteredCount"
      :totalKeys="totalKeys"
      :noResults="noResults"
      @updateTheme="updateTheme"
      @update:viewMode="viewMode = $event"
      @update:highlightMode="highlightMode = $event"
      @resetColumnWidths="resetColumnWidths"
      @update:searchQuery="searchQuery = $event"
      @clearSearch="clearSearch"
      @exportAll="jsonTable?.openExportModal('all')"
      @exportChanged="jsonTable?.openExportModal('changed')"
      @exportOriginal="jsonTable?.openExportModal('original')"
      @goBack="goBack"
    />
    
    <!-- Page content -->
    <div class="drawer-content flex flex-col h-screen p-0 m-0 w-full max-w-none">
      <!-- Navbar -->
      <EditorNavbar @toggleDrawer="toggleDrawer" />

      <div class="flex-1 overflow-hidden p-0 m-0 w-full">
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

function toggleDrawer() {
  isDrawerOpen.value = !isDrawerOpen.value
}
</script>
