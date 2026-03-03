<template>
  <div>
    <article class="auth-card" aria-labelledby="forgot-title">
      <header class="auth-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="48"
          height="48" aria-hidden="true" focusable="false">
          <path
            d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.4 10.8c.008.18.008.36.008.54 0 5.52-4.2 11.88-11.88 11.88-2.36 0-4.552-.688-6.4-1.872.336.04.656.052.996.052 1.952 0 3.752-.664 5.184-1.784a4.19 4.19 0 0 1-3.908-2.904c.256.04.512.064.78.064.376 0 .74-.052 1.084-.144a4.185 4.185 0 0 1-3.356-4.108v-.052c.56.312 1.204.5 1.888.524a4.18 4.18 0 0 1-1.872-3.484c0-.772.208-1.492.572-2.112a11.874 11.874 0 0 0 8.616 4.372 4.72 4.72 0 0 1-.104-.956 4.187 4.187 0 0 1 4.188-4.188c1.204 0 2.292.508 3.056 1.32a8.24 8.24 0 0 0 2.656-1.016 4.197 4.197 0 0 1-1.84 2.312 8.37 8.37 0 0 0 2.408-.656 8.99 8.99 0 0 1-2.072 2.148z" />
        </svg>
        <span class="auth-logo-text" aria-hidden="true">Chirp</span>
      </header>

      <template v-if="!submitted">
        <h1 id="forgot-title" class="auth-title">Reset your password</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        <form novalidate @submit.prevent="handleSubmit" aria-label="Password reset form">
          <div class="form-group">
            <label for="email" class="form-label">
              Email address
              <span class="required" aria-hidden="true">*</span>
              <span class="sr-only">(required)</span>
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="you@example.com"
              autocomplete="email"
              :aria-invalid="!!error ? 'true' : undefined"
              :aria-describedby="error ? 'email-error' : undefined"
              required />
            <div v-if="error" id="email-error" class="form-error" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {{ error }}
            </div>
          </div>

          <button type="submit" class="form-submit-btn" :disabled="isLoading"
            :aria-busy="isLoading ? 'true' : undefined">
            <span v-if="isLoading">Sending…</span>
            <span v-else>Send reset link</span>
          </button>
        </form>
      </template>

      <template v-else>
        <div style="text-align: center; padding: var(--space-4) 0;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
            fill="none" stroke="var(--color-success)" stroke-width="1.5" aria-hidden="true"
            focusable="false" style="margin: 0 auto var(--space-4); display: block;">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
          <h1 id="forgot-title" class="auth-title" style="margin-bottom: var(--space-2);">Check your
            email</h1>
          <p class="auth-subtitle">We sent a password reset link to <strong>{{ email }}</strong>. It
            may take a minute to arrive.</p>
        </div>
      </template>

      <p class="auth-switch">
        <NuxtLink to="/auth/login">← Back to sign in</NuxtLink>
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Reset password — Chirp' })

const supabase = useSupabaseClient()
const email = ref('')
const error = ref('')
const isLoading = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Please enter a valid email address.'
    return
  }
  isLoading.value = true
  const { error: err } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/auth/confirm`,
  })
  isLoading.value = false
  if (err) { error.value = err.message; return }
  submitted.value = true
}
</script>