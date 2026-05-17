<template>
  <div>
    <article class="auth-card" aria-labelledby="reset-title">
      <header class="auth-logo">
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="48" height="48"
          viewBox="0,0,400,400" aria-hidden="true" focusable="false">
          <path
            d="M285.758 53.769 C 273.508 59.277,267.200 67.819,266.639 69.340 C 263.245 76.961,262.001 100.951,260.380 125.600 C 255.567 144.303,243.536 169.561,199.600 194.013 C 179.293 199.600,170.112 202.067,180.279 204.219 C 213.600 206.328,273.882 178.903,293.338 147.200 C 299.903 109.337,308.776 83.800,309.692 78.092 C 308.596 70.363,306.842 62.563,294.400 54.291 C 290.378 53.341,285.758 53.769,285.758 53.769 M293.304 64.404 C 299.295 67.243,283.800 75.466,283.800 70.590 C 283.800 65.140,288.459 62.107,293.304 64.404"
            stroke="none" fill="#ec6e1f" fill-rule="evenodd" />
        </svg>
        <span class="auth-logo-text" aria-hidden="true">Chirp</span>
      </header>

      <!-- Invalid / expired link state -->
      <template v-if="linkError">
        <div class="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
            fill="none" stroke="var(--color-error)" stroke-width="1.5"
            aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1 id="reset-title" class="auth-title">Link expired</h1>
          <p class="auth-subtitle">
            This password reset link has expired or is invalid. Reset links are only valid for 1
            hour.
          </p>
          <NuxtLink to="/auth/forgot-password" class="form-submit-btn"
            style="display:block; text-align:center; text-decoration:none; margin-top: var(--space-6);">
            Request a new link
          </NuxtLink>
        </div>
      </template>

      <!-- Success state -->
      <template v-else-if="success">
        <div class="success-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
            fill="none" stroke="var(--color-success)" stroke-width="1.5"
            aria-hidden="true" focusable="false">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <h1 id="reset-title" class="auth-title">Password updated</h1>
          <p class="auth-subtitle">Your password has been changed. You can now sign in with your new
            password.</p>
          <NuxtLink to="/auth/login" class="form-submit-btn"
            style="display:block; text-align:center; text-decoration:none; margin-top: var(--space-6);">
            Go to sign in
          </NuxtLink>
        </div>
      </template>

      <!-- Reset form -->
      <template v-else>
        <h1 id="reset-title" class="auth-title">Set new password</h1>
        <p class="auth-subtitle">Choose a strong password for your account.</p>

        <form novalidate @submit.prevent="handleReset" aria-label="Set new password form">

          <div class="form-group">
            <label for="password" class="form-label">
              New password
              <span class="required" aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="form-input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="At least 8 characters"
                autocomplete="new-password"
                style="padding-right: 48px;"
                :aria-invalid="!!errors.password ? 'true' : undefined"
                :aria-describedby="errors.password ? 'password-error' : 'password-hint'"
                required />
              <button
                type="button"
                class="form-input-toggle"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword ? 'true' : 'false'"
                @click="showPassword = !showPassword">
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                  aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18"
                  height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path
                    d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </button>
            </div>

            <!-- Strength indicator -->
            <div class="password-strength" aria-live="polite"
              :aria-label="`Password strength: ${strengthLabel}`">
              <div class="strength-bars">
                <div
                  v-for="n in 4"
                  :key="n"
                  class="strength-bar"
                  :class="{ active: n <= strength }"
                  :style="n <= strength ? `background: ${strengthColor}` : ''"></div>
              </div>
              <span v-if="password" class="strength-label" :style="`color: ${strengthColor}`">
                {{ strengthLabel }}
              </span>
            </div>

            <div v-if="errors.password" id="password-error" class="form-error" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {{ errors.password }}
            </div>
            <p v-else id="password-hint" class="form-hint">Minimum 8 characters.</p>
          </div>

          <div class="form-group">
            <label for="confirm" class="form-label">
              Confirm new password
              <span class="required" aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <div class="form-input-wrapper">
              <input
                id="confirm"
                v-model="confirm"
                :type="showConfirm ? 'text' : 'password'"
                class="form-input"
                placeholder="Repeat your password"
                autocomplete="new-password"
                style="padding-right: 48px;"
                :aria-invalid="!!errors.confirm ? 'true' : undefined"
                :aria-describedby="errors.confirm ? 'confirm-error' : undefined"
                required />
              <button
                type="button"
                class="form-input-toggle"
                :aria-label="showConfirm ? 'Hide confirm password' : 'Show confirm password'"
                :aria-pressed="showConfirm ? 'true' : 'false'"
                @click="showConfirm = !showConfirm">
                <svg v-if="!showConfirm" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                  width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"
                  aria-hidden="true">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18"
                  height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path
                    d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              </button>
            </div>
            <div v-if="errors.confirm" id="confirm-error" class="form-error" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {{ errors.confirm }}
            </div>
          </div>

          <div v-if="globalError" class="form-error" role="alert" aria-live="assertive"
            style="justify-content: center; margin-bottom: var(--space-4);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ globalError }}
          </div>

          <button
            type="submit"
            class="form-submit-btn"
            :disabled="isLoading"
            :aria-busy="isLoading ? 'true' : undefined">
            <span v-if="isLoading">Updating…</span>
            <span v-else>Update password</span>
          </button>
        </form>

        <p class="form-required-note">
          <abbr aria-hidden="true">*</abbr> Required fields
        </p>
      </template>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Set new password — Chirp' })

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const isLoading = ref(false)
const globalError = ref('')
const success = ref(false)
const linkError = ref(false)
const errors = reactive({ password: '', confirm: '' })

// Check for error in URL hash (expired/invalid link)
onMounted(async () => {
  const hash = window.location.hash
  if (hash.includes('error=')) {
    linkError.value = true
    return
  }
  // Exchange the recovery token for a session
  if (hash.includes('type=recovery')) {
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    if (accessToken && refreshToken) {
      const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      if (error) linkError.value = true
    } else {
      linkError.value = true
    }
  }
})

// Password strength
const strength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  return ['', 'Weak', 'Fair', 'Good', 'Strong'][strength.value] || ''
})

const strengthColor = computed(() => {
  return ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength.value] || ''
})

function validate() {
  errors.password = errors.confirm = ''
  let valid = true
  if (!password.value) { errors.password = 'Password is required.'; valid = false }
  else if (password.value.length < 8) { errors.password = 'Password must be at least 8 characters.'; valid = false }
  if (!confirm.value) { errors.confirm = 'Please confirm your password.'; valid = false }
  else if (password.value !== confirm.value) { errors.confirm = 'Passwords do not match.'; valid = false }
  return valid
}

async function handleReset() {
  if (!validate()) return
  isLoading.value = true
  globalError.value = ''
  const { error } = await supabase.auth.updateUser({ password: password.value })
  isLoading.value = false
  if (error) {
    globalError.value = error.message
    return
  }
  // Sign out so the user goes through normal login with new password
  await supabase.auth.signOut()
  success.value = true
}
</script>

<style scoped>
.error-state,
.success-state {
  text-align: center;
  padding: var(--space-4) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.error-state svg,
.success-state svg {
  margin-bottom: var(--space-2);
}

/* Strength meter */
.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.strength-bars {
  display: flex;
  gap: var(--space-1);
  flex: 1;
}

.strength-bar {
  height: 3px;
  flex: 1;
  border-radius: 999px;
  background: var(--color-surface-3);
  transition: background var(--transition-fast);
}

.strength-label {
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
  transition: color var(--transition-fast);
}

.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin-top: var(--space-2);
}
</style>