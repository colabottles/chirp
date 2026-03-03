<template>
  <div class="auth-confirm">
    <div class="spinner" role="status">
      <span class="sr-only">Completing sign in...</span>
    </div>
    <p class="auth-confirm-text">Completing sign in...</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const user = useSupabaseUser()

onMounted(() => {
  watch(user, (newUser) => {
    if (newUser) {
      navigateTo('/')
    }
  }, { immediate: true })
})
</script>

<style scoped>
.auth-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  gap: var(--space-4);
}

.auth-confirm-text {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}
</style>