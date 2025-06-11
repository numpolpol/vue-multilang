<template>
  <div>
    <div class="toolbar-search-top">
      <input v-model="search" class="input input-bordered input-xs" placeholder="Search key or value..." />
      <span class="toolbar-desc toolbar-desc-inline"> Search by key or value</span>
      <span style="margin-left:1.5em;">
        <label style="font-size:0.97em;">Ignore first
          <input type="number" min="0" :max="files.length-1" v-model.number="ignorePasteCount" style="width:3em; margin:0 0.3em;" />
          cell(s) when Paste
        </label>
      </span>
    </div>
    <div class="toolbar" style="align-items: flex-start;">
      <div class="toolbar-group">
        <span class="toolbar-label">Platform:</span>
        <label class="toolbar-radio" title="iOS .strings format"><input type="radio" v-model="platform" value="ios" /> iOS</label>
        <label class="toolbar-radio" title="Android string.xml format"><input type="radio" v-model="platform" value="android" /> Android</label>
      </div>
      <div class="toolbar-group">
        <span class="toolbar-label">View:</span>
        <div>
          <label class="toolbar-radio" title="Show all keys in a single table (See All)"><input type="radio"
              v-model="mode" value="all" /> See All</label>
          <span class="toolbar-desc toolbar-desc-inline"> Show all keys in one page</span>
          <label class="toolbar-radio" title="Group keys by prefix (Paging)"><input type="radio" v-model="mode"
              value="paging" /> Paging</label>
          <span class="toolbar-desc toolbar-desc-inline"> Page keys by prefix (e.g. common_, home_)</span>
        </div>
      </div>
      <div class="toolbar-group">
                <label class="toolbar-checkbox"
          title="Highlight rows that are edited, duplicate, or identical in all languages"><input type="checkbox"
            v-model="highlightMode" /> Highlight</label>
        <span class="toolbar-desc toolbar-desc-inline" style="align-self: flex-start; margin-top: 0;">
          <div class="highlight-legend" style="text-align: left;">
            <span class="legend-icon legend-edited"></span> <span>Edited - This row has been changed from the original value.</span><br />
            <span class="legend-icon legend-duplicate"></span> <span>Duplicate - This row has duplicate values across languages.</span><br />
            <span class="legend-icon legend-all-equal"></span> <span>All-equal - All values in this row are identical.</span>
          </div>
        </span>
      </div>
    </div>
    <div v-if="mode === 'paging'" class="tabs-paging">
      <div class="tabs">
        <button v-for="prefix in pagePrefixes" :key="prefix" :class="['tab', { 'tab-active': selectedPage === prefix }]"
          @click="selectedPage = prefix">
          {{ prefix }}
        </button>
      </div>
    </div>
    <div class="table-info-summary">
      <span>Total: {{ infoSummary.total }}</span>
      <span>Updated: {{ infoSummary.updated }}</span>
      <span>Untranslated: {{ infoSummary.untranslated }}</span>
    </div>
    <form class="add-key-form" @submit.prevent="onAddKey">
      <input v-model="newKey" class="input input-xs mr-2" placeholder="New key" required />
      <input v-for="(file, idx) in files" :key="file.name" v-model="newValues[idx]" class="input input-xs mr-2" :placeholder="file.name + ' value'" />
      <button class="btn btn-xs btn-success" type="submit">Add</button>
    </form>
    <div class="table-scroll-wrapper">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="key-col">
              Key
              <button class="sort-btn" @click="toggleKeySort" :title="keySortDesc ? 'Sort A-Z' : 'Sort Z-A'">
                <span v-if="keySortDesc">↓</span>
                <span v-else>↑</span>
              </button>
            </th>
            <th>Paste</th>
            <th v-for="(fileIdx, colIdx) in columnOrder" :key="files[fileIdx].name" draggable="true"
              @dragstart="onDragStart($event, colIdx)" @dragover="onDragOver" @drop="onDrop($event, colIdx)"
              style="cursor: grab; user-select: none;">
              {{ files[fileIdx].name }}
              <span style="font-size:0.9em;opacity:0.5;">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-for="key in filteredKeys" :key="key">
            <tr :class="rowClass(key)">
              <td class="key-col"><span>{{ key }}</span></td>
              <td>
                <button class="btn btn-xs btn-outline" @click="onPaste(key)">Paste</button>
              </td>
              <td v-for="fileIdx in columnOrder" :key="files[fileIdx].name">
                <input v-model="data[fileIdx][key]" class="input input-bordered w-full" :placeholder="'—'" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div class="floating-actions">
      <button class="floating-btn" @click="onExportAll" title="Export all .strings files">
        <span>⭳</span>
        <span class="floating-btn-label">Export All</span>
      </button>
      <button class="floating-btn" @click="onExportChanged" title="Export only changed keys">
        <span>📝</span>
        <span class="floating-btn-label">Export Changed</span>
      </button>
      <button class="floating-btn" @click="onExportKeepOrder" title="Export (keep order, only changed values)">
        <span>📦</span>
        <span class="floating-btn-label">Export Keep Order</span>
      </button>
      <button class="floating-btn" @click="confirmRestartImport" title="Back">
        <span>←</span>
        <span class="floating-btn-label">Back</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const props = defineProps<{
  data: Record<string, string>[]
  files: File[]
}>()

