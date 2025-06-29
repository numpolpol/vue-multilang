<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'alert shadow-lg border-2 transform transition-all duration-300 ease-in-out',
            {
              'alert-success border-success/30': notification.type === 'success',
              'alert-error border-error/30': notification.type === 'error',
              'alert-warning border-warning/30': notification.type === 'warning',
              'alert-info border-info/30': notification.type === 'info'
            }
          ]"
        >
          <div class="flex items-start gap-3 w-full">
            <!-- Icon -->
            <div class="flex-shrink-0 mt-0.5">
              <svg
                v-if="notification.type === 'success'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else-if="notification.type === 'error'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg
                v-else-if="notification.type === 'warning'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm">{{ notification.title }}</div>
              <div v-if="notification.message" class="text-xs opacity-80 mt-1 break-words">
                {{ notification.message }}
              </div>
            </div>

            <!-- Close button -->
            <button
              @click="removeNotification(notification.id)"
              class="flex-shrink-0 btn btn-ghost btn-xs btn-circle hover:bg-base-content/10 mt-0.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Progress bar for auto-close -->
          <div 
            v-if="notification.autoClose"
            class="absolute bottom-0 left-0 h-1 bg-current opacity-50 rounded-b"
            :style="{ 
              width: '100%',
              animationDuration: `${notification.duration}ms`,
              animationName: 'shrink'
            }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { useNotifications } from '../composables/useNotifications'

const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
/* Notification animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%) scale(0.95);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Progress bar shrink animation */
@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
