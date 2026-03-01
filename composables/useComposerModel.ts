// composables/useComposerModal.ts

import type { Post } from '~/types'

const isOpen = ref(false)
const replyTo = ref<Post | undefined>()

export function useComposerModal() {
  function open(post?: Post) {
    replyTo.value = post
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    replyTo.value = undefined
  }

  return { isOpen: readonly(isOpen), replyTo: readonly(replyTo), open, close }
}