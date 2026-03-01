// composables/useReplyModal.ts
// Re-uses the ComposerModal with a reply target
import type { Post } from '~/types'

export function useReplyModal() {
  const { open: openComposer } = useComposerModal()

  function open(post: Post) {
    openComposer(post)
  }

  return { open }
}