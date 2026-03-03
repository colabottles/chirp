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
          {{ profileData?.display_name || 'Profile' }}
        </h1>
        <p style="color: var(--color-text-tertiary); font-size: var(--text-sm);">
          {{ profileData?.posts_count ?? 0 }} posts
        </p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loadingProfile">
      <div style="height: 200px; background: var(--color-surface-2);" class="skeleton"></div>
      <div style="padding: var(--space-4) var(--space-6);">
        <div class="skeleton"
          style="width: 80px; height: 80px; border-radius: 50%; margin-bottom: var(--space-4);">
        </div>
        <div class="skeleton" style="width: 200px; height: 22px; margin-bottom: var(--space-2);">
        </div>
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-4);">
        </div>
        <div class="skeleton" style="width: 100%; height: 60px;"></div>
      </div>
    </template>

    <!-- Profile not found -->
    <div v-else-if="!profileData && !loadingProfile" class="empty-state" role="alert">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
          fill="none"
          stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2 class="empty-state-title">This account doesn't exist</h2>
      <p class="empty-state-text">Try searching for another username.</p>
    </div>

    <!-- Profile header -->
    <article v-else-if="profileData" :aria-label="`${profileData.display_name}'s profile`">
      <!-- Banner -->
      <div class="profile-banner" aria-hidden="true">
        <img v-if="profileData.banner_url" :src="profileData.banner_url"
          :alt="`${profileData.display_name}'s banner image`" />
      </div>

      <!-- Profile info -->
      <section class="profile-info-bar" aria-label="Profile information">
        <div class="profile-avatar-row">
          <div class="profile-avatar-large">
            <img v-if="profileData.avatar_url" :src="profileData.avatar_url"
              :alt="`${profileData.display_name}'s avatar`" width="80" height="80" />
            <div v-else class="post-avatar-placeholder"
              style="height: 100%; font-size: var(--text-xl);"
              aria-hidden="true">
              {{ profileData.display_name?.[0]?.toUpperCase() ?? '?' }}
            </div>
          </div>

          <!-- Edit / Follow button -->
          <div>
            <button v-if="isOwnProfile" class="profile-edit-btn" @click="showEditModal = true"
              aria-label="Edit your profile">Edit profile</button>

            <button v-else-if="user" class="profile-follow-btn" :class="{ following: isFollowing }"
              :aria-label="isFollowing ? `Unfollow ${profileData.display_name}` : `Follow ${profileData.display_name}`"
              :aria-pressed="isFollowing" @click="toggleFollow">
              {{ isFollowing ? 'Following' : 'Follow' }}
            </button>

            <NuxtLink v-else to="/auth/login" class="profile-follow-btn"
              style="text-decoration: none; display: inline-block;">Follow</NuxtLink>
          </div>
        </div>

        <!-- Names -->
        <h2 class="profile-display-name">
          {{ profileData.display_name }}
          <span v-if="profileData.is_verified" class="post-verified-badge"
            :title="`${profileData.display_name} is verified`">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="currentColor" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        </h2>
        <p class="profile-handle">@{{ profileData.username }}</p>

        <!-- Bio -->
        <p v-if="profileData.bio" class="profile-bio">{{ profileData.bio }}</p>

        <!-- Meta -->
        <div class="profile-meta" role="list">
          <div v-if="profileData.location" class="profile-meta-item" role="listitem">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {{ profileData.location }}
          </div>
          <div v-if="profileData.website" class="profile-meta-item" role="listitem">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path
                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <a :href="profileData.website" target="_blank" rel="noopener noreferrer">
              {{ profileData.website.replace(/^https?:\/\//, '') }}
            </a>
          </div>
          <div class="profile-meta-item" role="listitem">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <time :datetime="profileData.created_at">
              Joined {{ formatJoinDate(profileData.created_at) }}
            </time>
          </div>
        </div>

        <!-- Stats -->
        <div class="profile-stats" role="list">
          <NuxtLink :to="`/profile/${profileData.username}/following`" class="profile-stat-link"
            role="listitem">
            <span class="profile-stat-num">{{ profileData.following_count }}</span>
            &nbsp;Following
          </NuxtLink>
          <NuxtLink :to="`/profile/${profileData.username}/followers`" class="profile-stat-link"
            role="listitem">
            <span class="profile-stat-num">{{ profileData.followers_count }}</span>
            &nbsp;Followers
          </NuxtLink>
        </div>
      </section>

      <!-- Profile tabs -->
      <div role="tablist" aria-label="Profile content" class="feed-tabs-list"
        style="border-top: 1px solid var(--color-border-subtle);">
        <button role="tab" class="feed-tab-btn"
          :aria-selected="activeTab === 'posts' ? 'true' : 'false'"
          @click="activeTab = 'posts'">Posts</button>
        <button role="tab" class="feed-tab-btn"
          :aria-selected="activeTab === 'replies' ? 'true' : 'false'"
          @click="activeTab = 'replies'">Replies</button>
        <button role="tab" class="feed-tab-btn"
          :aria-selected="activeTab === 'media' ? 'true' : 'false'"
          @click="activeTab = 'media'">Media</button>
        <button role="tab" class="feed-tab-btn"
          :aria-selected="activeTab === 'likes' ? 'true' : 'false'"
          @click="activeTab = 'likes'">Likes</button>
      </div>

      <!-- Posts -->
      <section :aria-label="`${profileData.display_name}'s ${activeTab}`" aria-live="polite">
        <template v-if="loadingPosts">
          <PostSkeleton v-for="i in 3" :key="i" />
        </template>

        <div v-else-if="userPosts.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
              fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 class="empty-state-title" style="font-size: var(--text-xl);">No posts yet</h3>
          <p class="empty-state-text">
            {{ isOwnProfile ? "You haven't posted anything yet." : `${profileData.display_name} hasn't posted yet.` }}
          </p>
        </div>

        <PostCard v-for="post in userPosts" :key="post.id" :post="post" @deleted="removeUserPost" />
      </section>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { Post, Profile } from '~/types'
import type { Database } from '~/types/database.types'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const username = computed(() => route.params.username as string)
const activeTab = ref('posts')
const showEditModal = ref(false)

const profile = ref<Profile | null>(null)

// Computed ref gives vue-tsc a fully-typed, non-null Profile to narrow against
const profileData = computed(() => profile.value as Profile | null)

const loadingProfile = ref(true)
const isFollowing = ref(false)
const userPosts = ref<Post[]>([])
const loadingPosts = ref(false)

const isOwnProfile = computed(
  () => user.value && profileData.value?.id === user.value.id
)

useHead(() => ({
  title: profileData.value
    ? `${profileData.value.display_name} (@${profileData.value.username}) — Chirp`
    : 'Profile — Chirp',
}))

async function fetchProfileData() {
  if (!username.value || username.value === 'undefined') return
  loadingProfile.value = true
  profile.value = null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.value)
    .single()
  console.log('data:', data, 'username:', username.value)
  profile.value = (data ?? null) as unknown as Profile | null
  console.log('profile.value after set:', profile.value)
  loadingProfile.value = false
  if (profile.value) {
    fetchFollowStatus()
    fetchUserPosts()
  }
}

async function fetchFollowStatus() {
  if (!user.value?.id || !profile.value?.id) return
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.value.id)
    .eq('following_id', profile.value.id)
    .maybeSingle()
  isFollowing.value = !!data
}

async function fetchUserPosts() {
  if (!profile.value) return
  loadingPosts.value = true
  const { data } = await supabase
    .from('posts')
    .select('*, profile:profiles(*), reply_to:posts!reply_to_id(*, profile:profiles(*))')
    .eq('user_id', profile.value.id)
    .order('created_at', { ascending: false })
    .limit(30)
  userPosts.value = (data ?? []) as Post[]
  loadingPosts.value = false
}

async function toggleFollow() {
  if (!user.value || !profile.value) return
  const { announce } = useAnnouncer()

  if (isFollowing.value) {
    await supabase.from('follows')
      .delete()
      .eq('follower_id', user.value.id)
      .eq('following_id', profile.value.id)
    isFollowing.value = false
    profile.value.followers_count--
    announce(`Unfollowed ${profile.value.display_name}.`)
  } else {
    await supabase.from('follows')
      .insert({ follower_id: user.value.id, following_id: profile.value.id })
    isFollowing.value = true
    profile.value.followers_count++
    announce(`Now following ${profile.value.display_name}.`)
  }
}

function removeUserPost(id: string) {
  const idx = userPosts.value.findIndex((p) => p.id === id)
  if (idx !== -1) userPosts.value.splice(idx, 1)
}

function formatJoinDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

watch([username, user], () => {
  if (username.value && username.value !== 'undefined') fetchProfileData()
}, { immediate: true })

watch(activeTab, () => fetchUserPosts())
</script>