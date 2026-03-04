// composables/useAccessibilityPrefs.ts
import { ref, watch, readonly } from 'vue'
import type { Database } from '~/types/database.types'

export interface AccessibilityPrefs {
  id?: string
  user_id?: string
  require_alt_text: boolean
  reduce_motion: boolean
  high_contrast: boolean
  alt_badge_size: 'small' | 'large'
  created_at?: string
  updated_at?: string
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  require_alt_text: false,
  reduce_motion: false,
  high_contrast: false,
  alt_badge_size: 'small',
}

// Module-level singleton so all composable instances share state
const prefs = ref<AccessibilityPrefs>({ ...DEFAULT_PREFS })
const loaded = ref(false)
const loading = ref(false)

export function useAccessibilityPrefs() {
  const supabase = useSupabaseClient<Database>()
  const session = useSupabaseSession()

  async function loadPrefs() {
    if (!session.value?.user) {
      prefs.value = { ...DEFAULT_PREFS }
      loaded.value = false
      return
    }
    loading.value = true
    const { data } = await supabase
      .from('accessibility_prefs')
      .select('*')
      .eq('user_id', session.value.user.id)
      .maybeSingle()
    if (data) {
      prefs.value = {
        ...DEFAULT_PREFS,
        ...(data as unknown as AccessibilityPrefs),
        alt_badge_size: ((data as unknown as AccessibilityPrefs).alt_badge_size === 'large' ? 'large' : 'small'),
      }
    } else {
      prefs.value = { ...DEFAULT_PREFS }
    }
    loaded.value = true
    loading.value = false
    applyPrefsToDOM()
  }

  async function updatePrefs(updates: Partial<AccessibilityPrefs>) {
    if (!session.value?.user) return
    const next = { ...prefs.value, ...updates }
    prefs.value = next
    const { data } = await supabase
      .from('accessibility_prefs')
      .upsert({
        user_id: session.value.user.id,
        require_alt_text: next.require_alt_text,
        reduce_motion: next.reduce_motion,
        high_contrast: next.high_contrast,
        alt_badge_size: next.alt_badge_size,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })  // ← add this
      .select()
      .single()
    if (data) {
      prefs.value = {
        ...DEFAULT_PREFS,
        ...(data as unknown as AccessibilityPrefs),
        alt_badge_size: ((data as unknown as AccessibilityPrefs).alt_badge_size === 'large' ? 'large' : 'small'),
      }
    }
    applyPrefsToDOM()
  }

  function applyPrefsToDOM() {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('reduce-motion', prefs.value.reduce_motion)
    document.documentElement.classList.toggle('high-contrast', prefs.value.high_contrast)
  }

  watch(session, (s) => {
    if (s?.user?.id) loadPrefs()
  }, { immediate: true })

  return {
    prefs: readonly(prefs),
    loaded: readonly(loaded),
    loading: readonly(loading),
    loadPrefs,
    updatePrefs,
    applyPrefsToDOM,
  }
}