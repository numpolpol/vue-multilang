<template>
  <dialog id="export_modal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Export Settings</h3>
      <!-- Platform Selection -->
      <div class="form-control w-full">
        <label class="label">
          <span class="label-text">Export Format</span>
        </label>
        <select :value="exportPlatform" @change="$emit('update:exportPlatform', ($event.target as HTMLSelectElement).value as 'ios' | 'android' | 'json')" class="select select-bordered w-full">
          <option value="ios">iOS (.strings)</option>
          <option value="android">Android (strings.xml)</option>
          <option value="json">JSON (nested structure)</option>
        </select>
        <label class="label">
          <span class="label-text-alt">
            <span v-if="exportPlatform === 'json'">Reconstructs nested JSON from flattened keys</span>
            <span v-else-if="exportPlatform === 'ios'">Standard iOS localization format</span>
            <span v-else>Android XML resource format</span>
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
  exportPlatform: 'ios' | 'android' | 'json'
}>()

defineEmits<{
  (e: 'update:exportPlatform', value: 'ios' | 'android' | 'json'): void
  (e: 'close'): void
  (e: 'download'): void
}>()
</script>
