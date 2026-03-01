// composables/useToast.ts

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function showToast(
    message: string,
    type: Toast['type'] = 'info',
    duration = 3500
  ) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return { toasts: readonly(toasts), showToast, removeToast }
}