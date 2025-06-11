<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">iOS/Android Multi-file Editor</h1>
    <div v-if="step === 1">
      <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-blue-900 how-to-use-block">
        <b>How to use:</b><br />
        <ol style="padding-left: 1.2em;">
          <li><b>Choose Files:</b> Select multiple iOS <b>.strings</b> or Android <b>string.xml</b> files (one per language, same keys).</li>
          <li><b>Ready:</b> Click <b>Ready</b> to load and edit all keys/values side-by-side.</li>
          <li><b>View:</b> Use <b>See All</b>/<b>Paging</b> to switch key views. Use <b>Search</b> to filter. Drag column headers to re-order languages.</li>
          <li><b>Edit:</b> Edit values directly or use <b>Paste</b> per row for quick input.</li>
          <li><b>Export:</b> Use floating buttons to export all, changed, or keep order. Export will match the file type (iOS/Android).</li>
          <li><b>Back:</b> Use the floating <b>Back</b> button to restart (confirmation required).</li>
        </ol>
        <div class="mt-2 text-sm text-blue-700">
          <b>Tips:</b> All processing is local. Key column scrolls if long. Use the same keys in all files. Supports both iOS and Android formats.
        </div>
      </div>
      <input type="file" multiple accept=".strings,.xml" @change="onFilesSelected" />
      <div class="mt-8">
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
import { parseStrings, parseXmlStrings } from '../utils/strings'
import JsonTable from '../components/JsonTable.vue'

const filesStore = useFilesStore()
const files = ref<File[]>([])
const step = ref(1)

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  files.value = Array.from(input.files)
  filesStore.setFiles(files.value)
  // Parse .strings or .xml files
  const readers = files.value.map(
    (file) =>
      new Promise<Record<string, string>>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            if (file.name.endsWith('.xml')) {
              resolve(parseXmlStrings(reader.result as string))
            } else {
              resolve(parseStrings(reader.result as string))
            }
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

</script>

<style scoped>
.container {
  max-width: 900px;
}
.how-to-use-block {
  text-align: left;
}
.highlight-legend {
  margin: 0.5em 0 0.5em 0.2em;
  font-size: 0.98em;
  line-height: 2.1em;
}
.legend-icon {
  display: inline-block;
  width: 1.2em;
  height: 1.2em;
  border-radius: 0.2em;
  margin-right: 0.6em;
  vertical-align: middle;
  border: 1px solid #bbb;
}
.legend-edited {
  background: #e6ffe6;
  border-color: #7ed957;
}
.legend-duplicate {
  background: #fff3cd;
  border-color: #ffe066;
}
.legend-all-equal {
  background: #ffeaea;
  border-color: #ff7b7b;
}
</style>
