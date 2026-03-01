<template>
  <div>
    <article class="auth-card" aria-labelledby="register-title">
      <header class="auth-logo">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" width="48"
          height="48" aria-hidden="true">
          <path
            d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm6.4 10.8c.008.18.008.36.008.54 0 5.52-4.2 11.88-11.88 11.88-2.36 0-4.552-.688-6.4-1.872.336.04.656.052.996.052 1.952 0 3.752-.664 5.184-1.784a4.19 4.19 0 0 1-3.908-2.904c.256.04.512.064.78.064.376 0 .74-.052 1.084-.144a4.185 4.185 0 0 1-3.356-4.108v-.052c.56.312 1.204.5 1.888.524a4.18 4.18 0 0 1-1.872-3.484c0-.772.208-1.492.572-2.112a11.874 11.874 0 0 0 8.616 4.372 4.72 4.72 0 0 1-.104-.956 4.187 4.187 0 0 1 4.188-4.188c1.204 0 2.292.508 3.056 1.32a8.24 8.24 0 0 0 2.656-1.016 4.197 4.197 0 0 1-1.84 2.312 8.37 8.37 0 0 0 2.408-.656 8.99 8.99 0 0 1-2.072 2.148z" />
        </svg>
        <span class="auth-logo-text" aria-hidden="true">Chirp</span>
      </header>

      <h1 id="register-title" class="auth-title">Join Chirp today</h1>
      <p class="auth-subtitle">Connect with people and share what matters.</p>

      <!-- Primary OAuth providers -->
      <div class="oauth-grid" role="group" aria-label="Sign up with a social account">
        <button v-for="p in primaryProviders" :key="p.id" type="button" class="oauth-btn"
          :aria-label="`Sign up with ${p.label}`" :disabled="oauthLoading === p.id"
          :aria-busy="oauthLoading === p.id ? 'true' : undefined" @click="signInWithOAuth(p.id)">
          <span class="oauth-btn-icon" aria-hidden="true" v-html="p.icon"></span>
          <span class="oauth-btn-label">{{ p.label }}</span>
        </button>
      </div>

      <!-- More providers toggle -->
      <div style="margin-top: var(--space-3); margin-bottom: var(--space-2);">
        <button type="button" class="oauth-more-toggle"
          :aria-expanded="showMoreProviders ? 'true' : 'false'"
          aria-controls="more-providers-register"
          @click="showMoreProviders = !showMoreProviders">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
            fill="none"
            stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"
            :style="{ transform: showMoreProviders ? 'rotate(180deg)' : 'none', transition: 'transform 200ms ease' }">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {{ showMoreProviders ? 'Fewer options' : 'More sign-up options' }}
        </button>
        <div v-show="showMoreProviders" id="more-providers-register" class="oauth-more-grid"
          role="group" aria-label="More sign-up options">
          <button v-for="p in moreProviders" :key="p.id" type="button"
            class="oauth-btn oauth-btn-sm"
            :aria-label="`Sign up with ${p.label}`" :disabled="oauthLoading === p.id"
            :aria-busy="oauthLoading === p.id ? 'true' : undefined" @click="signInWithOAuth(p.id)">
            <span class="oauth-btn-icon" aria-hidden="true" v-html="p.icon"></span>
            <span class="oauth-btn-label">{{ p.label }}</span>
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="auth-divider" role="separator" aria-hidden="true">
        <div></div><span>or create account with email</span>
        <div></div>
      </div>

      <form novalidate @submit.prevent="handleRegister" aria-label="Create account with email">
        <!-- Display name -->
        <div class="form-group">
          <label for="display-name" class="form-label">
            Display name
            <span class="required" aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <input
            id="display-name"
            v-model="displayName"
            type="text"
            class="form-input"
            placeholder="Your name"
            autocomplete="name"
            maxlength="50"
            :aria-invalid="!!errors.displayName"
            :aria-describedby="errors.displayName ? 'display-name-error' : 'display-name-hint'" />
          <div id="display-name-hint" class="form-hint">Max 50 characters.</div>
          <div v-if="errors.displayName" id="display-name-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.displayName }}
          </div>
        </div>

        <!-- Username -->
        <div class="form-group">
          <label for="username" class="form-label">
            Username
            <span class="required" aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <div style="position: relative;">
            <span
              style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--color-text-tertiary);"
              aria-hidden="true">@</span>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="yourhandle"
              autocomplete="username"
              maxlength="30"
              style="padding-left: 28px;"
              :aria-invalid="!!errors.username"
              :aria-describedby="`username-hint${errors.username ? ' username-error' : ''}`"
              @input="checkUsername" />
          </div>
          <div id="username-hint" class="form-hint">
            3–30 characters. Letters, numbers, and underscores only.
          </div>
          <div v-if="errors.username" id="username-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.username }}
          </div>
          <div v-if="usernameTaken" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            This username is already taken.
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="reg-email" class="form-label">
            Email address
            <span class="required" aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="you@example.com"
            autocomplete="email"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'reg-email-error' : undefined" />
          <div v-if="errors.email" id="reg-email-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.email }}
          </div>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="reg-password" class="form-label">
            Password
            <span class="required" aria-hidden="true">*</span>
            <span class="sr-only">(required)</span>
          </label>
          <div style="position: relative;">
            <input
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              placeholder="Minimum 8 characters"
              autocomplete="new-password"
              style="padding-right: 48px;"
              :aria-invalid="!!errors.password"
              :aria-describedby="`password-strength${errors.password ? ' reg-password-error' : ''}`" />
            <button
              type="button"
              style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--color-text-tertiary); cursor: pointer; padding: 4px;"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <!-- Password strength indicator -->
          <div id="password-strength" style="margin-top: var(--space-2);" aria-live="polite">
            <div v-if="password" style="display: flex; gap: 4px; margin-bottom: 4px;"
              aria-hidden="true">
              <div
                v-for="i in 4"
                :key="i"
                style="height: 4px; flex: 1; border-radius: 2px; transition: background 200ms ease;"
                :style="{ background: i <= passwordStrength ? strengthColor : 'var(--color-surface-3)' }">
              </div>
            </div>
            <span
              v-if="password"
              style="font-size: var(--text-xs); color: var(--color-text-tertiary);">
              Password strength: {{ strengthLabel }}
            </span>
          </div>
          <div v-if="errors.password" id="reg-password-error" class="form-error" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errors.password }}
          </div>
        </div>

        <!-- Global error -->
        <div v-if="globalError" class="form-error" role="alert" aria-live="assertive"
          style="justify-content: center; margin-bottom: var(--space-4);">
          {{ globalError }}
        </div>

        <!-- Terms -->
        <p
          style="font-size: var(--text-xs); color: var(--color-text-tertiary); margin-bottom: var(--space-4); line-height: var(--leading-normal);">
          By creating an account you agree to our
          <a href="/terms" style="color: var(--color-accent); text-decoration: none;">Terms of
            Service</a>
          and
          <a href="/privacy" style="color: var(--color-accent); text-decoration: none;">Privacy
            Policy</a>.
        </p>

        <button
          type="submit"
          class="form-submit-btn"
          :disabled="isLoading || usernameTaken"
          :aria-busy="isLoading">
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Create account</span>
        </button>
      </form>

      <p class="auth-switch">
        Already have an account?
        <NuxtLink to="/auth/login">Sign in</NuxtLink>
      </p>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useRouter } from 'vue-router'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Create account — Chirp' })

