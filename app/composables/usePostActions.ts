// composables/usePostActions.ts

import type { Post } from '~/types'

export function usePostActions() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession() // ← replace useSupabaseUser()
  const { announce } = useAnnouncer()
  const { showToast } = useToast()

  async function toggleLike(post: Post) {
    if (!session.value?.user) return

    const wasLiked = post.is_liked

    // Optimistic update
    post.is_liked = !wasLiked
    post.likes_count += wasLiked ? -1 : 1

    try {
      if (wasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', session.value?.user.id)
          .eq('post_id', post.id)
        if (error) throw error
        announce('Post unliked.')
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: session.value?.user.id, post_id: post.id })
        if (error) throw error
        announce('Post liked.')
      }
    } catch (err) {
      // Revert optimistic update
      post.is_liked = wasLiked
      post.likes_count += wasLiked ? 1 : -1
      showToast('Failed to update like. Please try again.', 'error')
    }
  }

  async function toggleRepost(post: Post) {
    if (!session.value?.user) return

    const wasReposted = post.is_reposted

    // Optimistic update
    post.is_reposted = !wasReposted
    post.reposts_count += wasReposted ? -1 : 1

    try {
      if (wasReposted) {
        // Delete the repost
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('user_id', session.value?.user.id)
          .eq('repost_of_id', post.id)
        if (error) throw error
        announce('Repost removed.')
      } else {
        const { error } = await supabase
          .from('posts')
          .insert({
            user_id: session.value?.user.id,
            content: '',
            repost_of_id: post.id,
          })
        if (error) throw error
        announce('Post reposted.')
        showToast('Reposted!', 'success')
      }
    } catch (err) {
      post.is_reposted = wasReposted
      post.reposts_count += wasReposted ? 1 : -1
      showToast('Failed to repost. Please try again.', 'error')
    }
  }

  async function toggleBookmark(post: Post, shouldBookmark: boolean) {
    if (!session.value?.user) return

    try {
      if (shouldBookmark) {
        await supabase
          .from('bookmarks')
          .insert({ user_id: session.value?.user.id, post_id: post.id })
        announce('Post added to bookmarks.')
        showToast('Added to Bookmarks', 'success')
      } else {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', session.value?.user.id)
          .eq('post_id', post.id)
        announce('Post removed from bookmarks.')
        showToast('Removed from Bookmarks', 'info')
      }
    } catch (err) {
      showToast('Failed to update bookmark.', 'error')
    }
  }

  async function deletePost(postId: string): Promise<boolean> {
    if (!session.value?.user) return false

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', session.value?.user.id)

    if (error) {
      showToast('Failed to delete post.', 'error')
      return false
    }

    announce('Post deleted.')
    showToast('Post deleted.', 'info')
    return true
  }

  return { toggleLike, toggleRepost, toggleBookmark, deletePost }
}