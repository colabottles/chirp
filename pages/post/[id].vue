<template>
  <div>
    <!-- Header -->
    <div class="feed-tabs"
      style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3) var(--space-5);">
      <button class="modal-close-btn" aria-label="Go back" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <h1 style="font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700;">
        Post
      </h1>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <PostSkeleton />
    </template>

    <!-- Post not found -->
    <div v-else-if="!post && !loading" class="empty-state" role="alert">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
          fill="none"
          stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 class="empty-state-title">Post not found</h2>
      <p class="empty-state-text">It may have been deleted.</p>
    </div>

    <!-- Post thread -->
    <article v-else-if="post" aria-label="Post thread">
      <!-- Parent post (if reply) -->
      <PostCard v-if="post.reply_to" :post="post.reply_to" :show-thread-line="true" />

      <!-- Main post — expanded view -->
      <section aria-label="Main post"
        style="padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border-subtle);">
        <!-- Author row -->
        <div
          style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
          <NuxtLink :to="`/profile/${post.profile?.username}`" class="post-avatar"
            style="width: 48px; height: 48px;"
            :aria-label="`View ${post.profile?.display_name}'s profile`">
            <img v-if="post.profile?.avatar_url" :src="post.profile.avatar_url"
              :alt="post.profile.display_name" width="48" height="48" />
            <div v-else class="post-avatar-placeholder" style="height: 100%;">
              {{ post.profile?.display_name?.[0]?.toUpperCase() }}
            </div>
          </NuxtLink>
          <div>
            <NuxtLink :to="`/profile/${post.profile?.username}`" class="post-author-name"
              style="font-size: var(--text-lg); display: block;">
              {{ post.profile?.display_name }}
            </NuxtLink>
            <span class="post-author-handle">@{{ post.profile?.username }}</span>
          </div>
        </div>

        <!-- Post content -->
        <div class="post-content"
          style="font-size: var(--text-2xl); line-height: 1.4; margin-bottom: var(--space-4);"
          v-html="parsedContent"></div>

        <!-- Image -->
        <figure v-if="post.image_url" class="post-image" style="margin-bottom: var(--space-4);">
          <img :src="post.image_url" alt="Post image" loading="lazy"
            style="width: 100%; display: block;" />
        </figure>

        <!-- Timestamp -->
        <time :datetime="post.created_at"
          style="color: var(--color-text-tertiary); font-size: var(--text-sm); display: block; margin-bottom: var(--space-4);">
          {{ formatFullDate(post.created_at) }}
        </time>

        <!-- Engagement stats -->
        <div
          style="display: flex; gap: var(--space-5); padding: var(--space-4) 0; border-top: 1px solid var(--color-border-subtle); border-bottom: 1px solid var(--color-border-subtle); margin-bottom: var(--space-2);"
          role="list" aria-label="Engagement statistics">
          <div role="listitem" style="font-size: var(--text-base);">
            <span style="font-weight: 700; color: var(--color-text-primary);">{{ post.reposts_count
              }}</span>
            <span style="color: var(--color-text-secondary);"> Reposts</span>
          </div>
          <div role="listitem" style="font-size: var(--text-base);">
            <span style="font-weight: 700; color: var(--color-text-primary);">{{ post.likes_count
              }}</span>
            <span style="color: var(--color-text-secondary);"> Likes</span>
          </div>
          <div role="listitem" style="font-size: var(--text-base);">
            <span style="font-weight: 700; color: var(--color-text-primary);">{{ post.views_count
              }}</span>
            <span style="color: var(--color-text-secondary);"> Views</span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="post-actions" style="justify-content: space-around; margin-left: 0;"
          role="group"
          :aria-label="`Actions for post by ${post.profile?.display_name}`">
          <button class="post-action-btn reply" :aria-label="`Reply. ${post.replies_count} replies`"
            @click="openReply">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button class="post-action-btn repost" :class="{ active: post.is_reposted }"
            :aria-label="`${post.is_reposted ? 'Undo repost' : 'Repost'}`"
            :aria-pressed="post.is_reposted" @click="toggleRepost">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="m17 1 4 4-4 4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 11V9a4 4 0 0 1 4-4h14" />
              <path stroke-linecap="round" stroke-linejoin="round" d="m7 23-4-4 4-4" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
          <button class="post-action-btn like" :class="{ active: post.is_liked }"
            :aria-label="`${post.is_liked ? 'Unlike' : 'Like'}`" :aria-pressed="post.is_liked"
            @click="toggleLike">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
              :fill="post.is_liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"
              aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <button class="post-action-btn bookmark" :aria-label="'Bookmark'" @click="bookmark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </section>

      <!-- Reply composer -->
      <PostComposer v-if="user" :reply-to="post" @posted="handleReply" />

      <!-- Replies -->
      <section aria-label="Replies" aria-live="polite">
        <template v-if="loadingReplies">
          <PostSkeleton v-for="i in 3" :key="i" />
        </template>
        <div v-else-if="replies.length === 0"
          style="padding: var(--space-8); text-align: center; color: var(--color-text-tertiary);">
          No replies yet. Be the first to reply!
        </div>
        <PostCard v-for="reply in replies" :key="reply.id" :post="reply" />
      </section>
    </article>

    <ComposerModal />
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { toggleLike: doLike, toggleRepost: doRepost, toggleBookmark } = usePostActions()
const { open: openComposerModal } = useComposerModal()

