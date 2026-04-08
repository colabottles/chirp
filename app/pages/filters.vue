<template>
  <div>
    <div class="feed-tabs" style="position: sticky; top: 0; z-index: var(--z-sticky);">
      <div
        style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4) var(--space-5);">
        <NuxtLink to="/settings" class="post-action-btn" aria-label="Back to settings"
          style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
        </NuxtLink>
        <h1 style="font-size: var(--text-xl); font-weight: 700; margin: 0;">Content Filters</h1>
      </div>
    </div>

    <div style="max-width: 600px; padding: var(--space-6);">

      <!-- Post type filters -->
      <section aria-labelledby="post-type-heading" style="margin-bottom: var(--space-8);">
        <h2 id="post-type-heading"
          style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-4);">Post
          types</h2>
        <div class="filter-card">
          <div class="filter-toggle-row">
            <div>
              <div class="filter-toggle-label">Hide reposts</div>
              <div class="filter-toggle-desc">Reposts from all accounts will be hidden from your
                feed.</div>
            </div>
            <button
              role="switch"
              :aria-checked="prefs?.hide_reposts ? 'true' : 'false'"
              :class="['toggle-switch', { active: prefs?.hide_reposts }]"
              aria-label="Hide reposts"
              @click="togglePref('hide_reposts')"><span class="toggle-thumb"
                aria-hidden="true"></span></button>
          </div>
          <div class="filter-divider" aria-hidden="true"></div>
          <div class="filter-toggle-row">
            <div>
              <div class="filter-toggle-label">Hide quote posts</div>
              <div class="filter-toggle-desc">Quote posts from all accounts will be hidden from your
                feed.</div>
            </div>
            <button
              role="switch"
              :aria-checked="prefs?.hide_quote_posts ? 'true' : 'false'"
              :class="['toggle-switch', { active: prefs?.hide_quote_posts }]"
              aria-label="Hide quote posts"
              @click="togglePref('hide_quote_posts')"><span class="toggle-thumb"
                aria-hidden="true"></span></button>
          </div>
        </div>
      </section>

      <!-- Muted keywords -->
      <section aria-labelledby="keywords-heading" style="margin-bottom: var(--space-8);">
        <h2 id="keywords-heading"
          style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-2);">Muted
          words &amp; hashtags</h2>
        <p
          style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">
          Posts containing these words or hashtags will be hidden from your feed.</p>

        <form @submit.prevent="submitKeyword" style="margin-bottom: var(--space-4);">
          <div style="display: flex; gap: var(--space-3);">
            <label for="keyword-input" class="sr-only">Add word or hashtag to mute</label>
            <input id="keyword-input" v-model="newKeyword" type="text"
              placeholder="Word or #hashtag" class="search-input" style="flex: 1;"
              :aria-invalid="keywordError ? 'true' : undefined"
              :aria-describedby="keywordError ? 'keyword-error' : undefined" />
            <button type="submit" class="composer-submit-btn"
              style="width: auto; padding: var(--space-2) var(--space-5); flex-shrink: 0;"
              :disabled="!newKeyword.trim()">Add</button>
          </div>
          <div v-if="newKeyword.trim()"
            style="display: flex; gap: var(--space-4); margin-top: var(--space-3); flex-wrap: wrap;">
            <label
              style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--color-text-secondary);">
              <input type="checkbox" v-model="newKeywordWholeWord"
                style="accent-color: var(--color-accent);" /> Whole word only
            </label>
            <label
              style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--color-text-secondary);">
              <input type="checkbox" v-model="newKeywordMuteReposts"
                style="accent-color: var(--color-accent);" /> Also mute in reposts
            </label>
            <label
              style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--text-sm); color: var(--color-text-secondary);">
              Expires:
              <select v-model="newKeywordExpiry"
                style="background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-text-primary); padding: 2px var(--space-2); font-size: var(--text-sm);">
                <option value="">Never</option>
                <option value="1">1 day</option>
                <option value="7">1 week</option>
                <option value="30">30 days</option>
              </select>
            </label>
          </div>
          <p v-if="keywordError" id="keyword-error" role="alert"
            style="color: var(--color-error); font-size: var(--text-sm); margin-top: var(--space-2);">
            {{ keywordError }}</p>
        </form>

        <p v-if="keywords.length === 0"
          style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No muted words yet.
        </p>
        <ul v-else role="list"
          style="list-style: none; display: flex; flex-direction: column; gap: var(--space-2);"
          aria-label="Muted keywords">
          <li v-for="kw in keywords" :key="kw.id" class="filter-card"
            style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4);">
            <div>
              <span style="font-weight: 600; color: var(--color-text-primary);">{{ kw.keyword
                }}</span>
              <span
                style="font-size: var(--text-xs); color: var(--color-text-tertiary); margin-left: var(--space-2);">
                {{ [kw.match_whole_word ? 'Whole word' : '', kw.mute_reposts ? 'Incl. reposts' :
                  'Posts only', kw.expires_at ? 'Expires ' + formatExpiry(kw.expires_at) :
                  ''].filter(Boolean).join(' · ') }}
              </span>
            </div>
            <button class="post-action-btn" :aria-label="`Remove muted keyword ${kw.keyword}`"
              @click="removeKeyword(kw.id)"
              style="color: var(--color-error); width: 32px; height: 32px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
                focusable="false">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </li>
        </ul>
      </section>

      <!-- Muted accounts -->
      <section aria-labelledby="muted-heading" style="margin-bottom: var(--space-8);">
        <h2 id="muted-heading"
          style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-2);">Muted
          accounts</h2>
        <p
          style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">
          Their posts are hidden from your feed. They can still see and reply to your posts.</p>
        <p v-if="mutedAccountsList.length === 0"
          style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No muted accounts.
        </p>
        <ul v-else role="list" style="list-style: none;" aria-label="Muted accounts">
          <li v-for="m in mutedAccountsList" :key="m.id"
            style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border-subtle);">
            <NuxtLink :to="`/profile/${m.muted_profile?.username}`"
              style="display: flex; align-items: center; gap: var(--space-3); flex: 1; text-decoration: none;"
              :aria-label="`View ${m.muted_profile?.display_name}'s profile`">
              <div
                style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: var(--color-surface-3);">
                <img v-if="m.muted_profile?.avatar_url" :src="m.muted_profile.avatar_url"
                  :alt="m.muted_profile.display_name" width="40" height="40"
                  style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                <div v-else class="post-avatar-placeholder" style="height: 100%;">{{
                  m.muted_profile?.display_name?.[0]?.toUpperCase() }}</div>
              </div>
              <div>
                <div
                  style="font-weight: 600; color: var(--color-text-primary); font-size: var(--text-sm);">
                  {{ m.muted_profile?.display_name }}</div>
                <div style="color: var(--color-text-tertiary); font-size: var(--text-xs);">@{{
                  m.muted_profile?.username }}</div>
              </div>
            </NuxtLink>
            <button class="follow-btn" :aria-label="`Unmute ${m.muted_profile?.display_name}`"
              @click="handleUnmute(m.muted_user_id)">Unmute</button>
          </li>
        </ul>
      </section>

      <!-- Blocked accounts -->
      <section aria-labelledby="blocked-heading">
        <h2 id="blocked-heading"
          style="font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-2);">
          Blocked accounts</h2>
        <p
          style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-4);">
          Blocked accounts cannot see your posts, follow you, or interact with you.</p>
        <p v-if="blockedAccountsList.length === 0"
          style="color: var(--color-text-tertiary); font-size: var(--text-sm);">No blocked accounts.
        </p>
        <ul v-else role="list" style="list-style: none;" aria-label="Blocked accounts">
          <li v-for="b in blockedAccountsList" :key="b.id"
            style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border-subtle);">
            <NuxtLink :to="`/profile/${b.blocked_profile?.username}`"
              style="display: flex; align-items: center; gap: var(--space-3); flex: 1; text-decoration: none;"
              :aria-label="`View ${b.blocked_profile?.display_name}'s profile`">
              <div
                style="width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: var(--color-surface-3);">
                <img v-if="b.blocked_profile?.avatar_url" :src="b.blocked_profile.avatar_url"
                  :alt="b.blocked_profile.display_name" width="40" height="40"
                  style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                <div v-else class="post-avatar-placeholder" style="height: 100%;">{{
                  b.blocked_profile?.display_name?.[0]?.toUpperCase() }}</div>
              </div>
              <div>
                <div
                  style="font-weight: 600; color: var(--color-text-primary); font-size: var(--text-sm);">
                  {{ b.blocked_profile?.display_name }}</div>
                <div style="color: var(--color-text-tertiary); font-size: var(--text-xs);">@{{
                  b.blocked_profile?.username }}</div>
              </div>
            </NuxtLink>
            <button class="follow-btn follow-btn-unfollow"
              :aria-label="`Unblock ${b.blocked_profile?.display_name}`"
              @click="handleUnblock(b.blocked_user_id)">Unblock</button>
          </li>
        </ul>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'Content Filters — Chirp' })

