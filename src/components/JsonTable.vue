<template>
  <div>
    <div class="toolbar-search-top">
      <input v-model="search" class="input input-bordered input-xs" placeholder="Search key or value..." />
      <span class="toolbar-desc toolbar-desc-inline"> Search by key or value</span>
    </div>
    <div class="toolbar" style="align-items: flex-start;">
      <div class="toolbar-group">
        <span class="toolbar-label">View:</span>
        <div>
            <label class="toolbar-radio" title="Show all keys in a single table (See All)"><input type="radio" v-model="mode" value="all" /> See All</label>
            <span class="toolbar-desc toolbar-desc-inline"> Show all keys in one page</span>
            <label class="toolbar-radio" title="Group keys by prefix (Paging)"><input type="radio" v-model="mode" value="paging" /> Paging</label>
            <span class="toolbar-desc toolbar-desc-inline"> Page keys by prefix (e.g. common_, home_)</span>
        </div>
        <label class="toolbar-checkbox" title="Highlight rows that are edited, duplicate, or identical in all languages"><input type="checkbox" v-model="highlightMode" /> Highlight</label>
        <span class="toolbar-desc toolbar-desc-inline"> Highlight: edited (green), duplicate (yellow), or all-equal (light red)</span>
      </div>
    </div>
    <div v-if="mode === 'paging'" class="tabs-paging">
      <div class="tabs">
        <button v-for="prefix in pagePrefixes" :key="prefix" :class="['tab', { 'tab-active': selectedPage === prefix }]" @click="selectedPage = prefix">
          {{ prefix }}
        </button>
      </div>
    </div>
    <table class="table w-full">
      <thead>
        <tr>
          <!-- Fixed key column -->
          <th class="sticky left-0 z-10 bg-base-100" :style="{ width: columnWidths['key'] || '200px' }">
            <div class="flex items-center gap-2">
              <span>Key</span>
              <div class="resizer" @mousedown="startResizing($event, 'key')"></div>
            </div>
          </th>
          <!-- Fixed paste column -->
          <th class="sticky" :style="{ left: `${keyColumnWidth}px` }" style="width: 80px;">
            <div class="flex items-center gap-2">
              <span>Paste</span>
            </div>
          </th>
          <!-- Draggable language columns -->
          <th v-for="(file, index) in orderedFiles" 
              :key="file.name"
              :draggable="true"
              class="relative"
              :style="{ width: columnWidths[file.name] || '200px' }"
              @dragstart="startDrag($event, index)"
              @dragover.prevent
              @dragenter.prevent
              @drop="onDrop($event, index)">
            <div class="flex items-center gap-2">
              <span>{{ file.name }}</span>
              <div class="resizer" @mousedown="startResizing($event, file.name)"></div>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="key in filteredKeys" :key="key">
          <tr :class="rowClass(key)">
            <td class="sticky left-0 z-10 bg-base-100" :style="{ width: columnWidths['key'] || '200px' }">{{ key }}</td>
            <td class="sticky z-10 bg-base-100" :style="{ left: `${keyColumnWidth}px`, width: '80px' }">
              <button class="btn btn-xs btn-outline" @click="onPaste(key)">Paste</button>
            </td>
            <td v-for="(file, idx) in orderedFiles" :key="file.name">
              <input v-model="props.data[columnOrder.value?.[idx] ?? idx][key]" class="input input-bordered w-full" :placeholder="'—'" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
    
    <!-- Export Modal -->
    <dialog id="export_modal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Export Settings</h3>
        <!-- Platform Selection -->
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text">Platform Format</span>
          </label>
          <select v-model="exportPlatform" class="select select-bordered w-full">
            <option value="ios">iOS (.strings)</option>
            <option value="android">Android (strings.xml)</option>
          </select>
        </div>
        <div class="modal-action">
          <button class="btn" @click="closeExportModal">Cancel</button>
          <button class="btn btn-primary" @click="downloadFiles">Export</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <!-- Fixed Export Buttons -->
    <div class="fixed bottom-4 right-4 flex flex-col gap-2">
      <button class="btn btn-primary" title="Export all files" @click="openExportModal('all')">
        Export All
      </button>
      <button class="btn btn-accent" title="Export only changed values" @click="openExportModal('changed')">
        Export Changed
      </button>
      <button class="btn" title="Export keeping original order" @click="openExportModal('original')">
        Keep Order
      </button>
      <button class="btn btn-ghost" title="Go back to file selection" @click="emit('back')">
        Back
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted, onBeforeUnmount } from 'vue'

