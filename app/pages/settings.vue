<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="feed-tabs">
      <h1 class="feed-tabs-header" style="padding: var(--space-4) var(--space-6);">Settings</h1>
    </div>

    <div class="settings-layout">
      <!-- Sidebar nav -->
      <nav class="settings-nav" aria-label="Settings sections">
        <button
          v-for="section in sections"
          :key="section.id"
          class="settings-nav-item"
          :class="{ active: activeSection === section.id }"
          :aria-current="activeSection === section.id ? 'page' : undefined"
          @click="activeSection = section.id">
          {{ section.label }}
        </button>
      </nav>

      <!-- Content -->
      <main class="settings-content" aria-live="polite">

        <!-- ── Account ── -->
        <section v-if="activeSection === 'account'" aria-labelledby="account-heading">
          <h2 id="account-heading" class="settings-section-title">Account</h2>

          <form class="settings-form" @submit.prevent="saveAccount">
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Profile</legend>

              <div class="settings-field">
                <label for="display-name" class="settings-label">Display name</label>
                <input
                  id="display-name"
                  v-model="accountForm.display_name"
                  type="text"
                  class="form-input"
                  maxlength="50"
                  autocomplete="name"
                  :aria-describedby="accountErrors.display_name ? 'display-name-error' : undefined" />
                <p v-if="accountErrors.display_name" id="display-name-error" class="settings-error"
                  role="alert">
                  {{ accountErrors.display_name }}
                </p>
              </div>

              <div class="settings-field">
                <label for="username" class="settings-label">Username</label>
                <div class="settings-input-prefix">
                  <span class="settings-prefix" aria-hidden="true">@</span>
                  <input
                    id="username"
                    v-model="accountForm.username"
                    type="text"
                    class="form-input"
                    maxlength="30"
                    autocomplete="username"
                    pattern="[a-zA-Z0-9_]+"
                    :aria-describedby="accountErrors.username ? 'username-error' : 'username-hint'" />
                </div>
                <p id="username-hint" class="settings-hint">Letters, numbers, and underscores only.
                </p>
                <p v-if="accountErrors.username" id="username-error" class="settings-error"
                  role="alert">
                  {{ accountErrors.username }}
                </p>
              </div>

              <div class="settings-field">
                <label for="bio" class="settings-label">Bio</label>
                <textarea
                  id="bio"
                  v-model="accountForm.bio"
                  class="form-input"
                  rows="3"
                  maxlength="160"
                  style="resize: vertical;"
                  :aria-describedby="'bio-count'" />
                <p id="bio-count" class="settings-hint" aria-live="polite">
                  {{ accountForm.bio?.length ?? 0 }} / 160
                </p>
              </div>

              <div class="settings-field">
                <label for="website" class="settings-label">Website</label>
                <input
                  id="website"
                  v-model="accountForm.website"
                  type="url"
                  class="form-input"
                  placeholder="https://"
                  autocomplete="url" />
              </div>

              <div class="settings-field">
                <label for="location" class="settings-label">Location</label>
                <input
                  id="location"
                  v-model="accountForm.location"
                  type="text"
                  class="form-input"
                  maxlength="30"
                  autocomplete="address-level2" />
              </div>
            </fieldset>

            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Email</legend>
              <div class="settings-field">
                <label for="email" class="settings-label">Email address</label>
                <input
                  id="email"
                  v-model="accountForm.email"
                  type="email"
                  class="form-input"
                  autocomplete="email"
                  :aria-describedby="accountErrors.email ? 'email-error' : undefined" />
                <p v-if="accountErrors.email" id="email-error" class="settings-error" role="alert">
                  {{ accountErrors.email }}
                </p>
              </div>
            </fieldset>

            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Change password</legend>
              <div class="settings-field">
                <label for="new-password" class="settings-label">New password</label>
                <input
                  id="new-password"
                  v-model="accountForm.new_password"
                  type="password"
                  class="form-input"
                  autocomplete="new-password"
                  minlength="8"
                  :aria-describedby="accountErrors.new_password ? 'new-password-error' : 'new-password-hint'" />
                <p id="new-password-hint" class="settings-hint">Minimum 8 characters. Leave blank to
                  keep current password.</p>
                <p v-if="accountErrors.new_password" id="new-password-error" class="settings-error"
                  role="alert">
                  {{ accountErrors.new_password }}
                </p>
              </div>

              <div class="settings-field">
                <label for="confirm-password" class="settings-label">Confirm new password</label>
                <input
                  id="confirm-password"
                  v-model="accountForm.confirm_password"
                  type="password"
                  class="form-input"
                  autocomplete="new-password"
                  :aria-describedby="accountErrors.confirm_password ? 'confirm-password-error' : undefined" />
                <p v-if="accountErrors.confirm_password" id="confirm-password-error"
                  class="settings-error" role="alert">
                  {{ accountErrors.confirm_password }}
                </p>
              </div>
            </fieldset>

            <div class="settings-actions">
              <p v-if="accountSaved" class="settings-success" role="status" aria-live="polite">
                ✓ Changes saved.
              </p>
              <button
                type="submit"
                class="btn-primary"
                :disabled="savingAccount"
                :aria-busy="savingAccount">
                {{ savingAccount ? 'Saving…' : 'Save changes' }}
              </button>
            </div>
          </form>
        </section>

        <!-- ── Accessibility ── -->
        <section v-if="activeSection === 'accessibility'" aria-labelledby="a11y-heading">
          <h2 id="a11y-heading" class="settings-section-title">Accessibility</h2>

          <div class="settings-form">
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Images</legend>

              <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <label for="require-alt-text" class="settings-label">Require alt text on
                    images</label>
                  <p class="settings-hint">
                    When enabled, you won't be able to post images without providing descriptive alt
                    text.
                    This helps make your posts accessible to people using screen readers.
                  </p>
                </div>
                <button
                  id="require-alt-text"
                  role="switch"
                  :aria-checked="a11yPrefs.require_alt_text ? 'true' : 'false'"
                  class="settings-toggle"
                  :class="{ on: a11yPrefs.require_alt_text }"
                  :aria-label="`Require alt text on images: ${a11yPrefs.require_alt_text ? 'on' : 'off'}`"
                  @click="togglePref('require_alt_text')">
                  <span class="settings-toggle-thumb" aria-hidden="true"></span>
                </button>
              </div>
            </fieldset>

            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Motion &amp; display</legend>

              <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <label for="reduce-motion" class="settings-label">Reduce motion</label>
                  <p class="settings-hint">
                    Minimizes animations and transitions throughout the interface.
                    Recommended for users with vestibular disorders or motion sensitivity.
                  </p>
                </div>
                <button
                  id="reduce-motion"
                  role="switch"
                  :aria-checked="a11yPrefs.reduce_motion ? 'true' : 'false'"
                  class="settings-toggle"
                  :class="{ on: a11yPrefs.reduce_motion }"
                  :aria-label="`Reduce motion: ${a11yPrefs.reduce_motion ? 'on' : 'off'}`"
                  @click="togglePref('reduce_motion')">
                  <span class="settings-toggle-thumb" aria-hidden="true"></span>
                </button>
              </div>

              <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <label for="high-contrast" class="settings-label">High contrast</label>
                  <p class="settings-hint">
                    Increases contrast between text and backgrounds to improve readability.
                    Useful for users with low vision or colour sensitivity.
                  </p>
                </div>
                <button
                  id="high-contrast"
                  role="switch"
                  :aria-checked="a11yPrefs.high_contrast ? 'true' : 'false'"
                  class="settings-toggle"
                  :class="{ on: a11yPrefs.high_contrast }"
                  :aria-label="`High contrast: ${a11yPrefs.high_contrast ? 'on' : 'off'}`"
                  @click="togglePref('high_contrast')">
                  <span class="settings-toggle-thumb" aria-hidden="true"></span>
                </button>
              </div>
            </fieldset>

            <div class="settings-actions">
              <p v-if="a11ySaved" class="settings-success" role="status" aria-live="polite">
                ✓ Accessibility preferences saved.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'

