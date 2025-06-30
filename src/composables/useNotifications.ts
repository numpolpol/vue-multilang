import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  autoClose?: boolean
}

const notifications = ref<Notification[]>([])

export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 5000,
      ...notification
    }
    
    notifications.value.push(newNotification)
    
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }
  
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAll = () => {
    notifications.value.splice(0)
  }
  
  const success = (title: string, message?: string) => {
    return addNotification({ type: 'success', title, message })
  }
  
  const error = (title: string, message?: string) => {
    return addNotification({ type: 'error', title, message, duration: 8000 })
  }
  
  const warning = (title: string, message?: string) => {
    return addNotification({ type: 'warning', title, message, duration: 6000 })
  }
  
  const info = (title: string, message?: string) => {
    return addNotification({ type: 'info', title, message })
  }
  
  return {
    notifications: notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
