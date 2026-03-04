<template>
  <menu
    role="menu"
    aria-label="Account menu"
    class="profile-dropdown"
    ref="menuEl"
    @keydown.esc="emit('close')">
    <li v-for="item in menuItems" :key="item.label" role="none">
      <component
        :is="item.href ? 'NuxtLink' : 'button'"
        :to="item.href ?? undefined"
        role="menuitem"
        :class="['profile-dropdown-item', { 'profile-dropdown-item--danger': item.danger }]"
        @click="item.action ? item.action() : emit('close')">
        {{ item.label }}
      </component>
    </li>
  </menu>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

interface MenuItem {
  label: string
  href?: string
  danger?: boolean
  action?: () => Promise<void>
}

const emit = defineEmits<{ close: [] }>()

const supabase = useSupabaseClient()
const router = useRouter()
const { userProfile } = useProfile()

const menuItems = computed<MenuItem[]>(() => [
  {
    label: 'Add an existing account',
    href: '/auth/login',
  },
  {
    label: `Sign out @${userProfile.value?.username ?? ''}`,
    danger: true,
    action: signOut,
  },
])

const menuEl = ref<HTMLElement>()

// Define functions first
function handleOutsideClick(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) {
    emit('close')
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// Then use them in lifecycle hooks
onMounted(() => {
  document.addEventListener('mousedown', handleOutsideClick)
  document.addEventListener('keydown', handleKeydown)
  nextTick(() => {
    const first = menuEl.value?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
  })
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
})

async function signOut() {
  await supabase.auth.signOut()
  router.push('/')
  emit('close')
}
</script>

<style scoped>
.profile-dropdown {
  position: absolute;
  top: 4rem;
  left: 0.5rem;
  right: 0;
  list-style: none;
  margin: 0;
  padding: var(--space-1) 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-overlay);
  overflow: hidden;
  animation: modalIn 150ms ease;
}

.profile-dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.15s;
}

.profile-dropdown-item:hover {
  background: var(--color-surface-2);
}

.profile-dropdown-item:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
  background: var(--color-surface-2);
}

.profile-dropdown-item--danger {
  color: var(--color-error, #f87171);
}

.profile-dropdown-item--danger:hover,
.profile-dropdown-item--danger:focus-visible {
  background: color-mix(in srgb, var(--color-error, #f87171) 10%, transparent);
}
</style>