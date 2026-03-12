import { ref, watch } from 'vue'
import type { Database } from '~/types/database.types'

type AccentColor =
  | 'chirp' | 'teal' | 'purple' | 'green' | 'rose' | 'lobster'
  | 'yellow' | 'orange' | 'blue' | 'indigo' | 'violet' | 'pink'

export interface AccessibilityPrefs {
  id?: string
  user_id?: string
  require_alt_text: boolean
  reduce_motion: boolean
  reduce_flashing: boolean
  high_contrast: boolean
  alt_badge_size: 'small' | 'large'
  theme: 'system' | 'light' | 'dark' | 'high-contrast'
  accent_color: AccentColor
  text_size: 'small' | 'medium' | 'large'
  line_spacing: 'normal' | 'relaxed' | 'loose'
  focus_indicator: 'standard' | 'large'
  require_content_warning: boolean
  created_at?: string
  updated_at?: string
}

const DEFAULT_PREFS: AccessibilityPrefs = {
  require_alt_text: false,
  reduce_motion: false,
  reduce_flashing: false,
  high_contrast: false,
  alt_badge_size: 'small',
  theme: 'system',
  accent_color: 'chirp',
  text_size: 'medium',
  line_spacing: 'normal',
  focus_indicator: 'standard',
  require_content_warning: false,
}

// Module-level singleton so all composable instances share state
const prefs = ref<AccessibilityPrefs>({ ...DEFAULT_PREFS })
const loaded = ref(false)
const loading = ref(false)

export function useAccessibilityPrefs() {
  const supabase = useSupabaseClient<Database>()
  const session = useSupabaseSession()

  function resolveTheme(): 'light' | 'dark' | 'high-contrast' {
    const t = prefs.value.theme
    if (t === 'high-contrast') return 'high-contrast'
    if (t === 'light') return 'light'
    if (t === 'dark') return 'dark'
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  }

  function applyPrefsToDOM() {
    if (typeof document === 'undefined') return
    const el = document.documentElement
    el.classList.toggle('reduce-flashing', prefs.value.reduce_flashing)
    el.setAttribute('data-theme', resolveTheme())
    el.setAttribute('data-accent', prefs.value.accent_color ?? 'chirp')
    el.setAttribute('data-text-size', prefs.value.text_size ?? 'medium')
    el.setAttribute('data-line-spacing', prefs.value.line_spacing ?? 'normal')
    el.setAttribute('data-focus-indicator', prefs.value.focus_indicator ?? 'standard')
  }

  function castPrefs(raw: AccessibilityPrefs): AccessibilityPrefs {
    return {
      ...DEFAULT_PREFS,
      ...raw,
      alt_badge_size: (raw.alt_badge_size ?? 'small') as 'small' | 'large',
      theme: (raw.theme ?? 'system') as 'system' | 'light' | 'dark' | 'high-contrast',
      accent_color: (raw.accent_color ?? 'chirp') as AccentColor,
      text_size: (raw.text_size ?? 'medium') as 'small' | 'medium' | 'large',
      line_spacing: (raw.line_spacing ?? 'normal') as 'normal' | 'relaxed' | 'loose',
      focus_indicator: (raw.focus_indicator ?? 'standard') as 'standard' | 'large',
    }
  }

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

    prefs.value = data ? castPrefs(data as unknown as AccessibilityPrefs) : { ...DEFAULT_PREFS }
    loaded.value = true
    loading.value = false
    applyPrefsToDOM()
  }

  async function updatePrefs(updates: Partial<AccessibilityPrefs>) {
    if (!session.value?.user) return
    const next = { ...prefs.value, ...updates }
    prefs.value = next
    applyPrefsToDOM()

    const { data, error } = await supabase
      .from('accessibility_prefs')
      .upsert({
        user_id: session.value.user.id,
        require_alt_text: next.require_alt_text,
        reduce_motion: next.reduce_motion,
        reduce_flashing: next.reduce_flashing,
        high_contrast: next.high_contrast,
        alt_badge_size: next.alt_badge_size,
        accent_color: next.accent_color,
        theme: next.theme,
        text_size: next.text_size,
        line_spacing: next.line_spacing,
        focus_indicator: next.focus_indicator,
        require_content_warning: next.require_content_warning,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select('*')
      .single()

    console.log('upsert data:', data)
    console.log('upsert error:', error)

    if (error) {
      console.error('updatePrefs error:', error)
      return
    }

    if (data) {
      prefs.value = castPrefs(data as unknown as AccessibilityPrefs)
      applyPrefsToDOM()
    }
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
    resolveTheme,
  }
}