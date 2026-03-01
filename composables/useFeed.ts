// composables/useFeed.ts

import { ref, watch, isRef, readonly, onUnmounted } from 'vue'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useContentFilters } from '~/composables/useContentFilters'
import type { Ref } from 'vue'
import type { Post, FeedType } from '~/types'

export function useFeed(feedType: Ref<FeedType> | FeedType = 'for-you') {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const posts = ref<Post[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const error = ref<string | null>(null)
  const page = ref(0)
  const PER_PAGE = 20

  const type = isRef(feedType) ? feedType : ref(feedType)

  async function fetchPosts(reset = false) {
    if (reset) {
      posts.value = []
      page.value = 0
      hasMore.value = true
    }

    if (!hasMore.value) return

    if (page.value === 0) {
      loading.value = true
    } else {
      loadingMore.value = true
    }

    error.value = null

    try {
      const offset = page.value * PER_PAGE

      let query = supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(*),
          reply_to:posts!reply_to_id(
            *,
            profile:profiles(*)
          ),
          repost_of:posts!repost_of_id(
            *,
            profile:profiles(*)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + PER_PAGE - 1)

      // For "Following" feed, filter by followed users
      if (type.value === 'following' && user.value) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.value.id)

        const followingIds = follows?.map((f) => f.following_id) ?? []
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds)
        } else {
          posts.value = []
          loading.value = false
          return
        }
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // Fetch like/repost status for current user
      const postIds = data?.map((p) => p.id) ?? []
      let likedIds = new Set<string>()
      let repostedIds = new Set<string>()

      if (user.value && postIds.length > 0) {
        const [{ data: likes }, { data: reposts }] = await Promise.all([
          supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', user.value.id)
            .in('post_id', postIds),
          supabase
            .from('posts')
            .select('repost_of_id')
            .eq('user_id', user.value.id)
            .in('repost_of_id', postIds),
        ])
        likedIds = new Set(likes?.map((l) => l.post_id) ?? [])
        repostedIds = new Set(reposts?.map((r) => r.repost_of_id) ?? [])
      }

      const enriched = (data ?? []).map((p) => ({
        ...p,
        is_liked: likedIds.has(p.id),
        is_reposted: repostedIds.has(p.id),
      })) as Post[]

      const { filterPost } = useContentFilters()
      const filtered = enriched.filter(filterPost)

      if (reset) {
        posts.value = filtered
      } else {
        posts.value.push(...filtered)
      }

      hasMore.value = enriched.length === PER_PAGE
      page.value++
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Failed to load posts'
    } finally {
      loading.value = false
      loadingMore.value = false
    }
  }

  function prependPost(post: Post) {
    posts.value.unshift(post)
  }

  function removePost(id: string) {
    const idx = posts.value.findIndex((p) => p.id === id)
    if (idx !== -1) posts.value.splice(idx, 1)
  }

  // Realtime: prepend new posts
  function subscribeToFeed() {
    const channel = supabase
      .channel('feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        async (payload) => {
          if (payload.new.user_id === user.value?.id) return
          const { data } = await supabase
            .from('posts')
            .select('*, profile:profiles(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            const { filterPost } = useContentFilters()
            const post = data as Post
            if (filterPost(post)) {
              prependPost({ ...post, is_liked: false, is_reposted: false })
            }
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  watch(type, () => fetchPosts(true), { immediate: true })

  const unsubscribe = subscribeToFeed()
  onUnmounted(unsubscribe)

  return {
    posts: readonly(posts),
    loading: readonly(loading),
    loadingMore: readonly(loadingMore),
    hasMore: readonly(hasMore),
    error: readonly(error),
    fetchPosts,
    prependPost,
    removePost,
  }
}