definePageMeta({ layout: 'default' })
useHead({ title: 'Settings — Chirp' })

const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const { showToast } = useToast()
const { announce } = useAnnouncer()
const { prefs: a11yPrefsRaw, updatePrefs: updateA11yPrefs } = useAccessibilityPrefs()

// ── Sections ──────────────────────────────────────────────────────────────────

const sections = [
  { id: 'account', label: 'Account' },
  { id: 'accessibility', label: 'Accessibility' },
]
const activeSection = ref('account')

// ── Account form ──────────────────────────────────────────────────────────────

const accountForm = reactive({
  display_name: '',
  username: '',
  bio: '',
  website: '',
  location: '',
  email: '',
  new_password: '',
  confirm_password: '',
})

const accountErrors = reactive<Record<string, string>>({})
const savingAccount = ref(false)
const accountSaved = ref(false)

async function loadProfile() {
  if (!session.value?.user) return
  const { data } = await supabase
    .from('profiles')
    .select('display_name, username, bio, website, location')
    .eq('id', session.value.user.id)
    .single()
  if (data) {
    accountForm.display_name = data.display_name ?? ''
    accountForm.username = data.username ?? ''
    accountForm.bio = data.bio ?? ''
    accountForm.website = data.website ?? ''
    accountForm.location = data.location ?? ''
  }
  accountForm.email = session.value.user.email ?? ''
}

