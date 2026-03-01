<template>
  <div>
    <!-- Feed tabs — tablist role for WCAG 4.1.2 -->
    <div class="feed-tabs">
      <h1 class="feed-tabs-header sr-only">Home Feed</h1>
      <div
        role="tablist"
        aria-label="Feed type"
        class="feed-tabs-list">
        <button
          id="tab-for-you"
          role="tab"
          class="feed-tab-btn"
          :aria-selected="feedType === 'for-you' ? 'true' : 'false'"
          aria-controls="tabpanel-feed"
          @click="setFeed('for-you')">
          For you
        </button>
        <button
          id="tab-following"
          role="tab"
          class="feed-tab-btn"
          :aria-selected="feedType === 'following' ? 'true' : 'false'"
          aria-controls="tabpanel-feed"
          @click="setFeed('following')"
          :disabled="!user"
          :title="!user ? 'Sign in to see posts from people you follow' : undefined">
          Following
        </button>
      </div>
    </div>

    <!-- Composer (only for authenticated users) -->
    <PostComposer
      v-if="user"
      @posted="handleNewPost" />

    <!-- Feed panel -->
    <div
      id="tabpanel-feed"
      role="tabpanel"
      :aria-labelledby="feedType === 'for-you' ? 'tab-for-you' : 'tab-following'">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <PostSkeleton v-for="i in 5" :key="i" />
      </template>

      <!-- Error state -->
      <div v-else-if="error" class="empty-state" role="alert">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
            fill="none"
            stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 class="empty-state-title">Something went wrong</h2>
        <p class="empty-state-text">{{ error }}</p>
        <button class="composer-submit-btn"
          style="margin-top: var(--space-4); width: auto; padding: var(--space-3) var(--space-6);"
          @click="fetchPosts(true)">Try again</button>
      </div>

      <!-- Empty state — Following feed with no follows -->
      <div v-else-if="feedType === 'following' && posts.length === 0 && !loading"
        class="empty-state"
        aria-live="polite" aria-atomic="true">
        <div class="empty-state-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
            fill="none"
            stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h2 class="empty-state-title">Follow people to see posts here</h2>
        <p class="empty-state-text">
          When you follow accounts, their posts will show up here.
        </p>
        <NuxtLink to="/explore" class="composer-submit-btn"
          style="text-decoration: none; display: inline-block; margin-top: var(--space-4); padding: var(--space-3) var(--space-6);">
          Find people to follow
        </NuxtLink>
      </div>

      <!-- Posts feed -->
      <section v-else aria-label="Posts" aria-live="polite" aria-atomic="false">
        <PostCard v-for="post in posts" :key="post.id" :post="post" @deleted="removePost" />

        <!-- Load more trigger -->
        <div v-if="hasMore" v-intersection-observer="loadMore" class="loading-center" role="status"
          :aria-label="loadingMore ? 'Loading more posts' : 'Scroll to load more posts'">
          <div v-if="loadingMore" class="spinner" aria-hidden="true"></div>
          <span class="sr-only">{{ loadingMore ? 'Loading more posts...' : '' }}</span>
        </div>

        <!-- End of feed -->
        <div v-if="!hasMore && posts.length > 0" class="empty-state"
          style="padding: var(--space-8);"
          role="status">
          <p class="text-secondary" style="font-size: var(--text-sm);">
            You've seen all posts. Check back later!
          </p>
        </div>
      </section>
    </div>

    <!-- Composer modal (teleported to body) -->
    <ComposerModal />
  </div>
</template>

<script setup lang="ts">
import type { FeedType, Post } from '~/types'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Home — Chirp',
})

const user = useSupabaseUser()
const feedType = ref<FeedType>('for-you')

const {
  posts,
  loading,
  loadingMore,
  hasMore,
  error,
  fetchPosts,
  prependPost,
  removePost,
} = useFeed(feedType)

function setFeed(type: FeedType) {
  feedType.value = type
}

function handleNewPost(post: Post) {
  prependPost(post)
}

// Intersection observer for infinite scroll
function loadMore() {
  if (!loadingMore.value && hasMore.value) {
    fetchPosts()
  }
}

// vIntersectionObserver directive
const vIntersectionObserver = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          binding.value()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
      ; (el as HTMLElement & { _observer: IntersectionObserver })._observer = observer
  },
  unmounted(el: HTMLElement & { _observer?: IntersectionObserver }) {
    el._observer?.disconnect()
  },
}
</script>