import { ref, watch, readonly } from 'vue'
import type { Database } from '~/types/database.types'

const unreadCount = ref(0)

// Singleton — only register the watch once across all composable instances
let _initialized = false

export function useNotifications() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()
  const unreadCount = useState<number>('notifications-unread', () => 0)
  const initialized = useState<boolean>('notifications-initialized', () => false)

  async function fetchUnreadCount() {
    if (!user.value?.id) {
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
    if (!user.value?.id) return
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.value.id)
      .eq('read', false)
    unreadCount.value = 0
  }

  function subscribeToNotifications() {
    if (!user.value?.id) return

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
        () => { unreadCount.value++ }
      )
      .subscribe()
  }

  if (!initialized.value) {
    initialized.value = true
    watch(user, (newUser) => {
      if (newUser?.id) {
        fetchUnreadCount()
        subscribeToNotifications()
      } else {
        unreadCount.value = 0
        initialized.value = false // reset so it re-subscribes on next login
      }
    }, { immediate: true })
  }

  return {
    unreadCount: readonly(unreadCount),
    fetchUnreadCount,
    markAllRead,
  }
}