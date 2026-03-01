<template>
  <article
    class="post-card"
    :aria-labelledby="`post-author-${post.id}`"
    :data-post-id="post.id">
    <!-- Repost indicator -->
    <div
      v-if="post.repost_of"
      class="post-repost-banner">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none"
        stroke="currentColor" stroke-width="2.5" aria-hidden="true" focusable="false">
        <path d="m17 1 4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
      <NuxtLink
        v-if="post.profile"
        :to="`/profile/${post.profile.username}`"
        style="color: inherit; text-decoration: none; font-weight: 600;">{{
          post.profile.display_name }}</NuxtLink>
      reposted
    </div>

    <!-- Thread line for replies -->
    <div
      v-if="showThreadLine"
      class="post-thread-line"
      aria-hidden="true"></div>

    <!-- Avatar column -->
    <div class="post-avatar-col">
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
        <div v-else class="post-avatar-placeholder" aria-hidden="true">
          {{ displayProfile?.display_name?.[0]?.toUpperCase() || '?' }}
        </div>
      </NuxtLink>
    </div>

    <!-- Post body -->
    <div class="post-body">
      <!-- Header: author info + timestamp -->
      <div class="post-header">
        <NuxtLink
          :id="`post-author-${post.id}`"
          :to="`/profile/${displayProfile?.username}`"
          class="post-author-name">
          {{ displayProfile?.display_name }}
        </NuxtLink>

        <!-- Verified badge — no aria-label on span, title is sufficient -->
        <span
          v-if="displayProfile?.is_verified"
          class="post-verified-badge"
          :title="`${displayProfile.display_name} is verified`">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="sr-only">Verified account</span>
        </span>

        <!-- Handle — descriptive text content, no aria-label needed on span -->
        <span class="post-author-handle">
          @{{ displayProfile?.username }}
        </span>

        <span class="post-separator" aria-hidden="true">·</span>

        <time
          class="post-time"
          :datetime="post.created_at"
          :title="formatFullDate(post.created_at)">
          {{ formatRelativeTime(post.created_at) }}
        </time>

        <!-- More options -->
        <button
          v-if="isOwn || user"
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

        <!-- Post context menu -->
        <PostContextMenu
          v-if="showMenu"
          :post="post"
          :is-own="isOwn"
          @close="showMenu = false"
          @deleted="emit('deleted', post.id)" />
      </div>

      <!-- Reply context -->
      <div
        v-if="post.reply_to_id && post.reply_to"
        class="post-reply-context"
        style="color: var(--color-text-tertiary); font-size: var(--text-sm); margin-bottom: var(--space-2);">
        Replying to
        <NuxtLink
          :to="`/profile/${post.reply_to.profile?.username}`"
          style="color: var(--color-accent); text-decoration: none; font-weight: 500;">@{{
            post.reply_to.profile?.username }}</NuxtLink>
      </div>

      <!-- Post content -->
      <div class="post-content" v-html="parsedContent"></div>

      <!-- Post image -->
      <figure v-if="displayPost?.image_url" class="post-image">
        <img
          :src="displayPost.image_url"
          alt="Post image"
          loading="lazy"
          style="width: 100%; display: block;" />
      </figure>

      <!-- Quoted post -->
      <NuxtLink
        v-if="post.repost_of && post.repost_of.id"
        :to="`/post/${post.repost_of.id}`"
        class="post-quote"
        :aria-label="`View quoted post by ${post.repost_of.profile?.display_name}`">
        <div class="post-header" style="margin-bottom: var(--space-1);">
          <strong class="post-author-name" style="font-size: var(--text-sm);">
            {{ post.repost_of.profile?.display_name }}
          </strong>
          <span class="post-author-handle" style="font-size: var(--text-xs);">
            @{{ post.repost_of.profile?.username }}
          </span>
        </div>
        <div
          class="post-content"
          style="font-size: var(--text-sm); color: var(--color-text-secondary);"
          v-html="parseContent(post.repost_of.content)"></div>
      </NuxtLink>

      <!-- Action buttons -->
      <div
        class="post-actions"
        role="group"
        :aria-label="`Actions for post by ${displayProfile?.display_name}`">
        <!-- Reply -->
        <button
          class="post-action-btn reply"
          :aria-label="`Reply to this post. ${post.replies_count} replies`"
          @click="handleReply">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>{{ formatCount(post.replies_count) }}</span>
        </button>

        <!-- Repost -->
        <button
          class="post-action-btn repost"
          :class="{ active: isReposted }"
          :aria-label="`${isReposted ? 'Undo repost' : 'Repost'}. ${post.reposts_count} reposts`"
          :aria-pressed="isReposted ? 'true' : 'false'"
          @click="toggleRepost">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round" d="m17 1 4 4-4 4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path stroke-linecap="round" stroke-linejoin="round" d="m7 23-4-4 4-4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span>{{ formatCount(post.reposts_count) }}</span>
        </button>

        <!-- Like -->
        <button
          class="post-action-btn like"
          :class="{ active: isLiked }"
          :aria-label="`${isLiked ? 'Unlike' : 'Like'} this post. ${post.likes_count} likes`"
          :aria-pressed="isLiked ? 'true' : 'false'"
          @click="toggleLike">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            :fill="isLiked ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
            focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>{{ formatCount(post.likes_count) }}</span>
        </button>

        <!-- Bookmark -->
        <button
          class="post-action-btn bookmark"
          :class="{ active: isBookmarked }"
          :aria-label="`${isBookmarked ? 'Remove bookmark' : 'Bookmark'} this post`"
          :aria-pressed="isBookmarked ? 'true' : 'false'"
          @click="toggleBookmark">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            :fill="isBookmarked ? 'currentColor' : 'none'"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
            focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <!-- Views — binding, not string literal -->
        <div
          class="post-views"
          :aria-label="`${post.views_count} views`">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span aria-hidden="true">{{ formatCount(post.views_count) }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSupabaseUser, navigateTo } from '#imports'
