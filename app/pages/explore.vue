<template>
  <div>
    <!-- Header with search -->
    <div class="feed-tabs" style="padding: var(--space-4) var(--space-5);">
      <h1 class="sr-only">Explore</h1>
      <div class="search-box" style="width: 100%;">
        <label for="explore-search" class="sr-only">Search Chirp</label>
        <div style="position: relative;">
          <span class="search-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            id="explore-search"
            v-model="query"
            type="search"
            class="search-input"
            placeholder="Search posts, people, and hashtags"
            @keydown.enter="doSearch" />
        </div>
      </div>
    </div>

    <!-- Trending hashtags when no search -->
    <div v-if="!query?.trim() && !activeTag?.trim()">
      <div class="feed-tabs">
        <h2 class="feed-tabs-header">Trending topics</h2>
      </div>
      <div
        v-for="trend in trends"
        :key="trend.tag">
        <NuxtLink
          :to="`/explore?tag=${trend.tag}`"
          class="trend-item"
          style="display: block; padding: var(--space-4) var(--space-6);">
          <div class="trend-category">Trending in Chirp</div>
          <div class="trend-tag">#{{ trend.tag }}</div>
          <div class="trend-count">{{ trend.post_count.toLocaleString() }} posts</div>
        </NuxtLink>
      </div>
    </div>

    <!-- Search results or tag results -->
    <div v-else>
      <div class="feed-tabs">
        <h2 class="feed-tabs-header" style="font-size: var(--text-lg);" aria-live="polite">
          {{ activeTag ? `#${activeTag}` : `Results for "${query}"` }}
        </h2>
      </div>

      <!-- Results tabs -->
      <div role="tablist" aria-label="Search result type" class="feed-tabs-list">
        <button role="tab" class="feed-tab-btn"
          :aria-selected="resultTab === 'posts' ? 'true' : 'false'"
          @click="resultTab = 'posts'">Posts</button>
        <button role="tab" class="feed-tab-btn"
          :aria-selected="resultTab === 'people' ? 'true' : 'false'"
          @click="resultTab = 'people'">People</button>
      </div>

      <!-- Post results -->
      <section
        v-if="resultTab === 'posts'"
        aria-label="Post results"
        aria-live="polite">
        <template v-if="loadingPosts">
          <PostSkeleton v-for="i in 5" :key="i" />
        </template>
        <div v-else-if="postResults.length === 0" class="empty-state">
          <p class="empty-state-text">No posts found for this search.</p>
        </div>
        <PostCard v-for="post in postResults" :key="post.id" :post="post" />
      </section>

      <!-- People results -->
      <section v-if="resultTab === 'people'" aria-label="People results" aria-live="polite">
        <template v-if="loadingPeople">
          <div v-for="i in 3" :key="i" class="follow-user-item">
            <div class="skeleton" style="width: 44px; height: 44px; border-radius: 50%;"></div>
            <div style="flex: 1;">
              <div class="skeleton"
                style="width: 120px; height: 14px; margin-bottom: 6px; border-radius: 2px;"></div>
              <div class="skeleton" style="width: 80px; height: 12px; border-radius: 2px;"></div>
            </div>
          </div>
        </template>
        <div v-else-if="peopleResults.length === 0" class="empty-state">
          <p class="empty-state-text">No people found for this search.</p>
        </div>
        <div v-for="person in peopleResults" :key="person.id" class="follow-user-item"
          style="border-bottom: 1px solid var(--color-border-subtle); padding: var(--space-4) var(--space-6);">
          <NuxtLink :to="`/profile/${person.username}`" class="follow-user-avatar">
            <img v-if="person.avatar_url" :src="person.avatar_url" :alt="person.display_name"
              width="44"
              height="44" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
            <div v-else class="post-avatar-placeholder" style="height: 100%;">
              {{ person.display_name?.[0]?.toUpperCase() ?? '?' }} </div>
          </NuxtLink>
          <div class="follow-user-info">
            <NuxtLink :to="`/profile/${person.username}`" class="follow-user-name">{{
              person.display_name
              }}</NuxtLink>
            <span class="follow-user-handle">@{{ person.username }}</span>
            <p v-if="person.bio"
              style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: 4px;">
              {{
              person.bio }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post, Profile, Trend } from '~/types'

definePageMeta({ layout: 'default' })
useHead({ title: 'Explore — Chirp' })

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

const query = ref((route.query.q as string) || '')
const activeTag = ref((route.query.tag as string) || '')
const resultTab = ref('posts')

const trends = ref<Trend[]>([])
const postResults = ref<Post[]>([])
const peopleResults = ref<Profile[]>([])
const loadingPosts = ref(false)
const loadingPeople = ref(false)

async function fetchTrends() {
  const { data, error } = await supabase
    .from('hashtags')
    .select('*')
    .order('post_count', { ascending: false })
    .limit(10)

  if (error) {
    console.error('fetchTrends error:', error)
    return
  }

  console.log('trends:', data)

  trends.value = (data ?? []) as Trend[]
}

async function searchPosts(q: string) {
  loadingPosts.value = true

  const { data } = await supabase
    .from('posts')
    .select('*, profile:profiles(*)')
    .textSearch('content', q, { type: 'websearch' })
    .order('created_at', { ascending: false })
    .limit(20)

  postResults.value = (data ?? []) as Post[]
  loadingPosts.value = false
}

async function searchPeople(q: string) {
  loadingPeople.value = true

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(20)

  peopleResults.value = (data ?? []) as Profile[]
  loadingPeople.value = false
}

async function searchByTag(tag: string) {
  loadingPosts.value = true

  const { data } = await supabase
    .from('posts')
    .select('*, profile:profiles(*)')
    .ilike('content', `%#${tag}%`)
    .order('created_at', { ascending: false })
    .limit(30)

  postResults.value = (data ?? []) as Post[]
  loadingPosts.value = false
}

function doSearch() {
  if (query.value.trim()) {
    activeTag.value = ''
    router.replace({ query: { q: query.value } })
  }
}

watch(
  () => route.query,
  () => {
    query.value = (route.query.q as string) || ''
    activeTag.value = (route.query.tag as string) || ''

    if (activeTag.value) {
      query.value = '' // 🔥 important
      searchByTag(activeTag.value)
    } else if (query.value) {
      searchPosts(query.value)
      searchPeople(query.value)
    }
  },
  { immediate: true }
)

onMounted(fetchTrends)
</script>