const supabase = useSupabaseClient()
const router = useRouter()

// ── OAuth (shared with login page) ────────────────────────
type Provider = { id: string; label: string; icon: string }

const primaryProviders: Provider[] = [
  { id: 'google', label: 'Google', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>` },
  { id: 'apple', label: 'Apple', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.23.72 3 .77 1.12-.24 2.19-.93 3.39-.84 1.44.12 2.53.72 3.23 1.88-2.97 1.78-2.27 5.72.48 6.82-.57 1.5-1.31 2.99-2.1 4.25M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/></svg>` },
  { id: 'github', label: 'GitHub', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>` },
]

const moreProviders: Provider[] = [
  { id: 'discord', label: 'Discord', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.054a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>` },
  { id: 'facebook', label: 'Facebook', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>` },
  { id: 'twitter', label: 'X / Twitter', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.738-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
  { id: 'slack', label: 'Slack', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#E01E5A" d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"/><path fill="#36C5F0" d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"/><path fill="#2EB67D" d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"/><path fill="#ECB22E" d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/></svg>` },
  { id: 'spotify', label: 'Spotify', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>` },
  { id: 'twitch', label: 'Twitch', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>` },
  { id: 'notion', label: 'Notion', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/></svg>` },
  { id: 'azure', label: 'Microsoft', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/><path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/></svg>` },
  { id: 'gitlab', label: 'GitLab', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#FC6D26"><path d="m23.955 13.587-1.342-4.135-2.664-8.189a.455.455 0 0 0-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 0 0-.867 0L1.386 9.45.044 13.587a.924.924 0 0 0 .331 1.023L12 23.054l11.625-8.443a.92.92 0 0 0 .33-1.024"/></svg>` },
  { id: 'zoom', label: 'Zoom', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#2D8CFF"><path d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12zm-6.5-4.5h-8C8.12 7.5 7 8.62 7 9.995v6.01C7 17.38 8.12 18.5 9.5 18.5h8c1.38 0 2.5-1.12 2.5-2.495V9.995C20 8.62 18.88 7.5 17.5 7.5zM15 13.5V11l3 2.5v-4l-3 2.5V9h-5v7h5v-2.5z"/></svg>` },
  { id: 'linkedin', label: 'LinkedIn', icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>` },
]

const showMoreProviders = ref(false)
const oauthLoading = ref<string | null>(null)

async function signInWithOAuth(provider: string) {
  oauthLoading.value = provider
  await supabase.auth.signInWithOAuth({
    provider: provider as Parameters<typeof supabase.auth.signInWithOAuth>[0]['provider'],
    options: { redirectTo: `${window.location.origin}/auth/confirm` },
  })
  oauthLoading.value = null
}

// ── Email registration ─────────────────────────────────────

const displayName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const globalError = ref('')
const usernameTaken = ref(false)
const errors = reactive({
  displayName: '',
  username: '',
  email: '',
  password: '',
})

// Password strength
const passwordStrength = computed(() => {
  const p = password.value
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})

const strengthLabel = computed(() => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return labels[passwordStrength.value]
})

const strengthColor = computed(() => {
  const colors = ['', 'var(--color-error)', 'var(--color-warning)', '#34d399', 'var(--color-success)']
  return colors[passwordStrength.value]
})

let usernameCheckTimer: ReturnType<typeof setTimeout>
async function checkUsername() {
  clearTimeout(usernameCheckTimer)
  usernameTaken.value = false
  if (username.value.length < 3) return

  usernameCheckTimer = setTimeout(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.value)
      .single()
    usernameTaken.value = !!data
  }, 400)
}

function validate() {
  errors.displayName = ''
  errors.username = ''
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!displayName.value.trim()) {
    errors.displayName = 'Display name is required.'
    valid = false
  }

  if (!username.value) {
    errors.username = 'Username is required.'
    valid = false
  } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.value)) {
    errors.username = 'Username must be 3–30 characters: letters, numbers, underscores.'
    valid = false
  }

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!password.value || password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    valid = false
  }

  return valid
}

async function handleRegister() {
  if (!validate() || usernameTaken.value) return

  isLoading.value = true
  globalError.value = ''

  const { error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        username: username.value,
        display_name: displayName.value,
      },
    },
  })

  if (error) {
    globalError.value = error.message
    isLoading.value = false
    return
  }

  router.push('/?welcome=true')
}
</script>