const mode = ref<'all' | 'paging'>('all')
const selectedPage = ref('')
const highlightMode = ref(false)
const search = ref('')
const platform = ref<'ios' | 'android'>('ios')
const ignorePasteCount = ref(0)

// Track column order (file indices)
const columnOrder = ref(props.files.map((_, idx) => idx))

function onDragStart(e: DragEvent, idx: number) {
  e.dataTransfer?.setData('col-idx', idx.toString())
}
function onDrop(e: DragEvent, idx: number) {
  const fromIdx = Number(e.dataTransfer?.getData('col-idx'))
  if (isNaN(fromIdx) || fromIdx === idx) return
  const newOrder = [...columnOrder.value]
  const [moved] = newOrder.splice(fromIdx, 1)
  newOrder.splice(idx, 0, moved)
  columnOrder.value = newOrder
}
function onDragOver(e: DragEvent) {
  e.preventDefault()
}

const allKeys = computed(() => {
  const keySet = new Set<string>()
  props.data.forEach(obj => Object.keys(obj).forEach(k => keySet.add(k)))
  return Array.from(keySet)
})

const pagePrefixes = computed(() => {
  // Map prefix to count of keys
  const prefixCount: Record<string, number> = {}
  allKeys.value.forEach(key => {
    const prefix = key.split('_')[0]
    prefixCount[prefix] = (prefixCount[prefix] || 0) + 1
  })
  // Only include prefixes with more than 1 key
  const multiKeyPrefixes = Object.keys(prefixCount).filter(p => prefixCount[p] > 1)
  // If only 1 key in all, use 'a-z'
  if (allKeys.value.length === 1) return ['a-z']
  // Always include 'a-z' if there are any single-key prefixes
  if (Object.values(prefixCount).some(count => count === 1)) {
    return [...multiKeyPrefixes, 'a-z']
  }
  return multiKeyPrefixes
})

const visibleKeys = computed(() => {
  if (mode.value === 'all') return allKeys.value
  if (!selectedPage.value) return []
  // If only 1 key, show it in 'a-z' page
  if (allKeys.value.length === 1 && selectedPage.value === 'a-z') {
    return allKeys.value
  }
  // Find all keys for selectedPage, or all single-key prefixes for 'a-z'
  const prefixCount: Record<string, number> = {}
  allKeys.value.forEach(key => {
    const prefix = key.split('_')[0]
    prefixCount[prefix] = (prefixCount[prefix] || 0) + 1
  })
  if (selectedPage.value === 'a-z') {
    // Show all keys whose prefix has only 1 key
    return allKeys.value.filter(key => prefixCount[key.split('_')[0]] === 1)
  }
  return allKeys.value.filter(key => key.startsWith(selectedPage.value + '_'))
})

