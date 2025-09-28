<template>
  <tr>
    <!-- Key Column -->
    <td class="sticky left-0 z-10 bg-base-100" :style="{ width: columnWidths['key'] || '200px' }">
      <div v-if="isMergedKey" class="space-y-1">
        <div class="text-sm font-medium">
          {{ mergedKeyPrimary }}
        </div>
        <div v-if="mergedKeySecondary" class="text-xs text-secondary">
          ({{ mergedKeySecondary }})
        </div>
        <div class="badge badge-accent badge-xs">multi-key</div>
      </div>
      <div v-else-if="isEditing" class="space-y-1">
        <input
          :value="editKeyValue"
          @input="$emit('updateEditKeyValue', ($event.target as HTMLInputElement).value)"
          @keydown="onEditKeyKeydown"
          @blur="$emit('saveEditKey')"
          class="input input-bordered input-xs w-full"
          :class="{ 'input-error': editKeyError }"
          placeholder="Enter key name..."
          ref="editKeyInput"
        />
        <div v-if="editKeyError" class="text-xs text-error">{{ editKeyError }}</div>
        <div class="flex gap-1">
          <button @click="$emit('saveEditKey')" class="btn btn-xs btn-success" title="Save">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button @click="$emit('cancelEditKey')" class="btn btn-xs btn-ghost" title="Cancel">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div v-else class="flex items-center group">
        <span class="flex-1 cursor-pointer" @click="$emit('startEditKey')" :title="'Click to edit key: ' + keyName">
          {{ keyName }}
        </span>
        <!-- Change indicators -->
        <div v-if="changeDetails && changeDetails.length > 0" class="flex items-center gap-1 mr-1">
          <div v-for="change in changeDetails" :key="change.languageCode" 
               class="badge badge-xs"
               :class="{
                 'badge-success': change.status === 'new',
                 'badge-warning': change.status === 'modified', 
                 'badge-error': change.status === 'deleted'
               }"
               :title="`${change.languageName}: ${change.status} ${change.status === 'new' ? '→ ' + change.newValue : change.status === 'deleted' ? change.oldValue + ' → (deleted)' : change.oldValue + ' → ' + change.newValue}`"
          >
            {{ change.languageCode.toUpperCase() }}
          </div>
        </div>
        <button 
          @click="$emit('startEditKey')" 
          class="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
          title="Edit key"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
    </td>
    
    <!-- Paste Column -->
    <td class="sticky z-10 bg-base-100" :style="{ left: `${keyColumnWidth}px`, width: '80px' }">
      <button class="btn btn-xs btn-outline" @click="$emit('paste')">Paste</button>
    </td>
    
    <!-- Language Columns -->
    <td v-for="language in orderedLanguages" :key="language.code">
      <input 
        :value="getDisplayValue(language)" 
        @input="$emit('updateValue', { languageCode: language.code, value: ($event.target as HTMLInputElement).value })"
        class="input input-bordered w-full" 
        :placeholder="`Enter ${language.name} text...`"
      />
    </td>
    
    <!-- Delete Column -->
    <td class="w-16 min-w-16">
      <button 
        class="btn btn-xs btn-error btn-circle"
        @click="$emit('delete')"
        title="Delete this key"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Language {
  code: string
  name: string
  data: Record<string, string>
}

const props = defineProps<{
  keyName: string
  columnWidths: Record<string, string>
  keyColumnWidth: number
  orderedLanguages: Language[]
  isMergedKey: boolean
  mergedKeyPrimary?: string
  mergedKeySecondary?: string
  isEditing: boolean
  editKeyValue: string
  editKeyError: string
  changeDetails?: Array<{
    languageCode: string,
    languageName: string,
    status: 'new' | 'modified' | 'deleted',
    oldValue?: string,
    newValue?: string
  }> | null
}>()

const emit = defineEmits<{
  (e: 'startEditKey'): void
  (e: 'saveEditKey'): void
  (e: 'updateEditKeyValue', value: string): void
  (e: 'cancelEditKey'): void
  (e: 'paste'): void
  (e: 'updateValue', data: { languageCode: string, value: string }): void
  (e: 'delete'): void
}>()

const editKeyInput = ref<HTMLInputElement | null>(null)

function getDisplayValue(language: Language): string {
  return language.data[props.keyName] || ''
}

function onEditKeyKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('saveEditKey')
  } else if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancelEditKey')
  }
}

// Focus input when editing starts
defineExpose({
  focusInput: () => {
    nextTick(() => {
      if (editKeyInput.value) {
        editKeyInput.value.focus()
        editKeyInput.value.select()
      }
    })
  }
})
</script>
