<template>
  <div class="space-y-4">
    <!-- Diff Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Version Comparison</h3>
        <div class="text-sm text-base-content/70">
          Comparing changes between versions
        </div>
      </div>
      <button @click="$emit('close')" class="btn btn-sm btn-ghost">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Close
      </button>
    </div>

    <!-- Version Info -->
    <div v-if="diff" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="card bg-base-200">
        <div class="card-body p-4">
          <div class="flex items-center gap-2">
            <span class="badge badge-outline">Before</span>
            <h4 class="font-semibold">{{ diff.beforeVersion.name }}</h4>
          </div>
          <div class="text-sm text-base-content/70">
            {{ formatDate(diff.beforeVersion.timestamp) }}
          </div>
          <div v-if="diff.beforeVersion.description" class="text-sm mt-2">
            {{ diff.beforeVersion.description }}
          </div>
        </div>
      </div>
      
      <div class="card bg-base-200">
        <div class="card-body p-4">
          <div class="flex items-center gap-2">
            <span class="badge badge-outline">After</span>
            <h4 class="font-semibold">{{ diff.afterVersion.name }}</h4>
          </div>
          <div class="text-sm text-base-content/70">
            {{ formatDate(diff.afterVersion.timestamp) }}
          </div>
          <div v-if="diff.afterVersion.description" class="text-sm mt-2">
            {{ diff.afterVersion.description }}
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div v-if="diff" class="stats shadow w-full">
      <div class="stat">
        <div class="stat-figure text-success">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div class="stat-title">Added</div>
        <div class="stat-value text-success">{{ diff.summary.added }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-warning">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div class="stat-title">Modified</div>
        <div class="stat-value text-warning">{{ diff.summary.modified }}</div>
      </div>

      <div class="stat">
        <div class="stat-figure text-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div class="stat-title">Removed</div>
        <div class="stat-value text-error">{{ diff.summary.removed }}</div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="flex items-center gap-4">
      <div class="form-control">
        <label class="label">
          <span class="label-text">Show Changes:</span>
        </label>
        <div class="flex gap-2">
          <label class="cursor-pointer flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="showAdded" 
              class="checkbox checkbox-success checkbox-sm"
            />
            <span class="text-sm">Added</span>
          </label>
          <label class="cursor-pointer flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="showModified" 
              class="checkbox checkbox-warning checkbox-sm"
            />
            <span class="text-sm">Modified</span>
          </label>
          <label class="cursor-pointer flex items-center gap-2">
            <input 
              type="checkbox" 
              v-model="showRemoved" 
              class="checkbox checkbox-error checkbox-sm"
            />
            <span class="text-sm">Removed</span>
          </label>
        </div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Language:</span>
        </label>
        <select v-model="selectedLanguage" class="select select-bordered select-sm">
          <option value="">All Languages</option>
          <option v-for="lang in availableLanguages" :key="lang" :value="lang">
            {{ getLanguageName(lang) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Changes Table -->
    <div v-if="diff" class="overflow-x-auto">
      <table class="table table-zebra w-full">
        <thead>
          <tr>
            <th>Change Type</th>
            <th>Key</th>
            <th>Language</th>
            <th>Before</th>
            <th>After</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredChanges.length === 0">
            <td colspan="5" class="text-center py-8 text-base-content/50">
              No changes match the current filters
            </td>
          </tr>
          <tr v-else v-for="change in filteredChanges" :key="`${change.key}-${change.languageCode}`">
            <td>
              <div class="flex items-center gap-2">
                <div 
                  class="badge badge-sm"
                  :class="{
                    'badge-success': change.type === 'added',
                    'badge-warning': change.type === 'modified',
                    'badge-error': change.type === 'removed'
                  }"
                >
                  {{ change.type.toUpperCase() }}
                </div>
              </div>
            </td>
            <td>
              <div class="font-mono text-sm">{{ change.key }}</div>
            </td>
            <td>
              <div class="badge badge-outline badge-sm">{{ getLanguageName(change.languageCode) }}</div>
            </td>
            <td>
              <div 
                class="text-sm"
                :class="{ 'text-base-content/50 italic': !change.beforeValue }"
              >
                {{ change.beforeValue || '(empty)' }}
              </div>
            </td>
            <td>
              <div 
                class="text-sm"
                :class="{ 'text-base-content/50 italic': !change.afterValue }"
              >
                {{ change.afterValue || '(empty)' }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Changes State -->
    <div v-if="diff && diff.changes.length === 0" class="text-center py-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-semibold mb-2">No Differences Found</h3>
      <p class="text-base-content/70">The selected versions are identical.</p>
    </div>

    <!-- Loading State -->
    <div v-if="!diff" class="text-center py-12">
      <div class="loading loading-spinner loading-lg"></div>
      <p class="mt-4 text-base-content/70">Loading version comparison...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFilesStore } from '../stores/files'
import type { VersionDiff } from '../stores/files'

const props = defineProps<{
  beforeVersionId: string
  afterVersionId: string
}>()

const filesStore = useFilesStore()

// Reactive state
const diff = ref<VersionDiff | null>(null)
const showAdded = ref(true)
const showModified = ref(true)
const showRemoved = ref(true)
const selectedLanguage = ref('')

// Computed properties
const filteredChanges = computed(() => {
  if (!diff.value) return []
  
  return diff.value.changes.filter(change => {
    // Filter by change type
    if (change.type === 'added' && !showAdded.value) return false
    if (change.type === 'modified' && !showModified.value) return false
    if (change.type === 'removed' && !showRemoved.value) return false
    
    // Filter by language
    if (selectedLanguage.value && change.languageCode !== selectedLanguage.value) return false
    
    return true
  })
})

const availableLanguages = computed(() => {
  if (!diff.value) return []
  
  const languages = new Set<string>()
  diff.value.changes.forEach(change => {
    languages.add(change.languageCode)
  })
  
  return Array.from(languages).sort()
})

// Methods
function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    th: 'Thai',
    km: 'Khmer',
    my: 'Myanmar'
  }
  return languageNames[code] || code
}

function loadDiff() {
  diff.value = filesStore.compareVersions(props.beforeVersionId, props.afterVersionId)
}

// Watchers
watch([() => props.beforeVersionId, () => props.afterVersionId], loadDiff, { immediate: true })

// Lifecycle
onMounted(() => {
  loadDiff()
})
</script>

<style scoped>
.table th {
  background: oklch(var(--b2));
}

.badge-success {
  --tw-badge-bg: oklch(var(--su));
  --tw-badge-color: oklch(var(--suc));
}

.badge-warning {
  --tw-badge-bg: oklch(var(--wa));
  --tw-badge-color: oklch(var(--wac));
}

.badge-error {
  --tw-badge-bg: oklch(var(--er));
  --tw-badge-color: oklch(var(--erc));
}
</style>
