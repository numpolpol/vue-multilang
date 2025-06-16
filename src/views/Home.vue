<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
      <div class="navbar-start">
        <h1 class="text-2xl font-bold">iOS/Android Multi-file Editor</h1>
      </div>
      <div class="navbar-end gap-2">
        <button v-if="step === 2" class="btn btn-sm" title="Reset all column widths" @click="resetColumnWidths">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Reset Widths
        </button>
        <select v-model="theme" class="select select-bordered select-sm" @change="updateTheme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="forest">Forest</option>
          <option value="zimablue">Zima Blue</option>
        </select>
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
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'
import JsonTable from '../components/JsonTable.vue'

const filesStore = useFilesStore()
const files = ref<File[]>([])
const step = ref(1)
const theme = ref(localStorage.getItem('theme') || 'light')
const jsonTable = ref<typeof JsonTable | null>(null)

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
  const table = jsonTable.value?.$refs?.jsonTable
  if (table && 'resetColumnWidths' in table) {
    (table as { resetColumnWidths: () => void }).resetColumnWidths()
  }
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