const { prefs, keywords, blockedAccountsList, mutedAccountsList, updatePrefs, addKeyword, removeKeyword, unblockAccount, unmuteAccount, loadBlockedList, loadMutedList } = useContentFilters()
const { announce } = useA11yAnnouncer()
const { showToast } = useToast()

const newKeyword = ref('')
const newKeywordWholeWord = ref(false)
const newKeywordMuteReposts = ref(true)
const newKeywordExpiry = ref('')
const keywordError = ref('')

async function togglePref(key: 'hide_reposts' | 'hide_quote_posts') {
  const current = prefs.value?.[key] ?? false
  await updatePrefs({ [key]: !current })
  announce(`${key === 'hide_reposts' ? 'Reposts' : 'Quote posts'} ${!current ? 'hidden' : 'visible'}.`)
}

async function submitKeyword() {
  const kw = newKeyword.value.trim().toLowerCase()
  if (!kw) return
  if (keywords.value.some((k) => k.keyword === kw)) {
    keywordError.value = `"${kw}" is already muted.`
    return
  }
  keywordError.value = ''
  let expiresAt: string | null = null
  if (newKeywordExpiry.value) {
    const d = new Date()
    d.setDate(d.getDate() + parseInt(newKeywordExpiry.value))
    expiresAt = d.toISOString()
  }
  await addKeyword(kw, { matchWholeWord: newKeywordWholeWord.value, muteReposts: newKeywordMuteReposts.value, expiresAt })
  announce(`"${kw}" added to muted words.`)
  showToast(`"${kw}" muted.`, 'success')
  newKeyword.value = ''
  newKeywordWholeWord.value = false
  newKeywordMuteReposts.value = true
  newKeywordExpiry.value = ''
}

async function handleUnmute(userId: string) {
  await unmuteAccount(userId)
  await loadMutedList()
  announce('Account unmuted.')
  showToast('Account unmuted.', 'info')
}

async function handleUnblock(userId: string) {
  await unblockAccount(userId)
  await loadBlockedList()
  announce('Account unblocked.')
  showToast('Account unblocked.', 'info')
}

function formatExpiry(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

onMounted(() => { loadBlockedList(); loadMutedList() })
</script>