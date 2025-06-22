<template>
  <div class="space-y-4">
    <div class="divider">Export Options</div>
    <div class="flex flex-col gap-2">
      <button class="btn btn-accent btn-sm btn-block" @click="$emit('exportChanged')">
        Export Changed
      </button>
      <button class="btn btn-sm btn-block" @click="$emit('exportOriginal')">
        Keep Order
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
  exportChanged: []
  exportOriginal: []
  goBack: []
}>()
</script>
