<template>
  <article
    class="post-card"
    :aria-labelledby="`post-author-${post.id}`"
    :data-post-id="post.id">
    <p v-if="post.repost_of_id" class="post-repost-banner">
      <NuxtLink v-if="post.profile" :to="`/profile/${post.profile.username}`"
        style="color: inherit; text-decoration: none; font-weight: 600;">{{
          post.profile.display_name }}</NuxtLink>
      reposted
    </p>

    <!-- Thread line -->
    <span v-if="showThreadLine" class="post-thread-line" aria-hidden="true"></span>

    <!-- Avatar -->
    <NuxtLink
      :to="`/profile/${displayProfile?.username}`"
      class="post-avatar"
      :aria-label="`View ${displayProfile?.display_name}'s profile`"
      tabindex="-1">
      <img
        v-if="displayProfile?.avatar_url"
        :src="displayProfile.avatar_url"
        :alt="displayProfile.display_name"
        loading="lazy"
        width="44"
        height="44" />
      <span v-else class="post-avatar-placeholder" aria-hidden="true">
        {{ displayProfile?.display_name?.[0]?.toUpperCase() || '?' }}
      </span>
    </NuxtLink>

    <!-- Post body — CSS subgrid fills remaining column -->
    <section class="post-body" :aria-labelledby="`post-author-${post.id}`">
      <!-- Header: author info + timestamp -->
      <header class="post-header">
        <NuxtLink :id="`post-author-${post.id}`" :to="`/profile/${displayProfile?.username}`"
          class="post-author-name">
          {{ displayProfile?.display_name }}
        </NuxtLink>

        <span v-if="displayProfile?.is_verified" class="post-verified-badge"
          :title="`${displayProfile.display_name} is verified`">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="sr-only">Verified account</span>
        </span>

        <span class="post-author-handle">@{{ displayProfile?.username }}</span>
        <span class="post-separator" aria-hidden="true">·</span>

        <time class="post-time" :datetime="post.created_at"
          :title="formatFullDate(post.created_at)">
          {{ formatRelativeTime(post.created_at) }}
        </time>

        <button
          v-if="isOwn || session"
          class="post-more-btn"
          :aria-label="`More options for post by ${displayProfile?.display_name}`"
          aria-haspopup="menu"
          @click.stop="showMenu = !showMenu">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>

        <PostContextMenu v-if="showMenu" :post="post" :is-own="isOwn" @close="showMenu = false"
          @deleted="emit('deleted', post.id)" />
      </header>

      <!-- Reply context -->
      <p v-if="post.reply_to_id && post.reply_to" class="post-reply-context">
        Replying to
        <NuxtLink :to="`/profile/${post.reply_to.profile?.username}`"
          style="color: var(--color-accent); text-decoration: none; font-weight: 500;">@{{
            post.reply_to.profile?.username }}</NuxtLink>
      </p>

      <!-- Post content -->
      <p class="post-content" v-html="parsedContent"></p>

      <!-- Post images -->
      <div
        v-if="imageUrls.length"
        class="post-image-grid"
        :class="`post-image-grid--${imageUrls.length}`"
        role="list"
        :aria-label="`${imageUrls.length} attached image${imageUrls.length > 1 ? 's' : ''}`">
        <figure
          v-for="(url, i) in imageUrls"
          :key="url"
          class="post-image-figure"
          role="listitem">
          <img
            :src="url"
            :alt="displayPost.image_alts?.[i] || ''"
            loading="lazy"
            class="post-image-thumb" />
          <AltBadge
            :alt-text="displayPost.image_alts?.[i] ?? ''"
            :size="a11yPrefs.alt_badge_size ?? 'small'"
            @click="altModal = { imageUrl: url, altText: displayPost.image_alts?.[i] ?? '', imageIndex: i }" />
        </figure>
      </div>

      <!-- Alt text modal -->
      <AltTextModal
        v-if="altModal"
        :image-url="altModal.imageUrl"
        :alt-text="altModal.altText"
        :image-index="altModal.imageIndex"
        :post-id="displayPost.id"
        @saved="(i: number, text: string) => { if (displayPost.image_alts) displayPost.image_alts[i] = text }"
        @close="altModal = null" />

      <!-- Quoted post -->
      <NuxtLink
        v-if="post.repost_of_id && post.repost_of"
        :to="`/post/${post.repost_of.id}`"
        class="post-quote"
        :aria-label="`View quoted post by ${post.repost_of.profile?.display_name}`">
        <header class="post-header" style="margin-bottom: var(--space-1);">
          <strong class="post-author-name" style="font-size: var(--text-sm);">{{
            post.repost_of.profile?.display_name }}</strong>
          <span class="post-author-handle" style="font-size: var(--text-xs);">@{{
            post.repost_of.profile?.username }}</span>
        </header>
        <p class="post-content"
          style="font-size: var(--text-sm); color: var(--color-text-secondary);"
          v-html="parseContent(post.repost_of.content)"></p>
      </NuxtLink>

      <!-- Action toolbar -->
      <menu class="post-actions"
        :aria-label="`Actions for post by ${displayProfile?.display_name}`">
        <li>
          <button class="post-action-btn reply"
            :aria-label="`Reply to this post. ${post.replies_count} replies`" @click="handleReply">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>{{ formatCount(post.replies_count) }}</span>
          </button>
        </li>
        <li>
          <button class="post-action-btn repost" :class="{ active: isReposted }"
            :aria-label="`${isReposted ? 'Undo repost' : 'Repost'}. ${post.reposts_count} reposts`"
            :aria-pressed="isReposted ? 'true' : 'false'" @click="toggleRepost">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round" d="m17 1 4 4-4 4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m7 23-4-4 4-4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span>{{ formatCount(post.reposts_count) }}</span>
          </button>
        </li>
        <li>
          <button class="post-action-btn like" :class="{ active: isLiked }"
            :aria-label="`${isLiked ? 'Unlike' : 'Like'} this post. ${post.likes_count} likes`"
            :aria-pressed="isLiked ? 'true' : 'false'" @click="toggleLike">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"
              aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>{{ formatCount(post.likes_count) }}</span>
          </button>
        </li>
        <li>
          <button class="post-action-btn bookmark" :class="{ active: isBookmarked }"
            :aria-label="`${isBookmarked ? 'Remove bookmark' : 'Bookmark'} this post`"
            :aria-pressed="isBookmarked ? 'true' : 'false'" @click="toggleBookmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              :fill="isBookmarked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"
              aria-hidden="true" focusable="false">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </li>
        <li>
          <output class="post-views" :aria-label="`${post.views_count} views`">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span aria-hidden="true">{{ formatCount(post.views_count) }}</span>
          </output>
        </li>
      </menu>
    </section>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Post, Profile } from '~/types'

