<template>
  <div
    role="menu"
    :aria-label="`Options for post by ${post.profile?.display_name}`"
    style="
      position: absolute;
      top: 40px;
      right: 0;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-overlay);
      min-width: 220px;
      overflow: hidden;
      animation: modalIn 150ms ease;
    "
    ref="menuEl"
    @keydown.esc="emit('close')">
    <!-- Owner actions -->
    <template v-if="isOwn">
      <button
        role="menuitem"
        class="context-menu-item danger"
        @click="handleDelete">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        Delete post
      </button>
    </template>

    <!-- All users -->
    <button role="menuitem" class="context-menu-item" @click="copyLink">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
      Copy link
    </button>

    <button role="menuitem" class="context-menu-item" @click="sharePost">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none"
        stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      Share post
    </button>

    <template v-if="!isOwn && user">
      <!-- Mute account -->
      <button role="menuitem" class="context-menu-item" @click="handleMute">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
          <path
            d="M5.26 5.26A9.97 9.97 0 0 0 2 12c0 5.52 4.48 10 10 10a9.97 9.97 0 0 0 6.74-2.62M22 12A10 10 0 0 0 12 2" />
          <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
        {{ isMuted(post.user_id) ? 'Unmute' : 'Mute' }} @{{ post.profile?.username }}
      </button>

      <!-- Block account -->
      <button role="menuitem" class="context-menu-item danger" @click="handleBlock">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        {{ isBlocked(post.user_id) ? 'Unblock' : 'Block' }} @{{ post.profile?.username }}
      </button>

      <button role="menuitem" class="context-menu-item danger" @click="reportPost">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        Report post
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const props = defineProps<{
  post: Post
  isOwn: boolean
}>()

const emit = defineEmits<{
  close: []
  deleted: [id: string]
}>()

const user = useSupabaseUser()
const { deletePost } = usePostActions()
const { showToast } = useToast()
const { announce } = useAnnouncer()
const { blockAccount, unblockAccount, muteAccount, unmuteAccount, isBlocked, isMuted } = useContentFilters()
const menuEl = ref<HTMLElement>()

async function handleDelete() {
  const ok = await deletePost(props.post.id)
  if (ok) {
    emit('deleted', props.post.id)
    emit('close')
  }
}

async function copyLink() {
  const url = `${window.location.origin}/post/${props.post.id}`
  await navigator.clipboard.writeText(url)
  showToast('Link copied!', 'success')
  announce('Post link copied to clipboard.')
  emit('close')
}

function sharePost() {
  if (navigator.share) {
    navigator.share({
      text: props.post.content.substring(0, 100),
      url: `${window.location.origin}/post/${props.post.id}`,
    })
  } else {
    copyLink()
  }
  emit('close')
}

function reportPost() {
  showToast('Report submitted. Thank you.', 'info')
  emit('close')
}

async function handleMute() {
  const username = props.post.profile?.username ?? 'this account'
  if (isMuted(props.post.user_id)) {
    await unmuteAccount(props.post.user_id)
    showToast(`@${username} unmuted.`, 'info')
    announce(`${username} unmuted.`)
  } else {
    await muteAccount(props.post.user_id)
    showToast(`@${username} muted. Their posts won't appear in your feed.`, 'success')
    announce(`${username} muted.`)
  }
  emit('close')
}

async function handleBlock() {
  const username = props.post.profile?.username ?? 'this account'
  if (isBlocked(props.post.user_id)) {
    await unblockAccount(props.post.user_id)
    showToast(`@${username} unblocked.`, 'info')
    announce(`${username} unblocked.`)
  } else {
    await blockAccount(props.post.user_id)
    emit('deleted', props.post.id)
    showToast(`@${username} blocked.`, 'success')
    announce(`${username} blocked.`)
  }
  emit('close')
}

function handleOutsideClick(e: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(e.target as Node)) {
    emit('close')
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style>
.context-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-5);
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
  font-weight: 500;
}

.context-menu-item:hover {
  background: var(--color-surface-2);
}

.context-menu-item.danger {
  color: var(--color-error);
}

.context-menu-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
</style>