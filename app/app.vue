<template>
  <!-- Skip navigation — WCAG 2.4.1 Bypass Blocks (A) -->
  <a href="#main-content" class="skip-link">
    Skip to main content
  </a>

  <!-- Live region for dynamic announcements — WCAG 4.1.3 (AA) -->
  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="live-region">
    {{ liveAnnouncement }}
  </div>

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Toast notifications -->
  <ToastContainer />
</template>

<script setup lang="ts">
const { liveAnnouncement } = useA11yAnnouncer()
const { applyPrefsToDOM, loadPrefs } = useAccessibilityPrefs()

onMounted(async () => {
  await loadPrefs()       // fetch from Supabase
  applyPrefsToDOM()       // apply immediately
  watchEffect(() => {
    if (import.meta.client) {
      applyPrefsToDOM()   // keep in sync on changes
    }
  })
})
</script>