function validateAccount(): boolean {
  Object.keys(accountErrors).forEach((k) => delete accountErrors[k])

  if (!accountForm.display_name.trim()) {
    accountErrors.display_name = 'Display name is required.'
  }
  if (!accountForm.username.trim()) {
    accountErrors.username = 'Username is required.'
  } else if (!/^[a-zA-Z0-9_]+$/.test(accountForm.username)) {
    accountErrors.username = 'Username can only contain letters, numbers, and underscores.'
  }
  if (accountForm.new_password && accountForm.new_password.length < 8) {
    accountErrors.new_password = 'Password must be at least 8 characters.'
  }
  if (accountForm.new_password && accountForm.new_password !== accountForm.confirm_password) {
    accountErrors.confirm_password = 'Passwords do not match.'
  }

  return Object.keys(accountErrors).length === 0
}

async function saveAccount() {
  if (!session.value?.user) return
  if (!validateAccount()) return

  savingAccount.value = true
  accountSaved.value = false

  try {
    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: accountForm.display_name.trim(),
        username: accountForm.username.trim().toLowerCase(),
        bio: accountForm.bio.trim() || null,
        website: accountForm.website.trim() || null,
        location: accountForm.location.trim() || null,
      })
      .eq('id', session.value.user.id)

    if (profileError) throw profileError

    // Update email if changed
    if (accountForm.email !== session.value.user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: accountForm.email,
      })
      if (emailError) throw emailError
      showToast('Check your new email address to confirm the change.', 'info')
    }

    // Update password if provided
    if (accountForm.new_password) {
      const { error: pwError } = await supabase.auth.updateUser({
        password: accountForm.new_password,
      })
      if (pwError) throw pwError
      accountForm.new_password = ''
      accountForm.confirm_password = ''
    }

    accountSaved.value = true
    announce('Account settings saved.')
    showToast('Changes saved.', 'success')
    setTimeout(() => { accountSaved.value = false }, 4000)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save changes.'
    showToast(msg, 'error')
  } finally {
    savingAccount.value = false
  }
}

// ── Accessibility prefs ───────────────────────────────────────────────────────

const a11yPrefs = computed(() => a11yPrefsRaw.value)
const a11ySaved = ref(false)

async function togglePref(key: 'require_alt_text' | 'reduce_motion' | 'high_contrast') {
  await updateA11yPrefs({ [key]: !a11yPrefs.value[key] })
  a11ySaved.value = true
  announce(`${key.replace(/_/g, ' ')} ${a11yPrefs.value[key] ? 'enabled' : 'disabled'}.`)
  setTimeout(() => { a11ySaved.value = false }, 3000)
}

// ── Init ──────────────────────────────────────────────────────────────────────

watch(session, (s) => {
  if (s?.user) loadProfile()
}, { immediate: true })
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
}

.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  min-height: calc(100vh - 60px);
}

.settings-nav {
  border-right: 1px solid var(--color-border-subtle);
  padding: var(--space-4) 0;
  position: sticky;
  top: 0;
  height: fit-content;
}

.settings-nav-item {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-5);
  background: none;
  border: none;
  text-align: left;
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 0;
}

.settings-nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text-primary);
}

.settings-nav-item.active {
  color: var(--color-accent);
  background: var(--color-accent-dim);
  font-weight: 700;
}

.settings-nav-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.settings-content {
  padding: var(--space-6) var(--space-8);
  max-width: 600px;
}

.settings-section-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-6);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.settings-fieldset {
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.settings-legend {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 var(--space-2);
}

.settings-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.settings-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.settings-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  line-height: var(--leading-snug);
}

.settings-error {
  font-size: var(--text-xs);
  color: var(--color-error);
}

.settings-success {
  font-size: var(--text-sm);
  color: var(--color-success, #22c55e);
  font-weight: 500;
}

.settings-input-prefix {
  display: flex;
  align-items: center;
  gap: 0;
}

.settings-prefix {
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
  height: 42px;
  display: flex;
  align-items: center;
}

.settings-input-prefix .form-input {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  flex: 1;
}

.settings-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  justify-content: flex-end;
}

/* Toggle switch */
.settings-toggle-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.settings-toggle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.settings-toggle {
  flex-shrink: 0;
  width: 48px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 2px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  margin-top: 2px;
}

.settings-toggle.on {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.settings-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.settings-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-text-inverse, #fff);
  transition: transform var(--transition-fast);
  display: block;
}

.settings-toggle.on .settings-toggle-thumb {
  transform: translateX(20px);
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

@media (max-width: 700px) {
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    display: flex;
    overflow-x: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border-subtle);
    padding: var(--space-2) 0;
    position: static;
  }

  .settings-nav-item {
    white-space: nowrap;
    padding: var(--space-2) var(--space-4);
  }

  .settings-content {
    padding: var(--space-4);
  }
}
</style>