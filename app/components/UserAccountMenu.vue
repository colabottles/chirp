<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)

const displayName = computed(() => user.value?.user_metadata?.display_name || user.value?.email?.split('@')[0] || 'User')
const username = computed(() => user.value?.user_metadata?.username || user.value?.email?.split('@')[0] || 'user')
const avatarInitial = computed(() => displayName.value[0]?.toUpperCase() ?? '?')

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

async function handleLogout() {
  closeMenu()
  await supabase.auth.signOut()
  router.push('/auth/login')
}

async function handleSwitchAccount() {
  closeMenu()
  await supabase.auth.signOut()
  router.push('/auth/login?switch=true')
}

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') {
    closeMenu()
    triggerRef.value?.focus()
  }
}

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="user-account-menu" ref="menuRef">
    <div class="user-panel">
      <div class="user-avatar" aria-hidden="true">{{ avatarInitial }}</div>
      <div class="user-info">
        <span class="user-display-name">{{ displayName }}</span>
        <span class="user-handle">@{{ username }}</span>
      </div>
      <button
        ref="triggerRef"
        class="menu-trigger"
        :aria-expanded="isOpen"
        aria-haspopup="menu"
        aria-label="Account options"
        @click="toggleMenu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="2"/>
          <circle cx="12" cy="12" r="2"/>
          <circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
    </div>

    <Transition name="menu">
      <menu
        v-if="isOpen"
        class="account-dropdown"
        role="menu"
        aria-label="Account options"
      >
        <li role="none">
          <button
            role="menuitem"
            class="dropdown-item"
            @click="handleSwitchAccount"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Switch accounts
          </button>
        </li>
        <li role="none">
          <button
            role="menuitem"
            class="dropdown-item dropdown-item--logout"
            @click="handleLogout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Log out @{{ username }}
          </button>
        </li>
      </menu>
    </Transition>
  </div>
</template>

<style scoped>
.user-account-menu {
  position: relative;
}

.user-panel {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 9999px;
  cursor: default;
  transition: background-color 0.2s;
}

.user-panel:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background-color: #4f46e5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.user-display-name {
  font-weight: 700;
  font-size: 0.9375rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-handle {
  font-size: 0.875rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.menu-trigger {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s;
  flex-shrink: 0;
}

.menu-trigger:hover,
.menu-trigger:focus-visible {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.menu-trigger:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

.account-dropdown {
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background-color: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.5);
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.875rem 1rem;
  background: none;
  border: none;
  color: #e5e7eb;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.15s;
}

.dropdown-item:hover,
.dropdown-item:focus-visible {
  background-color: rgba(255, 255, 255, 0.08);
}

.dropdown-item:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: -2px;
}

.dropdown-item--logout {
  color: #f87171;
}

.dropdown-item--logout:hover,
.dropdown-item--logout:focus-visible {
  background-color: rgba(248, 113, 113, 0.1);
}

/* Transition */
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>