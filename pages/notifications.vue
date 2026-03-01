<template>
  <div>
    <!-- Header -->
    <div class="feed-tabs">
      <h1 class="feed-tabs-header" style="padding: var(--space-4) var(--space-6);">
        Notifications
      </h1>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div v-for="i in 5" :key="i"
        style="padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border-subtle);">
        <div class="skeleton" style="width: 100%; height: 40px; border-radius: var(--radius-md);">
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else-if="notifications.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
          fill="none"
          stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </div>
      <h2 class="empty-state-title">Nothing to see here</h2>
      <p class="empty-state-text">When you get notifications, they'll appear here.</p>
    </div>

    <!-- Notifications list -->
    <section v-else aria-label="Notifications" aria-live="polite">
      <article v-for="notif in notifications" :key="notif.id"
        :class="['notification-item', { unread: !notif.read }]"
        style="padding: var(--space-4) var(--space-6); border-bottom: 1px solid var(--color-border-subtle); display: flex; gap: var(--space-3); cursor: pointer; transition: background var(--transition-fast);"
        @click="handleNotifClick(notif)" :aria-label="notifLabel(notif)" tabindex="0"
        @keydown.enter="handleNotifClick(notif)" @keydown.space.prevent="handleNotifClick(notif)">
        <!-- Unread indicator -->
        <div v-if="!notif.read"
          style="width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; margin-top: 6px;"
          aria-hidden="true"></div>
        <div v-else style="width: 8px; flex-shrink: 0;"></div>

        <!-- Icon -->
        <div :style="{ color: notifColor(notif.type), flexShrink: 0 }">
          <svg v-if="notif.type === 'like'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            width="22" height="22" fill="currentColor" aria-hidden="true">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <svg v-else-if="notif.type === 'follow'" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            stroke-width="2" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
          <svg v-else-if="notif.type === 'repost'" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
            stroke-width="2" aria-hidden="true">
            <path d="m17 1 4 4-4 4" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="m7 23-4-4 4-4" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
            fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <div style="flex: 1; min-width: 0;">
          <!-- Actor avatar -->
          <div style="margin-bottom: var(--space-2);">
            <NuxtLink :to="`/profile/${notif.actor?.username}`"
              style="display: inline-block; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: var(--color-surface-3); text-decoration: none;"
              :aria-label="`View ${notif.actor?.display_name}'s profile`">
              <img v-if="notif.actor?.avatar_url" :src="notif.actor.avatar_url"
                :alt="notif.actor.display_name" width="36" height="36"
                style="width: 100%; height: 100%; object-fit: cover;" />
              <div v-else class="post-avatar-placeholder" style="height: 100%; font-size: 12px;">
                {{ notif.actor?.display_name?.[0]?.toUpperCase() }}
              </div>
            </NuxtLink>
          </div>

          <!-- Notification text -->
          <p
            style="color: var(--color-text-primary); font-size: var(--text-sm); line-height: var(--leading-snug);">
            <NuxtLink :to="`/profile/${notif.actor?.username}`"
              style="font-weight: 700; color: inherit; text-decoration: none;">{{
                notif.actor?.display_name }}</NuxtLink>
            {{ notifText(notif.type) }}
          </p>

          <!-- Post excerpt -->
          <p v-if="notif.post"
            style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: var(--space-1);">
            {{ notif.post.content?.substring(0, 80) }}{{ notif.post.content?.length > 80 ? '...' :
            '' }}
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Notification } from '~/types'

definePageMeta({ layout: 'default' })
useHead({ title: 'Notifications — Chirp' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const { markAllRead } = useNotifications()

const notifications = ref<Notification[]>([])
const loading = ref(true)

async function fetchNotifications() {
  if (!user.value) return
  loading.value = true
  const { data } = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id(*),
      post:posts(id, content)
    `)
    .eq('user_id', user.value.id)
    .order('created_at', { ascending: false })
    .limit(50)
  notifications.value = (data ?? []) as Notification[]
  loading.value = false

  // Mark all as read
  await markAllRead()
}

function handleNotifClick(notif: Notification) {
  if (notif.post_id) {
    router.push(`/post/${notif.post_id}`)
  } else if (notif.type === 'follow') {
    router.push(`/profile/${notif.actor?.username}`)
  }
}

function notifText(type: string): string {
  const map: Record<string, string> = {
    like: 'liked your post.',
    repost: 'reposted your post.',
    follow: 'followed you.',
    reply: 'replied to your post.',
    mention: 'mentioned you in a post.',
  }
  return map[type] || 'interacted with you.'
}

function notifColor(type: string): string {
  const map: Record<string, string> = {
    like: 'var(--color-like)',
    repost: 'var(--color-repost)',
    follow: 'var(--color-accent)',
    reply: 'var(--color-reply)',
    mention: 'var(--color-accent)',
  }
  return map[type] || 'var(--color-text-secondary)'
}

function notifLabel(notif: Notification): string {
  return `${notif.actor?.display_name} ${notifText(notif.type)}${notif.post ? ` Post: ${notif.post.content?.substring(0, 50)}` : ''} ${notif.read ? '' : 'Unread.'}`
}

watch(user, (u) => { if (u) fetchNotifications() }, { immediate: true })
</script>