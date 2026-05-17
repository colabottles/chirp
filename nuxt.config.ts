import type { NuxtConfig } from 'nuxt/schema'
/// <reference types="@nuxtjs/supabase" />
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    useSsrCookies: true,
    types: '~/types/database.types.ts',
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: ['/auth/register', '/auth/forgot-password', '/auth/login', '/auth/confirm', '/auth/reset-password'],
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Chirp — The New Sound',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Chirp — The New Sound.' },
        { name: 'theme-color', content: '#0f1117' },
        { property: 'og:title', content: 'Chirp' },
        { property: 'og:description', content: 'The New Sound.' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@300;400;500;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap',
        },
      ],
    },
  },
} satisfies NuxtConfig)