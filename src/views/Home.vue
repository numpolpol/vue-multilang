<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
      <div class="navbar-start">
        <h1 class="text-2xl font-bold">iOS/Android Multi-file Editor</h1>
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
      <input type="file" multiple accept=".strings" @change="onFilesSelected" />
      <div class="mt-4">
        <button class="btn btn-primary" :disabled="files.length === 0" @click="step = 2">
          Ready
        </button>
      </div>
    </div>
    <div v-else-if="step === 2">
      <JsonTable :data="filesStore.stringsData" :files="filesStore.files" @back="reset" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useFilesStore } from '../stores/files'
import { parseStrings } from '../utils/strings'
import JsonTable from '../components/JsonTable.vue'

const filesStore = useFilesStore()
const files = ref<File[]>([])
const step = ref(1)

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
</script>

<style scoped>
.container {
  max-width: 900px;
}
.how-to-use-block {
  text-align: left;
}
</style>
