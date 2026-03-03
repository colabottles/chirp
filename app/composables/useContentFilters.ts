// composables/useContentFilters.ts
// Loads all content filters for the current user and exposes
// a single filterPost(post) function used by the feed.

import { ref, computed, watch, readonly } from 'vue'
import type { Database } from '~/types/database.types'
import type { User } from '@supabase/supabase-js'
import type {
  Post,
  BlockedAccount,
  MutedAccount,
  MutedKeyword,
  ContentFilterPrefs,
} from '~/types'

// Module-level singletons so all composable instances share one fetch
const blockedIds = ref<Set<string>>(new Set())
const mutedIds = ref<Set<string>>(new Set())
const keywords = ref<MutedKeyword[]>([])
const prefs = ref<ContentFilterPrefs | null>(null)
const loaded = ref(false)

export function useContentFilters() {
  const supabase = useSupabaseClient<Database>()
  const session = useSupabaseSession()

  // ── Load everything ──────────────────────────────────────
  async function loadFilters() {
    if (!session.value?.user) {
      blockedIds.value = new Set()
      mutedIds.value = new Set()
      keywords.value = []
      prefs.value = null
      loaded.value = false
      return
    }

    const uid = session.value.user.id

    const [blockedRes, mutedRes, keywordRes, prefsRes] = await Promise.all([
      supabase.from('blocked_accounts').select('blocked_user_id').eq('user_id', uid),
      supabase.from('muted_accounts').select('muted_user_id').eq('user_id', uid),
      supabase.from('muted_keywords').select('*').eq('user_id', uid),
      supabase.from('content_filter_prefs').select('*').eq('user_id', uid).single(),
    ])

    blockedIds.value = new Set((blockedRes.data ?? []).map((r) => r.blocked_user_id))
    mutedIds.value = new Set((mutedRes.data ?? []).map((r) => r.muted_user_id))
    keywords.value = (keywordRes.data ?? []) as MutedKeyword[]
    prefs.value = (prefsRes.data ?? null) as ContentFilterPrefs | null
    loaded.value = true
  }

  // ── Core filter function ─────────────────────────────────
  // Returns true if the post should be SHOWN, false if hidden.
  function filterPost(post: Post): boolean {
    if (!session.value?.user) return true

    const authorId = post.profile?.id ?? post.user_id
    const isRepost = !!post.repost_of_id
    const isQuote = isRepost && !!post.content?.trim()

    // 1. Hide all reposts
    if (prefs.value?.hide_reposts && isRepost && !isQuote) return false

    // 2. Hide all quote posts
    if (prefs.value?.hide_quote_posts && isQuote) return false

    // 3. Blocked account — hide completely
    if (blockedIds.value.has(authorId)) return false

    // Also hide posts whose repost-source is from a blocked account
    const repostAuthorId = post.repost_of?.profile?.id ?? post.repost_of_id
    if (repostAuthorId && blockedIds.value.has(repostAuthorId)) return false

    // 4. Muted account — hide from feed (they can still see your posts)
    if (mutedIds.value.has(authorId)) return false

    // 5. Muted keywords / hashtags
    for (const mk of keywords.value) {
      // Skip expired keyword mutes
      if (mk.expires_at && new Date(mk.expires_at) < new Date()) continue

      const target = buildSearchTarget(post, mk.mute_reposts)
      if (matchesKeyword(target, mk.keyword, mk.match_whole_word)) return false
    }

    return true
  }

  function buildSearchTarget(post: Post, includeRepostContent: boolean): string {
    const parts = [post.content ?? '']
    if (includeRepostContent && post.repost_of?.content) {
      parts.push(post.repost_of.content)
    }
    return parts.join(' ').toLowerCase()
  }

  function matchesKeyword(text: string, keyword: string, wholeWord: boolean): boolean {
    const k = keyword.toLowerCase()
    if (!wholeWord) return text.includes(k)
    // Whole-word: not preceded/followed by word character
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(?<![\\w#])${escaped}(?![\\w])`, 'i').test(text)
  }

  // ── Blocked accounts CRUD ────────────────────────────────
  async function blockAccount(targetUserId: string) {
    if (!session.value?.user) return
    await supabase.from('blocked_accounts').insert({
      user_id: session.value.user.id,
      blocked_user_id: targetUserId,
    })
    blockedIds.value = new Set([...blockedIds.value, targetUserId])
    // Also remove any follow relationship
    await supabase.from('follows')
      .delete()
      .or(`follower_id.eq.${session.value.user.id},following_id.eq.${session.value.user.id}`)
      .or(`follower_id.eq.${targetUserId},following_id.eq.${targetUserId}`)
  }

  async function unblockAccount(targetUserId: string) {
    if (!session.value?.user) return
    await supabase.from('blocked_accounts')
      .delete()
      .eq('user_id', session.value.user.id)
      .eq('blocked_user_id', targetUserId)
    const next = new Set(blockedIds.value)
    next.delete(targetUserId)
    blockedIds.value = next
  }

  function isBlocked(targetUserId: string): boolean {
    return blockedIds.value.has(targetUserId)
  }

  // ── Muted accounts CRUD ──────────────────────────────────
  async function muteAccount(targetUserId: string) {
    if (!session.value?.user) return
    await supabase.from('muted_accounts').insert({
      user_id: session.value.user.id,
      muted_user_id: targetUserId,
    })
    mutedIds.value = new Set([...mutedIds.value, targetUserId])
  }

  async function unmuteAccount(targetUserId: string) {
    if (!session.value?.user) return
    await supabase.from('muted_accounts')
      .delete()
      .eq('user_id', session.value.user.id)
      .eq('muted_user_id', targetUserId)
    const next = new Set(mutedIds.value)
    next.delete(targetUserId)
    mutedIds.value = next
  }

  function isMuted(targetUserId: string): boolean {
    return mutedIds.value.has(targetUserId)
  }

  // ── Muted keywords CRUD ──────────────────────────────────
  async function addKeyword(
    keyword: string,
    options: { matchWholeWord?: boolean; muteReposts?: boolean; expiresAt?: string | null } = {}
  ) {
    if (!session.value?.user) return
    const { data } = await supabase.from('muted_keywords').insert({
      user_id: session.value.user.id,
      keyword: keyword.trim().toLowerCase(),
      match_whole_word: options.matchWholeWord ?? false,
      mute_reposts: options.muteReposts ?? true,
      expires_at: options.expiresAt ?? null,
    }).select().single()
    if (data) keywords.value = [...keywords.value, data as MutedKeyword]
  }

  async function removeKeyword(id: string) {
    if (!session.value?.user) return
    await supabase.from('muted_keywords').delete().eq('id', id)
    keywords.value = keywords.value.filter((k) => k.id !== id)
  }

  async function updateKeyword(id: string, updates: Partial<MutedKeyword>) {
    if (!session.value?.user) return
    const { data } = await supabase.from('muted_keywords')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (data) {
      keywords.value = keywords.value.map((k) =>
        k.id === id ? (data as MutedKeyword) : k
      )
    }
  }

  // ── Content filter prefs ─────────────────────────────────
  async function updatePrefs(updates: Partial<ContentFilterPrefs>) {
    if (!session.value?.user) return
    const { data } = await supabase.from('content_filter_prefs')
      .upsert({ user_id: session.value.user.id, ...updates })
      .select()
      .single()
    if (data) prefs.value = data as ContentFilterPrefs
  }

  // ── Full lists for settings page ─────────────────────────
  const blockedAccountsList = ref<BlockedAccount[]>([])
  const mutedAccountsList = ref<MutedAccount[]>([])

  async function loadBlockedList() {
    if (!session.value?.user) return
    const { data } = await supabase
      .from('blocked_accounts')
      .select('*, blocked_profile:profiles!blocked_user_id(*)')
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })
    blockedAccountsList.value = (data ?? []) as BlockedAccount[]
  }

  async function loadMutedList() {
    if (!session.value?.user) return
    const { data } = await supabase
      .from('muted_accounts')
      .select('*, muted_profile:profiles!muted_user_id(*)')
      .eq('user_id', session.value.user.id)
      .order('created_at', { ascending: false })
    mutedAccountsList.value = (data ?? []) as MutedAccount[]
  }

  watch(session, (s) => { if (s?.user?.id) loadFilters() }, { immediate: true })

  return {
    // State
    loaded: readonly(loaded),
    prefs: readonly(prefs),
    keywords: readonly(keywords),
    blockedAccountsList: readonly(blockedAccountsList),
    mutedAccountsList: readonly(mutedAccountsList),
    // Filter
    filterPost,
    // Blocked
    blockAccount,
    unblockAccount,
    isBlocked,
    loadBlockedList,
    // Muted accounts
    muteAccount,
    unmuteAccount,
    isMuted,
    loadMutedList,
    // Muted keywords
    addKeyword,
    removeKeyword,
    updateKeyword,
    // Prefs
    updatePrefs,
    loadFilters,
  }
}