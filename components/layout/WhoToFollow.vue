<template>
  <div class="follow-suggestions-card" v-if="suggestions.length > 0">
    <h2 class="card-title">Who to follow</h2>
    <div
      v-for="person in suggestions"
      :key="person.id"
      class="follow-user-item">
      <NuxtLink
        :to="`/profile/${person.username}`"
        class="follow-user-avatar"
        :aria-label="`View ${person.display_name}'s profile`">
        <img
          v-if="person.avatar_url"
          :src="person.avatar_url"
          :alt="person.display_name"
          width="44"
          height="44"
          loading="lazy"
          style="width: 100%; height: 100%; object-fit: cover;" />
        <div v-else class="post-avatar-placeholder"
          style="height: 100%; font-size: var(--text-sm);">
          {{ person.display_name[0].toUpperCase() }}
        </div>
      </NuxtLink>

      <div class="follow-user-info">
        <NuxtLink :to="`/profile/${person.username}`" class="follow-user-name">
          {{ person.display_name }}
        </NuxtLink>
        <span class="follow-user-handle">@{{ person.username }}</span>
      </div>

      <button
        class="follow-btn"
        :class="{ following: followingIds.has(person.id) }"
        :aria-label="followingIds.has(person.id) ? `Unfollow ${person.display_name}` : `Follow ${person.display_name}`"
        :aria-pressed="followingIds.has(person.id)"
        @click="toggleFollow(person)">
        {{ followingIds.has(person.id) ? 'Following' : 'Follow' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '~/types'

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { announce } = useAnnouncer()
const { showToast } = useToast()

const suggestions = ref<Profile[]>([])
const followingIds = ref(new Set<string>())

async function fetchSuggestions() {
  if (!user.value) {
    // For guests, show popular users
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, followers_count')
      .order('followers_count', { ascending: false })
      .limit(3)
    suggestions.value = (data ?? []) as Profile[]
    return
  }

  // Get who the user already follows
  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.value.id)
  const alreadyFollowing = new Set(follows?.map((f) => f.following_id) ?? [])
  followingIds.value = alreadyFollowing

  // Suggest popular users not yet followed
  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, followers_count')
    .neq('id', user.value.id)
    .not('id', 'in', `(${[...alreadyFollowing].join(',') || 'null'})`)
    .order('followers_count', { ascending: false })
    .limit(3)
  suggestions.value = (data ?? []) as Profile[]
}

async function toggleFollow(person: Profile) {
  if (!user.value) {
    navigateTo('/auth/login')
    return
  }

  if (followingIds.value.has(person.id)) {
    await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.value.id)
      .eq('following_id', person.id)
    followingIds.value.delete(person.id)
    announce(`Unfollowed ${person.display_name}.`)
  } else {
    await supabase
      .from('follows')
      .insert({ follower_id: user.value.id, following_id: person.id })
    followingIds.value.add(person.id)
    announce(`Now following ${person.display_name}.`)
    showToast(`Following ${person.display_name}!`, 'success')
  }
  // Force reactivity
  followingIds.value = new Set(followingIds.value)
}

onMounted(fetchSuggestions)
</script>