const keySortDesc = ref(false)
function toggleKeySort() {
  keySortDesc.value = !keySortDesc.value
}

const filteredKeys = computed(() => {
  let keys = visibleKeys.value
  if (!search.value.trim()) {
    keys = [...keys]
  } else {
    const q = search.value.trim().toLowerCase()
    keys = keys.filter(key => {
      if (key.toLowerCase().includes(q)) return true
      for (const obj of props.data) {
        if ((obj[key] ?? '').toLowerCase().includes(q)) return true
      }
      return false
    })
  }
  keys.sort((a, b) => keySortDesc.value ? b.localeCompare(a) : a.localeCompare(b))
  return keys
})

// Info summary for table
const infoSummary = computed(() => {
  const total = filteredKeys.value.length
  let updated = 0
  let untranslated = 0
  for (const key of filteredKeys.value) {
    let isUpdated = false
    let isUntranslated = false
    for (let i = 0; i < props.data.length; i++) {
      const val = props.data[i][key] ?? ''
      const orig = originalData.value[i]?.[key] ?? ''
      if (val !== orig) isUpdated = true
      // Consider untranslated if value is empty or equals the English (first file) value
      if (!val || (i > 0 && val === props.data[0][key])) isUntranslated = true
    }
    if (isUpdated) updated++
    if (isUntranslated) untranslated++
  }
  return { total, updated, untranslated }
})

// Track original values for highlight
const originalData = ref(props.data.map(obj => ({ ...obj })))
watch(() => props.data, (newVal) => {
  if (originalData.value.length !== newVal.length) {
    originalData.value = newVal.map(obj => ({ ...obj }))
  }
}, { deep: true })

function isAllEqual(key: string): boolean {
  const values = props.data.map(obj => obj[key] ?? '')
  return values.length > 0 && values.every(v => v === values[0])
}

function isEdited(key: string): boolean {
  for (let i = 0; i < props.data.length; i++) {
    if ((props.data[i][key] ?? '') !== (originalData.value[i]?.[key] ?? '')) {
      return true
    }
  }
  return false
}

function isDuplicateValue(key: string): boolean {
  const valueCount: Record<string, number> = {};
  for (const obj of props.data) {
    const val = (obj[key] ?? '').trim();
    if (!val) continue;
    valueCount[val] = (valueCount[val] || 0) + 1;
    if (valueCount[val] > 1) return true;
  }
  return false;
}

function rowClass(key: string) {
  if (!highlightMode.value) return ''
  if (isEdited(key)) return 'row-edited'
  if (isDuplicateValue(key)) return 'row-duplicate'
  if (isAllEqual(key)) return 'row-all-equal'
  return ''
}

if (mode.value === 'paging' && !selectedPage.value && pagePrefixes.value.length > 0) {
  selectedPage.value = pagePrefixes.value[0]
}

async function onPaste(key: string) {
  try {
    const text = await navigator.clipboard.readText();
    let values = text.split('\t');
    if (values.length < props.files.length) {
      values = text.split(/\r?\n/);
    }
    // Ignore the first N values from clipboard
    if (ignorePasteCount.value > 0 && values.length > ignorePasteCount.value) {
      values = values.slice(ignorePasteCount.value);
    }
    for (let i = 0; i < props.files.length; i++) {
      if (values[i] !== undefined) {
        props.data[i][key] = values[i].trim();
      }
    }
  } catch (e) {
    alert('Unable to read clipboard.');
  }
}

const newKey = ref('')
const newValues = ref<string[]>([])
watch(() => props.files, () => { newValues.value = Array(props.files.length).fill('') }, { immediate: true })

function onAddKey() {
  if (!newKey.value.trim()) return
  for (let i = 0; i < props.files.length; i++) {
    props.data[i][newKey.value] = newValues.value[i] || ''
  }
  newKey.value = ''
  newValues.value = Array(props.files.length).fill('')
}

function escapeXml(str: string) {
  return str.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] || c))
}

