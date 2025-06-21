<template>
  <div class="space-y-4">
    <div class="divider">View Controls</div>
    
    <!-- View Mode -->
    <div class="form-control">
      <label class="label">
        <span class="label-text font-semibold">Display Mode</span>
      </label>
      <div class="flex flex-col gap-2">
        <label class="label cursor-pointer justify-start gap-2">
          <input type="radio" class="radio radio-sm" :value="'all'" :checked="viewMode === 'all'" @change="$emit('update:viewMode', 'all')" />
          <span class="label-text">See All Keys</span>
        </label>
        <label class="label cursor-pointer justify-start gap-2">
          <input type="radio" class="radio radio-sm" :value="'paging'" :checked="viewMode === 'paging'" @change="$emit('update:viewMode', 'paging')" />
          <span class="label-text">Group by Prefix</span>
        </label>
      </div>
    </div>

    <!-- Highlight Mode -->
    <div class="form-control">
      <label class="label cursor-pointer justify-start gap-2">
        <input type="checkbox" class="toggle toggle-sm" :checked="highlightMode" @change="$emit('update:highlightMode', ($event.target as HTMLInputElement).checked)" />
        <span class="label-text">Highlight Changes</span>
      </label>
      <label class="label">
        <span class="label-text-alt">Highlight edited, duplicate, or identical values</span>
      </label>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface Props {
  viewMode: 'all' | 'paging'
  highlightMode: boolean
}

defineProps<Props>()

defineEmits<{
  'update:viewMode': [value: 'all' | 'paging']
  'update:highlightMode': [value: boolean]
}>()
</script>
