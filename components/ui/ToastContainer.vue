<template>
  <!-- ARIA live region for status messages — WCAG 4.1.3 Status Messages -->
  <div
    class="toast-container"
    role="region"
    aria-label="Notifications"
    aria-live="polite"
    aria-atomic="false"
    aria-relevant="additions">
    <TransitionGroup
      name="toast"
      tag="div"
      style="display: flex; flex-direction: column; gap: var(--space-3);">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
        role="status">
        <!-- Success icon -->
        <svg
          v-if="toast.type === 'success'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="var(--color-success)"
          stroke-width="2.5"
          aria-hidden="true"
          focusable="false">
          <polyline stroke-linecap="round" stroke-linejoin="round" points="20 6 9 17 4 12" />
        </svg>

        <!-- Error icon -->
        <svg
          v-else-if="toast.type === 'error'"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="var(--color-error)"
          stroke-width="2.5"
          aria-hidden="true"
          focusable="false">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        {{ toast.message }}
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { toasts } = useToast()
</script>

<style>
.toast-enter-active {
  animation: toastIn 250ms cubic-bezier(0.34, 1.3, 0.64, 1) both;
}

.toast-leave-active {
  animation: toastOut 200ms ease forwards;
}
</style>