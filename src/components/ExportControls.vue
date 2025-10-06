<template>
  <div class="space-y-4">
    <div class="divider">Export Options</div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-primary btn-sm btn-block" @click="$emit('exportAll')">
        Export All
      </button>
      <button class="btn btn-accent btn-sm btn-block" @click="$emit('exportChanged')">
        Export Changed
      </button>
      <button class="btn btn-sm btn-block" @click="$emit('exportOriginal')">
        Keep Order
      </button>
      <button class="btn btn-success btn-sm btn-block" @click="$emit('exportCSV')">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Export CSV
      </button>
    </div>

    <!-- Back Button -->
    <div class="divider"></div>
    <button class="btn btn-ghost btn-sm btn-block" @click="$emit('goBack')">
      Exit
    </button>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  exportAll: []
  exportChanged: []
  exportOriginal: []
  exportCSV: []
  goBack: []
}>()
</script>
