<template>
  <div v-if="mode === 'paging'" :class="[
    'flex-shrink-0 bg-base-100 border border-base-300 rounded-lg p-4 mr-auto flex flex-col h-full transition-all duration-300',
    isMinimized ? 'w-12' : 'w-80'
  ]">
    <div class="space-y-4 flex flex-col h-full">
      <!-- Header with minimize button -->
      <div class="flex items-center justify-between">
        <h3 v-if="!isMinimized" class="font-semibold text-lg">Preview Images</h3>
        <button 
          @click="$emit('update:isMinimized', !isMinimized)"
          class="btn btn-xs btn-ghost"
          :title="isMinimized ? 'Expand Preview Panel' : 'Minimize Preview Panel'"
        >
          <svg v-if="isMinimized" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <!-- Content (hidden when minimized) -->
      <div v-if="!isMinimized" class="space-y-4 flex flex-col h-full">
        <div class="text-xs text-base-content/70">
          {{ Object.keys(previewImages).length }} sections with images
        </div>
      
        <!-- Image Upload Area -->
        <div class="space-y-2 flex-shrink-0">
          <label class="label">
            <span class="label-text">Add Images for {{ selectedPage }} section</span>
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            class="file-input file-input-bordered file-input-sm w-full" 
            @change="$emit('imagesSelected', $event)"
          />
          <label class="label">
            <span class="label-text-alt">Upload preview images to visualize this section</span>
          </label>
        </div>
        
        <!-- Uploaded Images Display -->
        <div v-if="previewImages[selectedPage]?.length" class="space-y-3 flex-1 flex flex-col">
          <div class="divider">Uploaded Images</div>
          <div class="space-y-3 flex-1 overflow-y-auto">
            <div 
              v-for="(image, index) in previewImages[selectedPage]" 
              :key="index"
              class="relative group"
            >
              <img 
                :src="image.url" 
                :alt="image.name"
                class="object-contain border border-base-300 rounded-lg cursor-pointer hover:opacity-80 transition-opacity w-full"
                style="height: 200px;"
                @click="$emit('openFullscreenImage', { image, index, prefix: selectedPage })"
              />
              <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  class="btn btn-sm btn-error btn-circle"
                  @click="$emit('removeImage', { prefix: selectedPage, index })"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div class="mt-1 text-xs text-base-content/70 truncate">
                {{ image.name }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- No Images State -->
        <div v-else class="text-center py-8 text-base-content/50 flex-1 flex flex-col justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm">No preview images</p>
          <p class="text-xs">Upload images to visualize this section</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PreviewImage } from '../stores/files'

defineProps<{
  mode: 'all' | 'paging'
  isMinimized: boolean
  previewImages: Record<string, PreviewImage[]>
  selectedPage: string
}>()

defineEmits<{
  (e: 'update:isMinimized', value: boolean): void
  (e: 'imagesSelected', event: Event): void
  (e: 'openFullscreenImage', data: { image: PreviewImage, index: number, prefix: string }): void
  (e: 'removeImage', data: { prefix: string, index: number }): void
}>()
</script>
