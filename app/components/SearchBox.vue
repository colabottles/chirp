<template>
  <div class="search-box">
    <label for="search-input" class="sr-only">Search Chirp</label>
    <div style="position: relative;">
      <span class="search-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
          fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        id="search-input"
        v-model="query"
        type="search"
        class="search-input"
        placeholder="Search"
        autocomplete="off"
        :aria-label="'Search Chirp'"
        @keydown.enter="doSearch"
        @keydown.esc="clearSearch" />
    </div>

    <!-- Search suggestions dropdown -->
    <div
      v-if="query && results.length > 0"
      role="listbox"
      aria-label="Search suggestions"
      style="position: absolute; top: 100%; left: 0; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); margin-top: var(--space-2); box-shadow: var(--shadow-md); z-index: var(--z-overlay); overflow: hidden;">
      <NuxtLink
        v-for="result in results"
        :key="result.id"
        :to="`/profile/${result.username}`"
        role="option"
        style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); text-decoration: none; transition: background var(--transition-fast);"
        :style="{ background: 'transparent' }"
        @mouseenter="($event.currentTarget as HTMLElement).style.background = 'var(--color-surface-2)'"
        @mouseleave="($event.currentTarget as HTMLElement).style.background = 'transparent'">
        <div
          style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: var(--color-surface-3); flex-shrink: 0;">
          <img v-if="result.avatar_url" :src="result.avatar_url" :alt="result.display_name"
            width="40" height="40" style="width: 100%; height: 100%; object-fit: cover;" />
          <div v-else class="post-avatar-placeholder"
            style="height: 100%; font-size: var(--text-sm);">{{ result.display_name[0].toUpperCase()
            }}</div>
        </div>
        <div>
          <div
            style="color: var(--color-text-primary); font-weight: 600; font-size: var(--text-sm);">
            {{ result.display_name }}</div>
          <div style="color: var(--color-text-tertiary); font-size: var(--text-xs);">@{{
            result.username }}</div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types'

const supabase = useSupabaseClient()
const router = useRouter()
const query = ref('')
const results = ref<Profile[]>([])

let searchTimer: ReturnType<typeof setTimeout>

watch(query, (val) => {
  clearTimeout(searchTimer)
  if (!val.trim()) {
    results.value = []
    return
  }
  searchTimer = setTimeout(() => searchProfiles(val), 300)
})

async function searchProfiles(q: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url')
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(5)
  results.value = (data ?? []) as Profile[]
}

function doSearch() {
  if (query.value.trim()) {
    router.push(`/explore?q=${encodeURIComponent(query.value)}`)
    clearSearch()
  }
}

function clearSearch() {
  query.value = ''
  results.value = []
}
</script>