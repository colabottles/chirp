// composables/useComposerModal.ts
import type { Post } from '~/types'

const isOpen = ref(false)
const replyTo = ref<Post | undefined>()
const listeners = new Set<(post: Post) => void>()

export function useComposerModal() {
  function open(post?: Post) {
    replyTo.value = post
    isOpen.value = true
  }
  function close() {
    isOpen.value = false
    replyTo.value = undefined
  }
  function onPosted(cb: (post: Post) => void) {
    onUnmounted(() => listeners.delete(cb))
    listeners.add(cb)
  }
  function notifyPosted(post: Post) {
    listeners.forEach((cb) => cb(post))
  }
  return { isOpen: readonly(isOpen), replyTo: readonly(replyTo), open, close, onPosted, notifyPosted }
}