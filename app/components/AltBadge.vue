<template>
  <button
    type="button"
    class="alt-badge"
    :class="`alt-badge--${size}`"
    :aria-label="`View alt text: ${altText}`"
    @click.stop="emit('click')">
    ALT
  </button>
</template>

<script setup lang="ts">
defineProps<{
  altText: string
  size: 'small' | 'large'
}>()

const emit = defineEmits<{ click: [] }>()
</script>

<style scoped>
.alt-badge {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, transform 0.1s;
  backdrop-filter: blur(4px);
}

.alt-badge:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* Small: 8px font, 2px padding */
.alt-badge--small {
  font-size: 8px;
  padding: 2px;
}

/* Large: 12px font, 5px padding */
.alt-badge--large {
  font-size: 12px;
  padding: 5px;
}
</style>