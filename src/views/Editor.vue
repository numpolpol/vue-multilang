<![CDATA[<template>]]>
  &lt;div class="drawer lg:drawer-open h-screen"&gt;
    &lt;input id="drawer" type="checkbox" class="drawer-toggle" v-model="isDrawerOpen" /&gt;
    
    &lt;!-- Drawer side --&gt;
    &lt;div class="drawer-side z-40"&gt;
      &lt;label for="drawer" aria-label="close sidebar" class="drawer-overlay"&gt;&lt;/label&gt;
      &lt;div class="menu p-4 w-80 min-h-full bg-base-200"&gt;
        &lt;!-- Theme & Controls --&gt;
        &lt;div class="space-y-4"&gt;
          &lt;!-- App Title --&gt;
          &lt;div class="text-xl font-bold"&gt;iOS/Android Editor&lt;/div&gt;

          &lt;!-- Theme --&gt;
          &lt;div class="form-control w-full"&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text font-semibold"&gt;Theme&lt;/span&gt;
            &lt;/label&gt;
            &lt;select v-model="theme" class="select select-bordered w-full" @change="updateTheme"&gt;
              &lt;option value="light"&gt;Light&lt;/option&gt;
              &lt;option value="dark"&gt;Dark&lt;/option&gt;
              &lt;option value="forest"&gt;Forest&lt;/option&gt;
              &lt;option value="zimablue"&gt;Zima Blue&lt;/option&gt;
            &lt;/select&gt;
          &lt;/div&gt;

          &lt;!-- View Controls --&gt;
          &lt;div class="divider"&gt;View Controls&lt;/div&gt;
          
          &lt;!-- View Mode --&gt;
          &lt;div class="form-control"&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text font-semibold"&gt;Display Mode&lt;/span&gt;
            &lt;/label&gt;
            &lt;div class="flex flex-col gap-2"&gt;
              &lt;label class="label cursor-pointer justify-start gap-2"&gt;
                &lt;input type="radio" class="radio radio-sm" :value="'all'" v-model="viewMode" /&gt;
                &lt;span class="label-text"&gt;See All Keys&lt;/span&gt;
              &lt;/label&gt;
              &lt;label class="label cursor-pointer justify-start gap-2"&gt;
                &lt;input type="radio" class="radio radio-sm" :value="'paging'" v-model="viewMode" /&gt;
                &lt;span class="label-text"&gt;Group by Prefix&lt;/span&gt;
              &lt;/label&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;!-- Highlight Mode --&gt;
          &lt;div class="form-control"&gt;
            &lt;label class="label cursor-pointer justify-start gap-2"&gt;
              &lt;input type="checkbox" class="toggle toggle-sm" v-model="highlightMode" /&gt;
              &lt;span class="label-text"&gt;Highlight Changes&lt;/span&gt;
            &lt;/label&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text-alt"&gt;Highlight edited, duplicate, or identical values&lt;/span&gt;
            &lt;/label&gt;
          &lt;/div&gt;

          &lt;!-- Table Controls --&gt;
          &lt;div class="divider"&gt;Table Controls&lt;/div&gt;
          
          &lt;!-- Column Reset --&gt;
          &lt;button class="btn btn-sm btn-block" @click="resetColumnWidths"&gt;
            &lt;svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"&gt;
              &lt;path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /&gt;
            &lt;/svg&gt;
            Reset Column Widths
          &lt;/button&gt;

          &lt;!-- Search --&gt;
          &lt;div class="form-control"&gt;
            &lt;label class="label"&gt;
              &lt;span class="label-text font-semibold"&gt;Search&lt;/span&gt;
              &lt;span class="label-text-alt"&gt;{{ filteredCount }} / {{ totalKeys }} keys&lt;/span&gt;
            &lt;/label&gt;
            &lt;div class="join w-full"&gt;
              &lt;input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search keys or values..." 
                class="input input-bordered input-sm join-item w-full" 
                :class="{ 'input-error': noResults }"
              /&gt;
              &lt;button 
                class="btn btn-sm join-item" 
                :class="{ 'btn-error': noResults }"
                @click="clearSearch"
                v-if="searchQuery"
              &gt;
                &lt;svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"&gt;
                  &lt;path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /&gt;
                &lt;/svg&gt;
              &lt;/button&gt;
            &lt;/div&gt;
            &lt;label class="label" v-if="noResults"&gt;
              &lt;span class="label-text-alt text-error"&gt;No keys found&lt;/span&gt;
            &lt;/label&gt;
          &lt;/div&gt;

          &lt;!-- Export Options --&gt;
          &lt;div class="divider"&gt;Export Options&lt;/div&gt;
          &lt;div class="flex flex-col gap-2"&gt;
            &lt;button class="btn btn-primary btn-sm btn-block" @click="jsonTable?.openExportModal('all')"&gt;
              Export All
            &lt;/button&gt;
            &lt;button class="btn btn-accent btn-sm btn-block" @click="jsonTable?.openExportModal('changed')"&gt;
              Export Changed
            &lt;/button&gt;
            &lt;button class="btn btn-sm btn-block" @click="jsonTable?.openExportModal('original')"&gt;
              Keep Order
            &lt;/button&gt;
          &lt;/div&gt;

          &lt;!-- Back Button --&gt;
          &lt;div class="divider"&gt;&lt;/div&gt;
          &lt;button class="btn btn-ghost btn-sm btn-block" @click="goBack"&gt;
            Back to Upload
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
    
    &lt;!-- Page content --&gt;
    &lt;div class="drawer-content"&gt;
      &lt;!-- Navbar --&gt;
      &lt;div class="navbar bg-base-100 shadow-lg rounded-box mb-6"&gt;
        &lt;div class="navbar-start"&gt;
          &lt;label for="drawer" class="btn btn-square btn-ghost drawer-button lg:hidden"&gt;
            &lt;svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"&gt;
              &lt;path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"&gt;&lt;/path&gt;
            &lt;/svg&gt;
          &lt;/label&gt;
          &lt;h1 class="text-2xl font-bold ml-2"&gt;iOS/Android Multi-file Editor&lt;/h1&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div class="p-4"&gt;
        &lt;JsonTable :data="filesStore.stringsData" :files="filesStore.files" @back="goBack" ref="jsonTable" /&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script lang="ts" setup&gt;
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
const jsonTable = ref&lt;JsonTableWithControls | null&gt;(null)

// View controls
const viewMode = ref&lt;'all' | 'paging'&gt;('all')
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
  () =&gt; filesStore.stringsData,
  (newData) =&gt; {
    totalKeys.value = newData.reduce((sum, fileData) =&gt; sum + Object.keys(fileData).length, 0)
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

function clearSearch() {
  searchQuery.value = ''
}

function goBack() {
  filesStore.setFiles([])
  router.push('/')
}

function resetColumnWidths() {
  if (jsonTable.value) {
    jsonTable.value.resetColumnWidths()
  }
}
&lt;/script&gt;
