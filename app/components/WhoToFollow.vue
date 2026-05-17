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
          {{ person.display_name?.[0]?.toUpperCase() ?? '?' }}
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
import type { Database } from '~/types/database.types'
import type { Profile } from '~/types'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { announce } = useA11yAnnouncer()
const { showToast } = useToast()

const suggestions = ref<Profile[]>([])
const followingIds = ref(new Set<string>())

async function fetchSuggestions() {
  // Not yet hydrated, do nothing
  if (user.value === undefined) return

  // Unauthenticated — show popular users
  if (user.value === null) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, followers_count')
      .order('followers_count', { ascending: false })
      .limit(3)
    suggestions.value = (data ?? []) as Profile[]
    return
  }

  // Authenticated — must have a valid UUID id
  const userId = user.value.id
  if (!userId) return

  const { data: follows } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const alreadyFollowing = new Set(follows?.map((f) => f.following_id) ?? [])
  followingIds.value = alreadyFollowing

  const excludeIds = [...alreadyFollowing, userId]

  const { data } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_url, followers_count')
    .neq('id', userId)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .order('followers_count', { ascending: false })
    .limit(3)

  suggestions.value = (data ?? []) as Profile[]
}

// Only fetch once user state is resolved (not undefined)
watch(user, (newUser) => {
  if (newUser !== undefined) fetchSuggestions()
}, { immediate: true })

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
  followingIds.value = new Set(followingIds.value)
}
</script>