const props = defineProps<{ post: Post; showThreadLine?: boolean }>()
const emit = defineEmits<{ deleted: [id: string]; liked: [post: Post]; reposted: [post: Post] }>()

const session = useSupabaseSession()
const { toggleLike: doLike, toggleRepost: doRepost, toggleBookmark: doBookmark } = usePostActions()
const { open: openReply } = useReplyModal()

const showMenu = ref(false)
const isBookmarked = ref(props.post.is_bookmarked ?? false)

// Keep in sync if prop changes (e.g. feed refresh)
watch(() => props.post.is_bookmarked, (val) => {
  isBookmarked.value = val ?? false
}, { immediate: true })

const displayPost = computed<Post>(() =>
  props.post.repost_of_id && props.post.repost_of ? props.post.repost_of as Post : props.post
)
const { prefs: a11yPrefs } = useAccessibilityPrefs()
const altModal = ref<{ imageUrl: string; altText: string; imageIndex: number } | null>(null)
const displayProfile = computed<Profile | undefined>(() =>
  props.post.repost_of_id && (props.post.repost_of as Post)?.profile
    ? (props.post.repost_of as Post).profile
    : props.post.profile
)
const isOwn = computed<boolean>(() => !!session.value?.user && props.post.user_id === session.value.user.id)
const isLiked = computed(() => props.post.is_liked ?? false)
const isReposted = computed(() => props.post.is_reposted ?? false)
const parsedContent = computed(() => parseContent(displayPost.value.content))

function parseContent(content: string): string {
  if (!content) return ''
  return content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/#(\w+)/g, '<a href="/explore?tag=$1" class="post-hashtag" aria-label="Search hashtag $1">#$1</a>')
    .replace(/@(\w+)/g, '<a href="/profile/$1" class="post-mention" aria-label="View profile of $1">@$1</a>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="post-link">$1</a>')
}
const imageUrls = computed<string[]>(() => {
  if (displayPost.value?.image_urls?.length) return displayPost.value.image_urls
  if (displayPost.value?.image_url) return [displayPost.value.image_url]
  return []
})

function handleReply() { openReply(props.post) }

async function toggleLike() { if (!session.value?.user) { navigateTo('/auth/login'); return } await doLike(props.post) }
async function toggleRepost() { if (!session.value?.user) { navigateTo('/auth/login'); return } await doRepost(props.post) }
async function toggleBookmark() {
  if (!session.value?.user) { navigateTo('/auth/login'); return }
  const next = !isBookmarked.value
  isBookmarked.value = next
  await doBookmark(props.post, next)
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr), now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  const diffMin = Math.floor(diffSec / 60), diffHour = Math.floor(diffMin / 60), diffDay = Math.floor(diffHour / 24)
  if (diffSec < 60) return `${diffSec}s`
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  if (diffDay < 7) return `${diffDay}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCount(n: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>

<style scoped>
.post-image-grid {
  display: grid;
  gap: 2px;
  margin-top: var(--space-3);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.post-image-grid--1 {
  grid-template-columns: 1fr;
}

.post-image-grid--2 {
  grid-template-columns: 1fr 1fr;
}

.post-image-grid--3 {
  grid-template-columns: 1fr 1fr;
}

.post-image-grid--3 .post-image-figure:first-child {
  grid-column: 1 / -1;
}

.post-image-grid--4 {
  grid-template-columns: 1fr 1fr;
}

.post-image-figure {
  position: relative;
  margin: 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-surface-2);
}

.post-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>