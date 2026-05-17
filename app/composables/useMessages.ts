// app/composables/useMessages.ts
export function useMessages() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()
  const unreadCount = useState<number>('messages-unread', () => 0)

  async function fetchUnreadCount() {
    if (!session.value?.user?.id) return
    const { data } = await supabase
      .from('conversations')
      .select('unread_count_1, unread_count_2, participant_1, participant_2')
      .or(`participant_1.eq.${session.value.user.id},participant_2.eq.${session.value.user.id}`)

    unreadCount.value = (data ?? []).reduce((sum, c) => {
      const mine = c.participant_1 === session.value!.user.id
        ? c.unread_count_1
        : c.unread_count_2
      return sum + (mine ?? 0)
    }, 0)
  }

  function subscribe() {
    if (!session.value?.user?.id) return
    const channel = supabase
      .channel('conversations-unread')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_1=eq.${session.value.user.id}`,
      }, () => fetchUnreadCount())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `participant_2=eq.${session.value.user.id}`,
      }, () => fetchUnreadCount())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }

  watch(session, (s) => {
    if (s?.user?.id) {
      fetchUnreadCount()
      subscribe()
    } else {
      unreadCount.value = 0
    }
  }, { immediate: true })

  return { unreadCount: readonly(unreadCount), fetchUnreadCount }
}