<template>
  <div>
    <!-- Back navigation -->
    <div
      class="feed-tabs"
      style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-5);">
      <button
        class="modal-close-btn"
        aria-label="Go back"
        @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <div>
        <h1
          style="font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--color-text-primary); line-height: 1.2;">
          {{ displayName }}
        </h1>
        <p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">Followers</p>
      </div>
    </div>

    <!-- Tabs -->
    <div role="tablist" aria-label="Follow lists" class="feed-tabs-list">
      <NuxtLink
        :to="`/profile/${username}/followers`"
        role="tab"
        class="feed-tab-btn"
        aria-selected="true">
        Followers
      </NuxtLink>
      <NuxtLink
        :to="`/profile/${username}/following`"
        role="tab"
        class="feed-tab-btn"
        aria-selected="false">
        Following
      </NuxtLink>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="follow-list-item">
        <div class="skeleton"
          style="width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;"></div>
        <div style="flex: 1;">
          <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-2);">
          </div>
          <div class="skeleton" style="width: 100px; height: 14px;"></div>
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else-if="followers.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
          fill="none"
          stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <h2 class="empty-state-title">No followers yet</h2>
      <p class="empty-state-text">When someone follows {{ isOwnProfile ? 'you' : displayName }},
        they'll
        appear here.</p>
    </div>

    <!-- Followers list -->
    <ul v-else class="follow-list" aria-label="Followers">
      <li v-for="follow in followers" :key="follow.follower_id" class="follow-list-item">
        <NuxtLink :to="`/profile/${follow.profile.username}`" class="follow-list-avatar"
          :aria-label="`View ${follow.profile.display_name}'s profile`">
          <img v-if="follow.profile.avatar_url" :src="follow.profile.avatar_url"
            :alt="`${follow.profile.display_name}'s avatar`" width="48" height="48" />
          <div v-else class="post-avatar-placeholder" aria-hidden="true">
            {{ follow.profile.display_name?.[0]?.toUpperCase() ?? '?' }}
          </div>
        </NuxtLink>

        <div class="follow-list-info">
          <NuxtLink :to="`/profile/${follow.profile.username}`" class="follow-list-name">
            {{ follow.profile.display_name }}
          </NuxtLink>
          <span class="follow-list-handle">@{{ follow.profile.username }}</span>
          <p v-if="follow.profile.bio" class="follow-list-bio">{{ follow.profile.bio }}</p>
        </div>

        <button v-if="currentUser && follow.profile.id !== currentUser.id"
          class="profile-follow-btn"
          :class="{ following: followingMap[follow.profile.id] }"
          :aria-label="followingMap[follow.profile.id] ? `Unfollow ${follow.profile.display_name}` : `Follow ${follow.profile.display_name}`"
          :aria-pressed="followingMap[follow.profile.id] ? 'true' : 'false'"
          @click="toggleFollow(follow.profile)">
          {{ followingMap[follow.profile.id] ? 'Following' : 'Follow' }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const currentUser = computed(() => session.value?.user ?? null)

const username = computed(() => route.params.username as string)
const displayName = ref('')
const loading = ref(true)
const followers = ref<any[]>([])
const followingMap = reactive<Record<string, boolean>>({})
const profileId = ref('')

const isOwnProfile = computed(() => currentUser.value?.id === profileId.value)

useHead(() => ({
  title: displayName.value ? `People following ${displayName.value} — Chirp` : 'Followers — Chirp',
}))

async function fetchFollowers() {
  loading.value = true

  // Get the profile first
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('username', username.value)
    .single()

  if (!profile) { loading.value = false; return }

  profileId.value = profile.id
  displayName.value = profile.display_name

  // Get followers with their profiles
  const { data } = await supabase
    .from('follows')
    .select('follower_id, profile:profiles!follower_id(id, username, display_name, avatar_url, bio)')
    .eq('following_id', profile.id)
    .order('created_at', { ascending: false })

  followers.value = (data ?? []) as any[]

  // Check which of these followers the current user follows back
  if (currentUser.value?.id && followers.value.length > 0) {
    const ids = followers.value.map((f) => f.profile.id)
    const { data: myFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.value.id)
      .in('following_id', ids)
    myFollows?.forEach((f) => { followingMap[f.following_id] = true })
  }

  loading.value = false
}

async function toggleFollow(profile: any) {
  if (!currentUser.value?.id) return
  if (followingMap[profile.id]) {
    const { error } = await supabase.from('follows')
      .delete()
      .eq('follower_id', currentUser.value.id)
      .eq('following_id', profile.id)
    if (error) { console.error('Unfollow error:', error); return }
    followingMap[profile.id] = false
  } else {
    const { error } = await supabase.from('follows')
      .insert({ follower_id: currentUser.value.id, following_id: profile.id })
    if (error) { console.error('Follow error:', error); return }
    followingMap[profile.id] = true
  }
}

watch(username, fetchFollowers, { immediate: true })
</script>

<style scoped>
.follow-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.follow-list-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.follow-list-item:last-child {
  border-bottom: none;
}

.follow-list-avatar {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: block;
}

.follow-list-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follow-list-info {
  flex: 1;
  min-width: 0;
}

.follow-list-name {
  display: block;
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-list-name:hover {
  text-decoration: underline;
}

.follow-list-handle {
  display: block;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.follow-list-bio {
  margin-top: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>