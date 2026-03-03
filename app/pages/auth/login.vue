<template>
  <div>
    <article class="auth-card" aria-labelledby="login-title">
      <header class="auth-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="48"
          height="48" aria-hidden="true" focusable="false">
          <path
            d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.4 10.8c.008.18.008.36.008.54 0 5.52-4.2 11.88-11.88 11.88-2.36 0-4.552-.688-6.4-1.872.336.04.656.052.996.052 1.952 0 3.752-.664 5.184-1.784a4.19 4.19 0 0 1-3.908-2.904c.256.04.512.064.78.064.376 0 .74-.052 1.084-.144a4.185 4.185 0 0 1-3.356-4.108v-.052c.56.312 1.204.5 1.888.524a4.18 4.18 0 0 1-1.872-3.484c0-.772.208-1.492.572-2.112a11.874 11.874 0 0 0 8.616 4.372 4.72 4.72 0 0 1-.104-.956 4.187 4.187 0 0 1 4.188-4.188c1.204 0 2.292.508 3.056 1.32a8.24 8.24 0 0 0 2.656-1.016 4.197 4.197 0 0 1-1.84 2.312 8.37 8.37 0 0 0 2.408-.656 8.99 8.99 0 0 1-2.072 2.148z" />
        </svg>
        <span class="auth-logo-text" aria-hidden="true">Chirp</span>
      </header>

      <h1 id="login-title" class="auth-title">Sign in to Chirp</h1>
      <p class="auth-subtitle">Welcome back. Pick up where you left off.</p>

      <!-- OAuth providers -->
      <div class="oauth-grid" role="group" aria-label="Sign in with a social account">
        <button v-for="p in providers" :key="p.id" type="button" class="oauth-btn"
          :aria-label="`Sign in with ${p.label}`" :disabled="oauthLoading === p.id"
          :aria-busy="oauthLoading === p.id ? 'true' : undefined" @click="signInWithOAuth(p.id)">
          <span class="oauth-btn-icon" aria-hidden="true" v-html="p.icon"></span>
          <span class="oauth-btn-label">{{ p.label }}</span>
        </button>
      </div>

      <!-- Divider -->
      <div class="auth-divider" role="separator" aria-hidden="true">
        <div></div><span>or sign in with email</span>
        <div></div>
      </div>

      <!-- Email / password form -->
      <form novalidate @submit.prevent="handleLogin" aria-label="Sign in with email">
        <div class="form-group">
          <label for="email" class="form-label">
            Email address <span class="required" aria-hidden="true">*</span><span
              class="sr-only">(required)</span>
          </label>
          <input id="email" v-model="email" type="email" class="form-input"
            placeholder="you@example.com"
            autocomplete="email" :aria-invalid="!!errors.email ? 'true' : undefined"
            :aria-describedby="errors.email ? 'email-error' : undefined" required />
          <div v-if="errors.email" id="email-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.email }}
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            Password <span class="required" aria-hidden="true">*</span><span
              class="sr-only">(required)</span>
          </label>
          <div style="position: relative;">
            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Your password" autocomplete="current-password"
              style="padding-right: 48px;"
              :aria-invalid="!!errors.password ? 'true' : undefined"
              :aria-describedby="errors.password ? 'password-error' : undefined" required />
            <button type="button"
              style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-tertiary); cursor: pointer; padding: 4px;"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword ? 'true' : 'false'" @click="showPassword = !showPassword">
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
          <div v-if="errors.password" id="password-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.password }}
          </div>
        </div>

        <div
          style="text-align: right; margin-top: calc(-1 * var(--space-2)); margin-bottom: var(--space-4);">
          <NuxtLink to="/auth/forgot-password"
            style="color: var(--color-accent); font-size: var(--text-sm); text-decoration: none;">
            Forgot password?
          </NuxtLink>
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

        <button type="submit" class="form-submit-btn" :disabled="isLoading"
          :aria-busy="isLoading ? 'true' : undefined">
          <span v-if="isLoading"><span class="sr-only">Signing in…</span><span
              aria-hidden="true">Signing in…</span></span>
          <span v-else>Sign in with email</span>
        </button>
      </form>

      <p class="form-required-note">
        <abbr aria-hidden="true">*</abbr> Required fields
      </p>

      <p class="auth-switch">Don't have an account? <NuxtLink to="/auth/register">Create one
        </NuxtLink>
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Sign in — Chirp' })

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

type Provider = { id: string; label: string; icon: string }

const providers: Provider[] = [
  {
    id: 'google', label: 'Google',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
  },
  {
    id: 'slack', label: 'Slack',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>`,
  },
]

const oauthLoading = ref<string | null>(null)

async function signInWithOAuth(provider: string) {
  oauthLoading.value = provider
  await supabase.auth.signInWithOAuth({
    provider: provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
    options: { redirectTo: `${window.location.origin}/auth/confirm` },
  })
  oauthLoading.value = null
}

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const globalError = ref('')

onMounted(() => {
  if (route.query.error === 'oauth') {
    globalError.value = 'Sign in with Google or Slack failed. Please try again.'
  }
})
const errors = reactive({ email: '', password: '' })

function validate() {
  errors.email = errors.password = ''
  let valid = true
  if (!email.value) { errors.email = 'Email is required.'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { errors.email = 'Please enter a valid email address.'; valid = false }
  if (!password.value) { errors.password = 'Password is required.'; valid = false }
  return valid
}

async function handleLogin() {
  if (!validate()) return
  isLoading.value = true
  globalError.value = ''
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
  if (error) {
    globalError.value = error.message === 'Invalid login credentials'
      ? 'Incorrect email or password. Please try again.' : error.message
    isLoading.value = false
    return
  }
  router.push('/')
}
</script>