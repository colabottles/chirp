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

            <!-- Images -->
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Images</legend>

              <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <label for="require-alt-text" class="settings-label">Require alt text on
                    images</label>
                  <p class="settings-hint">
                    When enabled, you won't be able to post images without providing descriptive alt
                    text. This helps make your posts accessible to people using screen readers.
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

              <!-- Require content warning -->
              <div class="settings-toggle-row">
                <div class="settings-toggle-info">
                  <label for="require-content-warning" class="settings-label">
                    Require content warning on videos and GIFs
                  </label>
                  <p class="settings-hint">
                    When enabled, you'll be reminded to add a content warning before posting videos,
                    GIFs, or other flashing media. Helps protect users sensitive to motion or
                    flashing content.
                  </p>
                </div>
                <button
                  id="require-content-warning"
                  role="switch"
                  :aria-checked="a11yPrefs.require_content_warning ? 'true' : 'false'"
                  class="settings-toggle"
                  :class="{ on: a11yPrefs.require_content_warning }"
                  :aria-label="`Require content warning on videos and GIFs: ${a11yPrefs.require_content_warning ? 'on' : 'off'}`"
                  @click="togglePref('require_content_warning')">
                  <span class="settings-toggle-thumb" aria-hidden="true"></span>
                </button>
              </div>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Alt badge size</p>
                  <p class="settings-hint">
                    The ALT badge appears in the bottom-right corner of images that have alt text.
                    Click it to read the description. Choose small for a subtle indicator or large
                    for easier tapping.
                  </p>
                </div>
                <fieldset class="alt-badge-size-group">
                  <legend class="sr-only">Alt badge size</legend>
                  <label class="alt-badge-option">
                    <input
                      type="radio"
                      name="alt-badge-size"
                      value="small"
                      :checked="a11yPrefs.alt_badge_size !== 'large'"
                      @change="togglePref('alt_badge_size', 'small')" />
                    <span class="badge-preview badge-preview--small">ALT</span>
                    <span class="alt-badge-option-label">Small</span>
                  </label>
                  <label class="alt-badge-option">
                    <input
                      type="radio"
                      name="alt-badge-size"
                      value="large"
                      :checked="a11yPrefs.alt_badge_size === 'large'"
                      @change="togglePref('alt_badge_size', 'large')" />
                    <span class="badge-preview badge-preview--large">ALT</span>
                    <span class="alt-badge-option-label">Large</span>
                  </label>
                </fieldset>
              </div>
            </fieldset>

            <!-- Motion -->
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Motion</legend>

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
                  <p class="settings-label">Reduce flashing</p>
                  <p class="settings-hint">
                    Stops pulsing skeletons, spinners, and blinking badges. Recommended for
                    photosensitivity and epilepsy.
                  </p>
                </div>
                <button
                  role="switch"
                  :aria-checked="a11yPrefs.reduce_flashing ? 'true' : 'false'"
                  class="settings-toggle"
                  :class="{ on: a11yPrefs.reduce_flashing }"
                  :aria-label="`Reduce flashing: ${a11yPrefs.reduce_flashing ? 'on' : 'off'}`"
                  @click="togglePref('reduce_flashing')">
                  <span class="settings-toggle-thumb" aria-hidden="true"></span>
                </button>
              </div>
            </fieldset>

            <!-- Typography -->
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Typography</legend>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Text size</p>
                  <p class="settings-hint">Adjust the base font size across Chirp.</p>
                </div>
                <fieldset class="radio-group">
                  <legend class="sr-only">Text size</legend>
                  <label class="radio-option" v-for="opt in textSizeOptions" :key="opt.value">
                    <input
                      type="radio"
                      name="text_size"
                      :value="opt.value"
                      :checked="a11yPrefs.text_size === opt.value"
                      @change="togglePref('text_size', opt.value as 'small' | 'medium' | 'large')" />
                    <span>{{ opt.label }}</span>
                  </label>
                </fieldset>
              </div>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Line spacing</p>
                  <p class="settings-hint">Increase space between lines of text. Helps with
                    readability and dyslexia.</p>
                </div>
                <fieldset class="radio-group">
                  <legend class="sr-only">Line spacing</legend>
                  <label class="radio-option" v-for="opt in lineSpacingOptions" :key="opt.value">
                    <input
                      type="radio"
                      name="line_spacing"
                      :value="opt.value"
                      :checked="a11yPrefs.line_spacing === opt.value"
                      @change="togglePref('line_spacing', opt.value as 'normal' | 'relaxed' | 'loose')" />
                    <span>{{ opt.label }}</span>
                  </label>
                </fieldset>
              </div>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Focus indicator</p>
                  <p class="settings-hint">Enlarges the keyboard focus ring sitewide for low vision
                    users.</p>
                </div>
                <fieldset class="radio-group">
                  <legend class="sr-only">Focus indicator size</legend>
                  <label class="radio-option" v-for="opt in focusIndicatorOptions" :key="opt.value">
                    <input
                      type="radio"
                      name="focus_indicator"
                      :value="opt.value"
                      :checked="a11yPrefs.focus_indicator === opt.value"
                      @change="togglePref('focus_indicator', opt.value as 'standard' | 'large')" />
                    <span>{{ opt.label }}</span>
                  </label>
                </fieldset>
              </div>
            </fieldset>

            <!-- Personalization -->
            <fieldset class="settings-fieldset">
              <legend class="settings-legend">Personalization</legend>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Theme</p>
                  <p class="settings-hint">
                    Choose how Chirp looks to you. System follows your device's light or dark mode
                    preference.
                  </p>
                </div>
                <fieldset class="radio-group">
                  <legend class="sr-only">Theme</legend>
                  <label class="radio-option" v-for="opt in themeOptions" :key="opt.value">
                    <input
                      type="radio"
                      name="theme"
                      :value="opt.value"
                      :checked="a11yPrefs.theme === opt.value"
                      @change="togglePref('theme', opt.value)" />
                    <span>{{ opt.label }}</span>
                  </label>
                </fieldset>
              </div>

              <div class="settings-toggle-row" style="align-items: flex-start;">
                <div class="settings-toggle-info">
                  <p class="settings-label">Accent color</p>
                  <p class="settings-hint">
                    Choose a highlight color for buttons, links, and interactive elements.
                  </p>
                  <p class="settings-hint">
                    <span class="attention">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                        width="16" height="16"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                        focusable="false">
                        <path
                          d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Attention:
                    </span>
                    <br>
                    Some colors may not be accessible in all color modes. For example, Chirp green
                    in light mode does not meet WCAG accessibility contrast standards.
                  </p>
                </div>
                <div class="accent-swatches" role="radiogroup" aria-label="Accent color">
                  <label
                    v-for="color in accentColors"
                    :key="color.value"
                    class="accent-swatch-label"
                    :title="color.label">
                    <input
                      type="radio"
                      name="accent_color"
                      :value="color.value"
                      :checked="a11yPrefs.accent_color === color.value"
                      class="sr-only"
                      @change="togglePref('accent_color', color.value)" />
                    <span
                      class="accent-swatch"
                      :style="{ background: color.hex }"
                      :aria-label="color.label">
                      <svg
                        v-if="a11yPrefs.accent_color === color.value"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="14" height="14"
                        fill="none"
                        stroke="#fff"
                        stroke-width="3"
                        aria-hidden="true"
                        focusable="false">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  </label>
                </div>
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
import type { AccessibilityPrefs } from '~/composables/useAccessibilityPrefs'