function onExportAll() {
  for (let i = 0; i < props.files.length; i++) {
    const file = props.files[i]
    const data = props.data[i]
    let content = ''
    if (platform.value === 'ios') {
      for (const key of Object.keys(data)) {
        if (key && data[key] !== undefined) {
          content += `"${key}" = "${(data[key] ?? '').replace(/"/g, '\"')}";\n`
        }
      }
    } else {
      content = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
      for (const key of Object.keys(data)) {
        if (key && data[key] !== undefined) {
          content += `  <string name="${escapeXml(key)}">${escapeXml(data[key] ?? '')}</string>\n`
        }
      }
      content += '</resources>\n'
    }
    const blob = new Blob([content], { type: 'text/plain' })
    const ext = platform.value === 'ios' ? '.strings' : '.xml'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (file.name.replace(/\.(strings|xml)$/,'') || `export_${i + 1}`) + ext
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    }, 100)
  }
}

function onExportChanged() {
  for (let i = 0; i < props.files.length; i++) {
    const file = props.files[i]
    const data = props.data[i]
    let content = ''
    if (platform.value === 'ios') {
      for (const key of Object.keys(data)) {
        if (key && data[key] !== undefined && data[key] !== (originalData.value[i]?.[key] ?? '')) {
          content += `"${key}" = "${(data[key] ?? '').replace(/"/g, '\"')}";\n`
        }
      }
      if (!content) continue
    } else {
      let changed = false
      content = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
      for (const key of Object.keys(data)) {
        if (key && data[key] !== undefined && data[key] !== (originalData.value[i]?.[key] ?? '')) {
          content += `  <string name="${escapeXml(key)}">${escapeXml(data[key] ?? '')}</string>\n`
          changed = true
        }
      }
      content += '</resources>\n'
      if (!changed) continue
    }
    const blob = new Blob([content], { type: 'text/plain' })
    const ext = platform.value === 'ios' ? '_changed.strings' : '_changed.xml'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = file.name.replace(/\.(strings|xml)$/,'') + ext
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    }, 100)
  }
}

function onExportKeepOrder() {
  for (let i = 0; i < props.files.length; i++) {
    const file = props.files[i]
    const data = props.data[i]
    const orig = originalData.value[i] || {}
    if (platform.value === 'ios') {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        const lines = (fileReader.result as string).split(/\r?\n/)
        let content = ''
        for (const line of lines) {
          const match = line.match(/^\s*"([^"]+)"\s*=\s*"([\s\S]*?)";/)
          if (match) {
            const key = match[1]
            if (data[key] !== undefined && data[key] !== orig[key]) {
              content += `"${key}" = "${(data[key] ?? '').replace(/"/g, '\"')}";\n`
            } else {
              content += line + '\n'
            }
          } else {
            content += line + '\n'
          }
        }
        const blob = new Blob([content], { type: 'text/plain' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name.replace(/\.strings$/, '') + '_keeporder.strings'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(a.href)
        }, 100)
      }
      fileReader.readAsText(file)
    } else {
      // For Android, just export changed keys in order of appearance in the file
      const fileReader = new FileReader()
      fileReader.onload = () => {
        const lines = (fileReader.result as string).split(/\r?\n/)
        let content = '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
        for (const line of lines) {
          const match = line.match(/<string name=\"([^\"]+)\">([\s\S]*?)<\/string>/)
          if (match) {
            const key = match[1]
            if (data[key] !== undefined && data[key] !== orig[key]) {
              content += `  <string name="${escapeXml(key)}">${escapeXml(data[key] ?? '')}</string>\n`
            } else {
              content += line + '\n'
            }
          } else if (line.trim() && !line.trim().startsWith('<?xml') && !line.trim().startsWith('<resources')) {
            content += line + '\n'
          }
        }
        content += '</resources>\n'
        const blob = new Blob([content], { type: 'text/plain' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.name.replace(/\.xml$/, '') + '_keeporder.xml'
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(a.href)
        }, 100)
      }
      fileReader.readAsText(file)
    }
  }
}

