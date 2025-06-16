<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="navbar bg-base-100 shadow-lg rounded-box mb-6">
      <div class="navbar-start">
        <h1 class="text-2xl font-bold">iOS/Android Multi-file Editor</h1>
      </div>
    </div>
    <div v-if="step === 1">
      <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-900">
        <b>How to use:</b><br />
        1. Click <b>Choose Files</b> to select multiple .strings files (e.g. en.strings, th.strings)<br />
        2. Click <b>Ready</b> to view and edit all keys/values side-by-side<br />
        3. Edit values directly, or use <b>Paste</b> to fill multiple languages at once<br />
        4. Export all files when done<br />
        <span class="text-red-600">* If any file is not a valid .strings format, you will be notified and it will not be imported.</span>
      </div>
      <input type="file" multiple accept=".strings" @change="onFilesSelected" />
      <div class="mt-4">
        <button class="btn btn-primary" :disabled="files.length === 0" @click="step = 2">
          Ready
        </button>
      </div>
    </div>
    <div v-else-if="step === 2">
      <JsonTable :data="filesStore.stringsData" :files="filesStore.files" />
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
