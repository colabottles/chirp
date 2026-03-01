<template>
  <div
    role="menu"
    aria-label="Account menu"
    style="
      position: absolute;
      bottom: 80px;
      left: var(--space-3);
      right: var(--space-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-overlay);
      overflow: hidden;
      animation: modalIn 150ms ease;
    "
    ref="menuEl"
    @keydown.esc="emit('close')">
    <div v-for="item in menuItems" :key="item.label">
      <component
        :is="item.href ? 'NuxtLink' : 'button'"
        :to="item.href ?? undefined"
        role="menuitem"
        :class="['context-menu-item', { danger: item.danger }]"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'"
        @click="item.action ? item.action() : emit('close')">
        {{ item.label }}
      </component>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient } from '#imports'

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

const menuEl = ref<HTMLElement>()

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

async function signOut() {
  await supabase.auth.signOut()
  router.push('/auth/login')
  emit('close')
}

function handleOutsideClick(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  nextTick(() => {
    const first = menuEl.value?.querySelector<HTMLElement>('[role="menuitem"]')
    first?.focus()
  })
})

onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>