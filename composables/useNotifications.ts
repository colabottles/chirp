// composables/useNotifications.ts

const unreadCount = ref(0)

export function useNotifications() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function fetchUnreadCount() {
    if (!user.value) {
      unreadCount.value = 0
      return
    }
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.value.id)
      .eq('read', false)

    unreadCount.value = count ?? 0
  }

  async function markAllRead() {
    if (!user.value) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.value.id)
      .eq('read', false)
    unreadCount.value = 0
  }

  // Subscribe to real-time notification inserts
  function subscribeToNotifications() {
    if (!user.value) return

    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.value.id}`,
        },
        () => {
          unreadCount.value++
        }
      )
      .subscribe()
  }

  watch(user, (newUser) => {
    if (newUser) {
      fetchUnreadCount()
      subscribeToNotifications()
    } else {
      unreadCount.value = 0
    }
  }, { immediate: true })

  return {
    unreadCount: readonly(unreadCount),
    fetchUnreadCount,
    markAllRead,
  }
}