const emit = defineEmits<{
  (e: 'back'): void
}>()

const props = defineProps<{
  data: Record<string, string>[]
  files: File[]
}>()

const mode = ref<'all' | 'paging'>('all')
const selectedPage = ref('')
const highlightMode = ref(false)
const search = ref('')

const allKeys = computed(() => {
  const keySet = new Set<string>()
  props.data.forEach(obj => Object.keys(obj).forEach(k => keySet.add(k)))
  return Array.from(keySet)
})

const pagePrefixes = computed(() => {
  const prefixes = new Set<string>()
  allKeys.value.forEach(key => {
    const prefix = key.split('_')[0]
    prefixes.add(prefix)
  })
  return Array.from(prefixes)
})

const visibleKeys = computed(() => {
  if (mode.value === 'all') return allKeys.value
  if (!selectedPage.value) return []
  return allKeys.value.filter(key => key.startsWith(selectedPage.value + '_'))
})

const filteredKeys = computed(() => {
  if (!search.value.trim()) return visibleKeys.value
  const q = search.value.trim().toLowerCase()
  return visibleKeys.value.filter(key => {
    if (key.toLowerCase().includes(q)) return true
    for (const obj of props.data) {
      if ((obj[key] ?? '').toLowerCase().includes(q)) return true
    }
    return false
  })
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
    for (let i = 0; i < props.files.length; i++) {
      if (values[i] !== undefined) {
        props.data[i][key] = values[i].trim();
      }
    }
  } catch (e) {
    alert('Unable to read clipboard.');
  }
}

// Export functionality
const exportPlatform = ref<'ios' | 'android'>('ios')
const exportMode = ref<'all' | 'changed' | 'original'>('all')

function openExportModal(mode: 'all' | 'changed' | 'original') {
  exportMode.value = mode
  const modal = document.getElementById('export_modal') as HTMLDialogElement
  modal.showModal()
}

function closeExportModal() {
  const modal = document.getElementById('export_modal') as HTMLDialogElement
  modal.close()
}

