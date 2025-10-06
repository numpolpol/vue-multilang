<template>
  <!-- Duplicate Keys Summary Modal -->
  <dialog id="duplicate_keys_modal" class="modal">
    <div class="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
      <div class="sticky top-0 bg-base-100 z-10 pb-4 border-b border-base-300">
        <h3 class="font-bold text-lg">Duplicate Keys Detected</h3>
        <p class="text-sm text-base-content/70 mt-1">
          Some files contain duplicate keys - the latest values will be used
        </p>
        
        <!-- Summary Stats -->
        <div class="stats stats-horizontal shadow mt-3 w-full">
          <div class="stat">
            <div class="stat-title">Total Duplicate Keys</div>
            <div class="stat-value text-warning">{{ duplicateData?.duplicateCount || 0 }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Files Affected</div>
            <div class="stat-value text-info">{{ duplicateData?.affectedFiles || 0 }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Total Occurrences</div>
            <div class="stat-value text-secondary">{{ totalOccurrences }}</div>
          </div>
        </div>
      </div>

      <!-- Copy Controls -->
      <div class="sticky top-[200px] bg-base-100 z-10 py-3 border-b border-base-300">
        <div class="flex gap-2">
          <button class="btn btn-sm btn-outline" @click="copyToClipboard('summary')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Summary
          </button>
          <button class="btn btn-sm btn-outline" @click="copyToClipboard('detailed')">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Detailed Report
          </button>
          <div v-if="copySuccess" class="text-success text-sm flex items-center ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto mt-4">
        <div v-if="duplicateData && duplicateData.duplicateDetails.length > 0" class="space-y-4">
          <div 
            v-for="(duplicate, index) in duplicateData.duplicateDetails" 
            :key="duplicate.key"
            class="card bg-base-200 shadow-sm"
          >
            <div class="card-body p-4">
              <h4 class="card-title text-base">
                {{ index + 1 }}. Key: "{{ duplicate.key }}"
                <div class="badge badge-outline">{{ duplicate.occurrences.length }} occurrences</div>
              </h4>
              
              <div class="space-y-2">
                <div 
                  v-for="(occurrence, occIndex) in duplicate.occurrences" 
                  :key="occIndex"
                  class="flex items-start gap-3 p-3 rounded-lg"
                  :class="occurrence.used ? 'bg-success/10 border border-success/20' : 'bg-base-300/50'"
                >
                  <div class="flex-shrink-0">
                    <div 
                      class="badge text-xs"
                      :class="occurrence.used ? 'badge-success' : 'badge-neutral'"
                    >
                      Line {{ occurrence.lineNumber }}
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-medium">
                        {{ occurrence.used ? '✓ USED' : '✗ DISCARDED' }}
                      </span>
                      <span v-if="occurrence.used" class="text-xs text-success">(Latest value kept)</span>
                    </div>
                    <code class="text-sm bg-base-100/50 p-2 rounded block break-all">
                      "{{ duplicate.key }}" = "{{ occurrence.value }}";
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-base-content/50">
          No duplicate keys detected
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-action sticky bottom-0 bg-base-100 pt-4 border-t border-base-300">
        <form method="dialog">
          <button class="btn btn-primary">Continue Import</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface DuplicateOccurrence {
  value: string
  lineNumber: number
  used: boolean
}

interface DuplicateDetail {
  key: string
  occurrences: DuplicateOccurrence[]
}

interface DuplicateData {
  duplicateCount: number
  duplicateKeys: string[]
  duplicateDetails: DuplicateDetail[]
  fileName?: string
  affectedFiles?: number
}

const props = defineProps<{
  duplicateData: DuplicateData | null
}>()

const copySuccess = ref(false)

const totalOccurrences = computed(() => {
  if (!props.duplicateData) return 0
  return props.duplicateData.duplicateDetails.reduce((total, detail) => {
    return total + detail.occurrences.length
  }, 0)
})

function generateSummaryReport(): string {
  if (!props.duplicateData) return ''
  
  const timestamp = new Date().toLocaleString()
  const fileName = props.duplicateData.fileName || 'Import'
  
  let report = `# Duplicate Keys Summary Report\n\n`
  report += `**File:** ${fileName}\n`
  report += `**Date:** ${timestamp}\n`
  report += `**Total Duplicate Keys:** ${props.duplicateData.duplicateCount}\n`
  report += `**Total Occurrences:** ${totalOccurrences.value}\n\n`
  
  report += `## Summary\n`
  report += `Some files contain duplicate keys - the latest values will be used.\n\n`
  
  report += `## Affected Keys\n`
  props.duplicateData.duplicateKeys.forEach((key, index) => {
    report += `${index + 1}. "${key}"\n`
  })
  
  return report
}

function generateDetailedReport(): string {
  if (!props.duplicateData) return ''
  
  let report = generateSummaryReport()
  
  report += `\n## Detailed Breakdown\n\n`
  
  props.duplicateData.duplicateDetails.forEach((duplicate, index) => {
    report += `### ${index + 1}. Key: "${duplicate.key}"\n\n`
    
    duplicate.occurrences.forEach((occurrence) => {
      const status = occurrence.used ? '✓ USED' : '✗ DISCARDED'
      const note = occurrence.used ? ' (Latest value kept)' : ''
      
      report += `**Line ${occurrence.lineNumber}:** ${status}${note}\n`
      report += `\`\`\`\n"${duplicate.key}" = "${occurrence.value}";\n\`\`\`\n\n`
    })
  })
  
  report += `---\n`
  report += `Generated by Vue Multi-Language Editor\n`
  
  return report
}

async function copyToClipboard(type: 'summary' | 'detailed') {
  try {
    const text = type === 'summary' ? generateSummaryReport() : generateDetailedReport()
    await navigator.clipboard.writeText(text)
    
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = type === 'summary' ? generateSummaryReport() : generateDetailedReport()
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

function showModal() {
  const modal = document.getElementById('duplicate_keys_modal') as HTMLDialogElement
  if (modal) {
    modal.showModal()
  }
}

// Expose method for parent components
defineExpose({
  showModal
})
</script>