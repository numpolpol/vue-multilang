<template>
  <dialog id="export_modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Export Settings</h3>
      <!-- Platform Selection -->
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Export Format</span>
        </label>
        <div class="select select-bordered w-full flex items-center">
          iOS (.strings)
        </div>
        <label class="label">
          <span class="label-text-alt">
            Standard iOS localization format
          </span>
        </label>
      </div>
      <div class="modal-action">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="$emit('download')">Export</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
defineProps<{
  exportPlatform: 'ios'
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
}>()
</script>