import type { Post, Profile } from '~/types'

const props = defineProps<{
  post: Post
  showThreadLine?: boolean
}>()

const emit = defineEmits<{
  deleted: [id: string]
  liked: [post: Post]
  reposted: [post: Post]
}>()

const user = useSupabaseUser()
const { toggleLike: doLike, toggleRepost: doRepost, toggleBookmark: doBookmark } = usePostActions()
const { open: openReply } = useReplyModal()

const showMenu = ref(false)

const displayPost = computed<Post>(() => props.post.repost_of ?? props.post)
const displayProfile = computed<Profile | undefined>(() =>
  props.post.repost_of?.profile || props.post.profile
)

// Explicit boolean — avoids 'boolean | null' error when user.value is null
const isOwn = computed<boolean>(() =>
  !!user.value && props.post.user_id === user.value.id
)

const isLiked = computed(() => props.post.is_liked ?? false)
const isReposted = computed(() => props.post.is_reposted ?? false)
const isBookmarked = ref(false)

const parsedContent = computed(() => parseContent(displayPost.value.content))

function parseContent(content: string): string {
  if (!content) return ''
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/#(\w+)/g, '<a href="/explore?tag=$1" class="post-hashtag" aria-label="Search hashtag $1">#$1</a>')
    .replace(/@(\w+)/g, '<a href="/profile/$1" class="post-mention" aria-label="View profile of $1">@$1</a>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="post-link">$1</a>')
}

// Wrapper — prevents PointerEvent being passed as Post to openReply
function handleReply() {
  openReply(props.post)
}

async function toggleLike() {
  if (!user.value) { navigateTo('/auth/login'); return }
  await doLike(props.post)
}

async function toggleRepost() {
  if (!user.value) { navigateTo('/auth/login'); return }
  await doRepost(props.post)
}

async function toggleBookmark() {
  if (!user.value) { navigateTo('/auth/login'); return }
  isBookmarked.value = !isBookmarked.value
  await doBookmark(props.post, isBookmarked.value)
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffSec < 60) return `${diffSec}s`
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  if (diffDay < 7) return `${diffDay}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCount(n: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
</script>