<template>
  <div
    style="display: flex; align-items: center; justify-content: center; min-height: 100vh; flex-direction: column; gap: var(--space-4);">
    <div class="spinner" role="status">
      <span class="sr-only">Completing sign in...</span>
    </div>
    <p style="color: var(--color-text-secondary);">Completing sign in...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

// Supabase module handles the auth callback automatically
// This page shows a loading state while it processes
const router = useRouter()

onMounted(() => {
  // Give the Supabase module time to process the auth callback
  setTimeout(() => {
    router.push('/')
  }, 2000)
})
</script>