const post = ref<Post | null>(null)
const replies = ref<Post[]>([])
const loading = ref(true)
const loadingReplies = ref(true)

const postId = computed(() => route.params.id as string)

useHead(() => ({
  title: post.value
    ? `Post by ${post.value.profile?.display_name} — Chirp`
    : 'Post — Chirp',
}))

const parsedContent = computed(() => {
  if (!post.value?.content) return ''
  return post.value.content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/#(\w+)/g, '<a href="/explore?tag=$1" class="post-hashtag">#$1</a>')
    .replace(/@(\w+)/g, '<a href="/profile/$1" class="post-mention">@$1</a>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
})

async function fetchPost() {
  loading.value = true
  const { data } = await supabase
    .from('posts')
    .select(`
      *,
      profile:profiles(*),
      reply_to:posts!reply_to_id(*, profile:profiles(*))
    `)
    .eq('id', postId.value)
    .single()

  if (data && user.value) {
    const { data: like } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('post_id', data.id)
      .single()
    data.is_liked = !!like

    const { data: repost } = await supabase
      .from('posts')
      .select('id')
      .eq('user_id', user.value.id)
      .eq('repost_of_id', data.id)
      .single()
    data.is_reposted = !!repost
  }

  post.value = data as Post | null

  // Increment views
  if (data) {
    supabase
      .from('posts')
      .update({ views_count: (data.views_count ?? 0) + 1 })
      .eq('id', data.id)
      .then(() => { })
  }

  loading.value = false
  fetchReplies()
}

async function fetchReplies() {
  loadingReplies.value = true
  const { data } = await supabase
    .from('posts')
    .select('*, profile:profiles(*)')
    .eq('reply_to_id', postId.value)
    .order('created_at', { ascending: true })
    .limit(50)
  replies.value = (data ?? []) as Post[]
  loadingReplies.value = false
}

function openReply() {
  if (!post.value) return
  openComposerModal(post.value)
}

function handleReply(newReply: Post) {
  replies.value.push(newReply)
  if (post.value) post.value.replies_count++
}

function toggleLike() {
  if (!post.value) return
  doLike(post.value)
}

function toggleRepost() {
  if (!post.value) return
  doRepost(post.value)
}

function bookmark() {
  if (!post.value) return
  toggleBookmark(post.value, true)
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

watch(postId, () => fetchPost(), { immediate: true })
</script>