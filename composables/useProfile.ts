// composables/useProfile.ts

import type { Profile } from '~/types'

const userProfile = ref<Profile | null>(null)
const loading = ref(false)

export function useProfile() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  async function fetchProfile() {
    if (!user.value) {
      userProfile.value = null
      return
    }
    loading.value = true
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()
      userProfile.value = data as Profile
    } catch (err) {
      console.error('Failed to fetch profile:', err)
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

  // Watch for auth state changes
  watch(user, (newUser) => {
    if (newUser) {
      fetchProfile()
    } else {
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