function confirmRestartImport() {
  if (window.confirm('Are you sure you want to restart and import new files? All unsaved changes will be lost.')) {
    window.location.reload()
  }
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ccc;
  padding: 0.5rem;
}

.input-bordered {
  width: 100%;
}

td:first-of-type,
th:first-of-type {
  text-align: left;
}

td:nth-of-type(1) {
  text-align: left;
}

td:nth-of-type(2) {
  text-align: left;
}

.toolbar-search-top {
  margin-bottom: 1rem;
  display: flex;
  justify-content: flex-start;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 1px 4px 0 #0001;
}

.toolbar,
.toolbar-label,
.toolbar-radio,
.toolbar-checkbox {
  color: #111;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toolbar-label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #444;
}

.toolbar-radio,
.toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.97em;
  background: #fff;
  border-radius: 0.5rem;
  padding: 0.15rem 0.7rem;
  border: 1px solid #e0e0e0;
}

.toolbar-checkbox {
  margin-left: 0.5rem;
}

.tabs-paging {
  margin-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-width: 100%;
}

.tab {
  padding: 0.25rem 1.1rem;
  border: 1px solid #ccc;
  border-bottom: none;
  background: #f9f9f9;
  cursor: pointer;
  border-radius: 0.5rem 0.5rem 0 0;
  color: #222;
  font-size: 0.98em;
  transition: background 0.15s, color 0.15s;
}

.tab-active {
  background: #fff;
  font-weight: bold;
  border-bottom: 2px solid #fff;
  color: #222;
  box-shadow: 0 2px 8px 0 #0001;
}

.row-edited {
  background: #e6ffe6 !important;
  color: #222 !important;
}

.row-all-equal {
  background: #ffeaea !important;
  color: #222 !important;
}

.row-duplicate {
  background: #fff3cd !important;
  color: #222 !important;
}

.toolbar-descs {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 0.25rem;
  margin-left: 0.5rem;
  font-size: 0.97em;
  color: #666;
}

.toolbar-desc {
  background: #f3f3f3;
  border-radius: 0.5rem;
  padding: 0.15rem 0.7rem;
}

.toolbar-desc-inline {
  display: inline-block;
  margin-left: 0.5em;
  font-size: 0.95em;
  color: #888;
  background: none;
  padding: 0;
}

.toolbar-radio-group {
  display: inline-flex;
  gap: 0.5rem;
}

.table-info-summary {
  margin-bottom: 0.5rem;
  font-size: 1em;
  color: #444;
  display: flex;
  gap: 2rem;
  align-items: center;
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

.floating-actions {
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  z-index: 100;
}

.floating-btn {
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  background: #1976d2;
  color: #fff;
  border: none;
  box-shadow: 0 2px 8px #0002;
  font-size: 1.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
  flex-direction: column;
}

.floating-btn-label {
  font-size: 0.85rem;
  color: #fff;
  background: rgba(25, 118, 210, 0.92);
  border-radius: 0.5rem;
  padding: 0.1rem 0.7rem;
  margin-top: 0.2rem;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
}

.floating-btn:hover {
  background: #125ea7;
}

.table-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  max-width: 100%;
}

.table-scroll-wrapper .table {
  min-width: 700px;
}

th.key-col,
td.key-col {
  max-width: 220px;
  min-width: 120px;
  width: 18vw;
  white-space: nowrap;
  overflow-x: auto;
  text-overflow: unset;
  padding-right: 0.5rem;
}

/* Make the key cell content scrollable horizontally and always show full key on scroll */
td.key-col {
  position: relative;
  max-width: 220px;
  min-width: 120px;
  width: 18vw;
  white-space: nowrap;
  overflow-x: auto;
  text-overflow: unset;
  padding-right: 0.5rem;
}

td.key-col::-webkit-scrollbar {
  height: 6px;
}

td.key-col>span {
  display: inline-block;
  min-width: 100%;
}

.add-key-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sort-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1em;
  margin-left: 0.3em;
  color: #1976d2;
  vertical-align: middle;
  padding: 0 0.1em;
}

.sort-btn:focus {
  outline: 1.5px solid #1976d2;
}
</style>
