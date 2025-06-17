<template>
  <div class="drawer h-screen">
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
            <button class="btn btn-primary" :disabled="files.length === 0" @click="startEditing">
              Start Editing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'

const router = useRouter()
const filesStore = useFilesStore()
const files = ref<File[]>([])
const theme = ref(localStorage.getItem('theme') || 'light')
const isDrawerOpen = ref(false)

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

function startEditing() {
  router.push('/editor')
}
</script>