definePageMeta({ layout: 'default' })
useHead({ title: 'Settings — Chirp' })

const themeOptions = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'high-contrast', label: 'High contrast' },
]

type AccentColor = 'chirp' | 'teal' | 'purple' | 'green' | 'rose' | 'lobster' | 'yellow' | 'orange' | 'blue' | 'indigo' | 'violet' | 'pink'

const accentColors: { value: AccentColor; label: string; hex: string }[] = [
  { value: 'chirp', label: 'Chirp', hex: '#00DC82' },
  { value: 'teal', label: 'Teal', hex: '#0D9488' },
  { value: 'purple', label: 'Purple', hex: '#663399' },
  { value: 'green', label: 'Green', hex: '#16A34A' },
  { value: 'rose', label: 'Rose', hex: '#E11D48' },
  { value: 'lobster', label: 'Lobster', hex: '#C0392B' },
  { value: 'yellow', label: 'Yellow', hex: '#CA8A04' },
  { value: 'orange', label: 'Orange', hex: '#EA580C' },
  { value: 'blue', label: 'Blue', hex: '#2563EB' },
  { value: 'indigo', label: 'Indigo', hex: '#4338CA' },
  { value: 'violet', label: 'Violet', hex: '#6D28D9' },
  { value: 'pink', label: 'Pink', hex: '#DB2777' },
]

const textSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const lineSpacingOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'loose', label: 'Loose' },
]

const focusIndicatorOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'large', label: 'Large' },
]

const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const { showToast } = useToast()
const { announce } = useAnnouncer()
const { prefs: a11yPrefs, updatePrefs: updateA11yPrefs } = useAccessibilityPrefs()

const sections = [
  { id: 'account', label: 'Account' },
  { id: 'accessibility', label: 'Accessibility' },
]
const activeSection = ref('account')

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
  if (!accountForm.display_name.trim())
    accountErrors.display_name = 'Display name is required.'
  if (!accountForm.username.trim())
    accountErrors.username = 'Username is required.'
  else if (!/^[a-zA-Z0-9_]+$/.test(accountForm.username))
    accountErrors.username = 'Username can only contain letters, numbers, and underscores.'
  if (accountForm.new_password && accountForm.new_password.length < 8)
    accountErrors.new_password = 'Password must be at least 8 characters.'
  if (accountForm.new_password && accountForm.new_password !== accountForm.confirm_password)
    accountErrors.confirm_password = 'Passwords do not match.'
  return Object.keys(accountErrors).length === 0
}

async function saveAccount() {
  if (!session.value?.user) return
  if (!validateAccount()) return
  savingAccount.value = true
  accountSaved.value = false
  try {
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

    if (accountForm.email !== session.value.user.email) {
      const { error: emailError } = await supabase.auth.updateUser({ email: accountForm.email })
      if (emailError) throw emailError
      showToast('Check your new email address to confirm the change.', 'info')
    }
    if (accountForm.new_password) {
      const { error: pwError } = await supabase.auth.updateUser({ password: accountForm.new_password })
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

const a11ySaved = ref(false)

async function togglePref(key: keyof AccessibilityPrefs, value?: unknown) {
  const current = a11yPrefs.value[key]
  const next = value !== undefined ? value : !current
  await updateA11yPrefs({ [key]: next })
  a11ySaved.value = true
  announce(`${key.replace(/_/g, ' ')} ${next ? 'enabled' : 'disabled'}.`)
  setTimeout(() => { a11ySaved.value = false }, 3000)
}

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
  box-sizing: border-box;
  background: var(--color-surface-2);
  color: var(--color-text-primary);
}

.settings-nav-item.active {
  box-sizing: border-box;
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

/* ── Toggle switch ── */
.settings-toggle-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
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

/* ── Radio group — theme, text size, line spacing, focus indicator ── */
.radio-group {
  border: none;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  min-width: 120px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.radio-option input[type="radio"] {
  appearance: none;
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  min-width: 18px;
  border-radius: 50%;
  border: 2px solid var(--color-border-subtle);
  background: transparent;
  cursor: pointer;
  transition: border-color var(--transition-fast);
  position: relative;
}

.radio-option input[type="radio"]:checked {
  border-color: var(--color-accent);
}

.radio-option input[type="radio"]:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-accent);
}

.radio-option input[type="radio"]:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.radio-option:hover input[type="radio"]:not(:checked) {
  border-color: var(--color-accent);
}

/* ── Alt badge size radio group ── */
.alt-badge-size-group {
  border: none;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  display: flex;
  gap: var(--space-4);
}

.alt-badge-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.alt-badge-option input[type="radio"] {
  accent-color: var(--color-accent);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.alt-badge-option-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.badge-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-weight: 700;
  font-family: var(--font-mono, monospace);
  letter-spacing: 0.05em;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 4px;
  line-height: 1;
}

.badge-preview--small {
  font-size: 8px;
  padding: 2px;
}

.badge-preview--large {
  font-size: 12px;
  padding: 5px;
}

/* ── Accent swatches ── */
.accent-swatches {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  padding-top: var(--space-1);
}

.accent-swatch-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  cursor: pointer;
}

.accent-swatch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-full);
  border: 2px solid transparent;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.accent-swatch-label:has(input:checked) .accent-swatch {
  border-color: var(--color-text-primary);
  transform: scale(1.1);
}

.accent-swatch-label:has(input:focus-visible) .accent-swatch {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 3px;
}

.accent-swatch:hover {
  transform: scale(1.1);
}

/* ── Attention warning ── */
.attention {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #C0392B;
  text-transform: uppercase;
  font-weight: 800;
  font-size: var(--text-base);
  line-height: 1;
  margin-top: var(--space-4);
  margin-bottom: -0.75rem;
}

/* ── Primary button ── */
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

/* ── Responsive ── */
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