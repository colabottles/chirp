<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="replyTo ? `Reply to ${replyTo.profile?.display_name}` : 'Compose new post'"
      @click.self="close"
      @keydown.esc="close">
      <div
        class="modal"
        ref="modalEl">
        <div class="modal-header">
          <button
            class="modal-close-btn"
            aria-label="Close dialog"
            @click="close"
            ref="closeBtn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
              fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"
              focusable="false">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <span class="modal-title">
            {{ replyTo ? 'Reply' : 'New Post' }}
          </span>
        </div>

        <!-- Original post being replied to -->
        <div
          v-if="replyTo"
          style="padding: 0 var(--space-5); border-bottom: 1px solid var(--color-border-subtle);">
          <PostCard :post="replyTo" />
        </div>

        <div style="padding: var(--space-2) 0;">
          <PostComposer
            :reply-to="replyTo"
            :auto-focus="true"
            @posted="handlePosted" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const { isOpen, replyTo, close, notifyPosted } = useComposerModal()
const modalEl = ref<HTMLElement>()
const closeBtn = ref<HTMLElement>()
const { announce } = useAnnouncer()

// Trap focus within modal when open — WCAG 2.1.2
let previouslyFocused: HTMLElement | null = null

watch(isOpen, (open) => {
  if (open) {
    previouslyFocused = document.activeElement as HTMLElement
    nextTick(() => {
      // Focus first interactive element
      const firstFocusable = modalEl.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    })
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
    // Return focus to trigger element — WCAG 2.4.3 Focus Order
    previouslyFocused?.focus()
  }
})

function handlePosted(post: Post) {
  notifyPosted(post)
  close()
}

// Focus trap
function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value || !modalEl.value) return

  if (e.key === 'Tab') {
    const focusables = modalEl.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))
</script>