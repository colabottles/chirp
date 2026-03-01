<template>
  <nav class="mobile-nav" aria-label="Mobile navigation">
    <NuxtLink
      to="/"
      class="mobile-nav-link"
      :class="{ active: route.path === '/' }"
      aria-label="Home"
      aria-current="page">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
        :fill="route.path === '/' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"
        aria-hidden="true" focusable="false">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    </NuxtLink>

    <NuxtLink
      to="/explore"
      class="mobile-nav-link"
      :class="{ active: route.path.startsWith('/explore') }"
      aria-label="Explore">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </NuxtLink>

    <button
      v-if="user"
      class="mobile-nav-link"
      aria-label="Compose new post"
      @click="handleCompose"
      style="background: var(--color-accent); border: none; border-radius: 50%; width: 44px; height: 44px; cursor: pointer; color: var(--color-text-inverse);">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
        stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>

    <NuxtLink
      v-if="user"
      to="/notifications"
      class="mobile-nav-link"
      :class="{ active: route.path === '/notifications' }"
      :aria-label="`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
        :fill="route.path === '/notifications' ? 'currentColor' : 'none'" stroke="currentColor"
        stroke-width="2" aria-hidden="true" focusable="false">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span
        v-if="unreadCount > 0"
        class="nav-badge"
        style="position: absolute; top: 6px; left: 50%; transform: translateX(2px);"
        aria-hidden="true">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
    </NuxtLink>

    <NuxtLink
      v-if="user && userProfile"
      :to="`/profile/${userProfile.username}`"
      class="mobile-nav-link"
      :class="{ active: route.path.startsWith('/profile') }"
      :aria-label="`${userProfile.display_name}'s profile`">
      <div
        style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; background: var(--color-surface-3);"
        aria-hidden="true">
        <img
          v-if="userProfile.avatar_url"
          :src="userProfile.avatar_url"
          :alt="userProfile.display_name"
          style="width: 100%; height: 100%; object-fit: cover;" />
        <span v-else
          style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 12px; font-weight: 700;">
          {{ userProfile.display_name[0].toUpperCase() }}
        </span>
      </div>
    </NuxtLink>

    <NuxtLink
      v-if="!user"
      to="/auth/login"
      class="mobile-nav-link"
      aria-label="Sign in">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
      </svg>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const user = useSupabaseUser()
const { userProfile } = useProfile()
const { unreadCount } = useNotifications()
const { open: openComposer } = useComposerModal()

function handleCompose() {
  openComposer()
}
</script>