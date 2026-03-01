<template>
  <header class="app-nav" role="banner">
    <!-- Site logo — WCAG 2.4.2 Page Titled -->
    <NuxtLink
      to="/"
      class="nav-logo"
      aria-label="Chirp — go to home feed">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        width="32"
        height="32">
        <path
          d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.4 10.8c.008.18.008.36.008.54 0 5.52-4.2 11.88-11.88 11.88-2.36 0-4.552-.688-6.4-1.872.336.04.656.052.996.052 1.952 0 3.752-.664 5.184-1.784a4.19 4.19 0 0 1-3.908-2.904c.256.04.512.064.78.064.376 0 .74-.052 1.084-.144a4.185 4.185 0 0 1-3.356-4.108v-.052c.56.312 1.204.5 1.888.524a4.18 4.18 0 0 1-1.872-3.484c0-.772.208-1.492.572-2.112a11.874 11.874 0 0 0 8.616 4.372 4.72 4.72 0 0 1-.104-.956 4.187 4.187 0 0 1 4.188-4.188c1.204 0 2.292.508 3.056 1.32a8.24 8.24 0 0 0 2.656-1.016 4.197 4.197 0 0 1-1.84 2.312 8.37 8.37 0 0 0 2.408-.656 8.99 8.99 0 0 1-2.072 2.148z" />
      </svg>
      Chirp
    </NuxtLink>

    <!-- Primary navigation landmark -->
    <nav aria-label="Primary">
      <ul class="nav-list" role="list">

        <!-- Home -->
        <li class="nav-item">
          <NuxtLink
            to="/"
            class="nav-link"
            :class="{ active: route.path === '/' }"
            :aria-current="route.path === '/' ? 'page' : undefined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              :fill="route.path === '/' ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline stroke-linecap="round" stroke-linejoin="round"
                points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </NuxtLink>
        </li>

        <!-- Explore -->
        <li class="nav-item">
          <NuxtLink
            to="/explore"
            class="nav-link"
            :class="{ active: route.path.startsWith('/explore') }"
            :aria-current="route.path.startsWith('/explore') ? 'page' : undefined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              :fill="route.path.startsWith('/explore') ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <circle cx="11" cy="11" r="8" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35" />
            </svg>
            Explore
          </NuxtLink>
        </li>

        <!-- Notifications -->
        <li v-if="user" class="nav-item">
          <NuxtLink
            to="/notifications"
            class="nav-link"
            :class="{ active: route.path === '/notifications' }"
            :aria-current="route.path === '/notifications' ? 'page' : undefined"
            :aria-label="`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              :fill="route.path === '/notifications' ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Notifications
            <span v-if="unreadCount > 0" class="nav-badge" aria-hidden="true">
              {{ unreadCount > 99 ? '99+' : unreadCount }}
            </span>
          </NuxtLink>
        </li>

        <!-- Messages -->
        <li v-if="user" class="nav-item">
          <NuxtLink
            to="/messages"
            class="nav-link"
            :class="{ active: route.path === '/messages' }"
            :aria-current="route.path === '/messages' ? 'page' : undefined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              :fill="route.path === '/messages' ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Messages
          </NuxtLink>
        </li>

        <!-- Bookmarks -->
        <li v-if="user" class="nav-item">
          <NuxtLink
            to="/bookmarks"
            class="nav-link"
            :class="{ active: route.path === '/bookmarks' }"
            :aria-current="route.path === '/bookmarks' ? 'page' : undefined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              :fill="route.path === '/bookmarks' ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            Bookmarks
          </NuxtLink>
        </li>

        <!-- Filters -->
        <li v-if="user" class="nav-item">
          <NuxtLink
            to="/settings/filters"
            class="nav-link"
            :class="{ active: route.path.startsWith('/settings') }"
            :aria-current="route.path.startsWith('/settings') ? 'page' : undefined">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
          </NuxtLink>
        </li>

        <!-- Profile -->
        <li v-if="user" class="nav-item">
          <NuxtLink
            :to="`/profile/${userProfile?.username}`"
            class="nav-link"
            :class="{ active: route.path.startsWith('/profile') }"
            :aria-current="route.path.startsWith('/profile') ? 'page' : undefined">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </NuxtLink>
        </li>

      </ul>
    </nav>

    <!-- Compose post button -->
    <button
      v-if="user"
      class="nav-post-btn"
      aria-label="Compose new post"
      @click="handleOpenComposer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        aria-hidden="true"
        focusable="false">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Post
    </button>

    <!-- Guest CTA -->
    <div v-else class="nav-guest">
      <NuxtLink to="/auth/login" class="nav-post-btn" style="text-decoration: none; display: flex;">
        Sign in
      </NuxtLink>
    </div>

    <!-- Profile switcher at bottom -->
    <div v-if="user && userProfile" class="nav-profile">
      <button
        class="nav-profile-btn"
        :aria-label="`Account menu for ${userProfile.display_name}`"
        aria-haspopup="menu"
        @click="toggleProfileMenu">
        <div class="nav-profile-avatar" aria-hidden="true">
          <img
            v-if="userProfile.avatar_url"
            :src="userProfile.avatar_url"
            :alt="userProfile.display_name" />
          <span v-else class="post-avatar-placeholder" aria-hidden="true">
            {{ userProfile.display_name[0].toUpperCase() }}
          </span>
        </div>
        <div class="nav-profile-info">
          <span class="nav-profile-name">{{ userProfile.display_name }}</span>
          <span class="nav-profile-handle">@{{ userProfile.username }}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
          focusable="false">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>

      <ProfileDropdownMenu
        v-if="showProfileMenu"
        @close="showProfileMenu = false" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseUser } from '#imports'

const route = useRoute()
const user = useSupabaseUser()
const { userProfile } = useProfile()
const { unreadCount } = useNotifications()
const { open } = useComposerModal()

const showProfileMenu = ref(false)

// Wrapper so the click PointerEvent is not passed as a Post argument
function handleOpenComposer() {
  open()
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}
</script>