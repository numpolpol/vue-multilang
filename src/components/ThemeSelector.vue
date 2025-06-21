<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text font-semibold">Theme</span>
    </label>
    <select :value="theme" class="select select-bordered w-full" @change="updateTheme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="forest">Forest</option>
      <option value="zimablue">Zima Blue</option>
    </select>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  theme: string
}

defineProps<Props>()

const emit = defineEmits<{
  updateTheme: [event: Event]
}>()

function updateTheme(event: Event) {
  emit('updateTheme', event)
}
</script>
