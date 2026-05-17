// composables/useA11yAnnouncer.ts
// Provides live region announcements for screen readers
// Supports WCAG 4.1.3 Status Messages (AA)

interface AnnouncerState {
  message: string
  politeness: 'polite' | 'assertive'
}

const state = reactive<AnnouncerState>({
  message: '',
  politeness: 'polite',
})

export function useA11yAnnouncer() {
  const liveAnnouncement = computed(() => state.message)

  function announce(message: string, politeness: 'polite' | 'assertive' = 'polite') {
    // Clear first to force re-announcement if same text
    state.message = ''
    state.politeness = politeness
    nextTick(() => {
      state.message = message
    })
  }

  function announceAssertive(message: string) {
    announce(message, 'assertive')
  }

  return {
    liveAnnouncement,
    announce,
    announceAssertive,
  }
}