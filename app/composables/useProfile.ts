import { ref, watch, readonly, onMounted } from 'vue'
import type { Database } from '~/types/database.types'
import type { Profile } from '~/types'

const userProfile = ref<Profile | null>(null)
const loading = ref(false)

export function useProfile() {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  async function fetchProfile(userId?: string) {
    const id = userId ?? user.value?.id
    if (!id) return
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      userProfile.value = data as Profile | null
    } catch (err) {
      userProfile.value = null
    } finally {
      loading.value = false
    }
  }

  async function fetchProfileByUsername(username: string): Promise<Profile | null> {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
    return data as Profile | null
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user.value) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()
    if (!error) {
      userProfile.value = data as Profile
    }
    return { error }
  }

  const session = useSupabaseSession()

  watch(session, (newSession) => {
    if (newSession?.user?.id) {
      fetchProfile(newSession.user.id)
    } else if (newSession === null) {
      userProfile.value = null
    }
  }, { immediate: true })

  return {
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    fetchProfile,
    fetchProfileByUsername,
    updateProfile,
  }
}