function downloadFiles() {
  closeExportModal()
  
  props.files.forEach((file, idx) => {
    let finalData: Record<string, string> = {}
    const data = props.data[idx]
    
    if (exportMode.value === 'all') {
      finalData = { ...data }
    } else if (exportMode.value === 'changed') {
      Object.keys(data).forEach(key => {
        if (data[key] !== originalData.value[idx]?.[key]) {
          finalData[key] = data[key]
        }
      })
    } else if (exportMode.value === 'original') {
      // Keep original file order by using original data as base
      finalData = { ...originalData.value[idx], ...data }
    }

    const fileName = file.name
    const fileContent = exportPlatform.value === 'ios' 
      ? toStringsFile(finalData)
      : toAndroidStringsFile(finalData)
    
    const blob = new Blob([fileContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportPlatform.value === 'ios' 
      ? fileName 
      : fileName.replace('.strings', '.xml')
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

function toStringsFile(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `"${key}" = "${value.replace(/"/g, '\\"')}";`)
    .join('\n')
}

function toAndroidStringsFile(data: Record<string, string>): string {
  const xmlContent = Object.entries(data)
    .map(([key, value]) => `    <string name="${key}">${value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '\\"')}</string>`)
    .join('\n')
  return `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n${xmlContent}\n</resources>`
}

// Column ordering
const columnOrder = ref<number[]>([])
const orderedFiles = computed(() => {
  if (columnOrder.value.length === 0) return props.files
  return columnOrder.value.map(index => props.files[index])
})

// Key column width computation
const keyColumnWidth = computed(() => {
  const width = columnWidths.value['key']
  if (!width) return 200
  return parseInt(width)
})

// Initialize column order
onMounted(() => {
  initializeColumns()
})

// Watch for files changes
watch(() => props.files, () => {
  initializeColumns()
}, { immediate: true })

function initializeColumns() {
  columnOrder.value = props.files.map((_, index) => index)
  // Load saved column widths from localStorage
  const savedWidths = localStorage.getItem('columnWidths')
  if (savedWidths) {
    columnWidths.value = JSON.parse(savedWidths)
  }
}

// Drag and drop functionality
let draggedIndex = -1

function startDrag(event: DragEvent, index: number) {
  draggedIndex = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDrop(_event: DragEvent, index: number) {
  if (draggedIndex === -1) return
  
  // Reorder columns
  const newOrder = [...columnOrder.value]
  const [removed] = newOrder.splice(draggedIndex, 1)
  newOrder.splice(index, 0, removed)
  columnOrder.value = newOrder
  
  draggedIndex = -1
}

// Column resizing
const columnWidths = ref<Record<string, string>>({})
let isResizing = false
let currentResizer: string | null = null
let startX = 0
let startWidth = 0

function startResizing(event: MouseEvent, columnKey: string) {
  isResizing = true
  currentResizer = columnKey
  startX = event.pageX
  
  const target = event.target as HTMLElement
  const column = target.closest('th')
  if (column) {
    startWidth = column.offsetWidth
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResizing)
}

function handleMouseMove(event: MouseEvent) {
  if (!isResizing || !currentResizer) return
  
  const diff = event.pageX - startX
  const newWidth = Math.max(100, startWidth + diff) // Minimum width of 100px
  columnWidths.value[currentResizer] = `${newWidth}px`
  
  // Save column widths to localStorage
  localStorage.setItem('columnWidths', JSON.stringify(columnWidths.value))
}

function stopResizing() {
  isResizing = false
  currentResizer = null
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResizing)
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResizing)
})

// Column width reset functionality
function resetColumnWidths() {
  columnWidths.value = {}
  localStorage.removeItem('columnWidths')
}

defineExpose({
  resetColumnWidths
})
</script>

<style scoped>
.table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 0.5rem; }
.input-bordered { width: 100%; }
td:first-of-type, th:first-of-type {
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
.toolbar, .toolbar-label, .toolbar-radio, .toolbar-checkbox {
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
.toolbar-radio, .toolbar-checkbox {
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
  justify-content: flex-start;
}
.tabs {
  display: flex;
  gap: 0.5rem;
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
.row-edited { background: #e6ffe6 !important; color: #222 !important; }
.row-all-equal { background: #ffeaea !important; color: #222 !important; }
.row-duplicate { background: #fff3cd !important; color: #222 !important; }
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
.bottom-4 {
  bottom: 1rem;
}
.right-4 {
  right: 1rem;
}
.fixed {
  position: fixed;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.gap-2 {
  gap: 0.5rem;
}

/* Column resizing */
.resizer {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background: rgba(0, 0, 0, 0.1);
  cursor: col-resize;
  user-select: none;
  touch-action: none;
}

.resizer:hover,
.resizing {
  background: rgba(0, 0, 0, 0.2);
}

/* Draggable columns */
th[draggable=true] {
  cursor: move;
}

th[draggable=true]:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* Sticky columns */
.sticky {
  position: sticky;
  z-index: 10;
  background: inherit;
}

.left-0 {
  left: 0;
}

/* Table layout */
.table {
  table-layout: fixed;
}

td, th {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Make sure inputs don't overflow */
.input {
  max-width: 100%;
  box-sizing: border-box;
}
</style>
