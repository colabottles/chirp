<template>
  <div>
    <div class="feed-tabs">
      <h1 class="feed-tabs-header">Bookmarks</h1>
    </div>

    <template v-if="loading">
      <PostSkeleton v-for="i in 5" :key="i" />
    </template>

    <div v-else-if="posts.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
          fill="none"
          stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h2 class="empty-state-title">No bookmarks yet</h2>
      <p class="empty-state-text">Save posts you want to read later by bookmarking them.</p>
    </div>

    <section v-else aria-label="Bookmarked posts">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

definePageMeta({ layout: 'default' })
useHead({ title: 'Bookmarks — Chirp' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const posts = ref<Post[]>([])
const loading = ref(true)

async function fetchBookmarks() {
  if (!user.value) return
  loading.value = true
  const { data } = await supabase
    .from('bookmarks')
    .select('post:posts(*, profile:profiles(*))')
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(50)
  posts.value = data?.map((b) => b.post).filter(Boolean) as Post[] ?? []
  loading.value = false
}

watch(user, (u) => { if (u) fetchBookmarks() }, { immediate: true })
</script>