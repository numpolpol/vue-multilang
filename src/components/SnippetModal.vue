<template>
  <dialog :id="`snippet_modal_${language.code}`" class="modal">
    <div class="modal-box max-w-4xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
      </form>
      
      <h3 class="font-bold text-xl mb-6 flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
          📄
        </div>
        Code Snippet for {{ language.name }}
        <div class="badge badge-outline">{{ language.code.toUpperCase() }}</div>
      </h3>
      
      <!-- Format Info -->
      <div class="flex justify-center mb-6">
        <div class="badge badge-primary badge-lg px-6 py-3 font-semibold">
          iOS .strings Format
        </div>
      </div>
      
      <!-- Snippet Content -->
      <div class="space-y-4">
        <!-- Header Info -->
        <div class="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <div class="font-medium">{{ snippetInfo.title }}</div>
            <div class="text-sm opacity-75">{{ snippetInfo.description }}</div>
          </div>
        </div>
        
        <!-- Filter Options -->
        <div class="flex flex-wrap gap-2 mb-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Keys to include:</span>
            </label>
            <select v-model="keyFilter" class="select select-bordered select-sm">
              <option value="all">All keys ({{ totalKeys }})</option>
              <option value="filled">Only filled ({{ filledKeys }})</option>
              <option value="empty">Only empty ({{ emptyKeys }})</option>
            </select>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">Limit:</span>
            </label>
            <select v-model="keyLimit" class="select select-bordered select-sm">
              <option value={0}>All</option>
              <option value={10}>First 10</option>
              <option value={20}>First 20</option>
              <option value={50}>First 50</option>
            </select>
          </div>
        </div>
        
        <!-- Code Block -->
        <div class="relative">
          <div class="absolute right-2 top-2 z-10">
            <button 
              @click="copyToClipboard"
              :class="['btn btn-sm', copied ? 'btn-success' : 'btn-ghost']"
              :title="copied ? 'Copied!' : 'Copy to clipboard'"
            >
              <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
          
          <pre class="bg-base-300 rounded-lg p-4 text-sm overflow-x-auto max-h-96 overflow-y-auto"><code ref="codeRef" :class="codeHighlightClass">{{ snippetContent }}</code></pre>
        </div>
        
        <!-- Statistics -->
        <div class="stats stats-horizontal shadow w-full">
          <div class="stat">
            <div class="stat-title">Total Keys</div>
            <div class="stat-value text-lg">{{ filteredData.length }}</div>
            <div class="stat-desc">{{ keyFilter === 'all' ? 'All' : keyFilter === 'filled' ? 'Filled' : 'Empty' }} keys</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">File Size</div>
            <div class="stat-value text-lg">{{ formatFileSize(snippetContent.length) }}</div>
            <div class="stat-desc">Estimated size</div>
          </div>
          
          <div class="stat">
            <div class="stat-title">Format</div>
            <div class="stat-value text-lg">iOS</div>
            <div class="stat-desc">.strings</div>
          </div>
        </div>
        
        <!-- Download Button -->
        <div class="flex justify-end mt-6">
          <button 
            @click="downloadSnippet"
            class="btn btn-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 1a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            Download {{ snippetInfo.extension }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LanguageColumn } from '../stores/files'
import { useNotifications } from '../composables/useNotifications'

interface Props {
  language: LanguageColumn
  data: Record<string, string>
  allKeys: string[]
}

const props = defineProps<Props>()

const keyFilter = ref<'all' | 'filled' | 'empty'>('all')
const keyLimit = ref<number>(0)
const copied = ref(false)
const codeRef = ref<HTMLElement>()

const { success, error } = useNotifications()

// Computed properties for statistics
const totalKeys = computed(() => props.allKeys.length)
const filledKeys = computed(() => props.allKeys.filter(key => props.data[key]?.trim()).length)
const emptyKeys = computed(() => props.allKeys.filter(key => !props.data[key]?.trim()).length)

// Filter data based on selected options
const filteredData = computed(() => {
  let keys = props.allKeys
  
  // Apply key filter
  if (keyFilter.value === 'filled') {
    keys = keys.filter(key => props.data[key]?.trim())
  } else if (keyFilter.value === 'empty') {
    keys = keys.filter(key => !props.data[key]?.trim())
  }
  
  // Apply limit
  if (keyLimit.value > 0) {
    keys = keys.slice(0, keyLimit.value)
  }
  
  return keys.map(key => ({ key, value: props.data[key] || '' }))
})

// Snippet info for iOS format
const snippetInfo = computed(() => {
  return {
    title: 'iOS Localizable.strings',
    description: 'Standard iOS localization format with key-value pairs',
    extension: '.strings'
  }
})

// Code highlight class for iOS
const codeHighlightClass = computed(() => {
  return 'language-swift'
})

// Generate snippet content
const snippetContent = computed(() => {
  if (filteredData.value.length === 0) {
    return `// No ${keyFilter.value} keys found`
  }

  return generateIOSSnippet()
})

function generateIOSSnippet(): string {
  return filteredData.value
    .map(({ key, value }) => {
      const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, '\\n')
      return `"${key}" = "${escapedValue}";`
    })
    .join('\n')
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(snippetContent.value)
    copied.value = true
    success('Copied to clipboard!', `${snippetContent.value.length} characters copied`)
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy text: ', err)
    error('Copy failed', 'Unable to copy to clipboard. Please try again.')
  }
}

function downloadSnippet() {
  try {
    const content = snippetContent.value
    const filename = `${props.language.code}${snippetInfo.value.extension}`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    URL.revokeObjectURL(url)
    success('Download started!', `File: ${filename}`)
  } catch (err) {
    console.error('Download failed:', err)
    error('Download failed', 'Unable to download file. Please try again.')
  }
}

// Functions to control modal
function openModal() {
  const modal = document.getElementById(`snippet_modal_${props.language.code}`) as HTMLDialogElement
  modal.showModal()
}

function closeModal() {
  const modal = document.getElementById(`snippet_modal_${props.language.code}`) as HTMLDialogElement
  modal.close()
}

// Export functions for parent component
defineExpose({
  openModal,
  closeModal
})
</script>

<style scoped>
/* Custom scrollbar for code block */
pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: hsl(var(--b2));
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
  background: hsl(var(--b3));
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--bc) / 0.3);
}

/* Syntax highlighting for iOS .strings format */
.language-swift {
  color: hsl(var(--bc));
}
</style>
