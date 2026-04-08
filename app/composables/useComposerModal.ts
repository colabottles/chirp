// app/composables/useComposerModal.ts
import type { Post } from '~/types'

const listeners = new Set<(post: Post) => void>()

export function useComposerModal() {
  const isOpen = useState<boolean>('composer-modal-open', () => false)
  const replyTo = useState<Post | undefined>('composer-modal-reply', () => undefined)

  function open(post?: Post) {
    replyTo.value = post
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    replyTo.value = undefined
  }

  function onPosted(cb: (post: Post) => void) {
    listeners.add(cb)
    onUnmounted(() => listeners.delete(cb))
  }

  function notifyPosted(post: Post) {
    listeners.forEach((cb) => cb(post))
  }

  return {
    isOpen: readonly(isOpen),
    replyTo: readonly(replyTo),
    open,
    close,
    onPosted,
    notifyPosted,
  }
}