<template>
  <ClientOnly>
    <div class="messages-layout">
      <!-- Conversations list -->
      <section
        class="messages-sidebar"
        :class="{ 'messages-sidebar--hidden': activeConversation && isMobile }"
        aria-label="Conversations">

        <!-- Header -->
        <div class="feed-tabs">
          <h1 class="feed-tabs-header" style="padding: var(--space-4) var(--space-6);">Messages</h1>
        </div>

        <!-- New message button -->
        <div
          style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--color-border-subtle);">
          <button
            class="new-message-btn"
            aria-label="New message"
            @click="showNewMessage = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="12" y1="8" x2="12" y2="14" />
              <line x1="9" y1="11" x2="15" y2="11" />
            </svg>
            New message
          </button>
        </div>

        <!-- Loading -->
        <template v-if="loadingConversations">
          <div v-for="i in 5" :key="i"
            style="padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--color-border-subtle); display: flex; gap: var(--space-3); align-items: center;">
            <div class="skeleton"
              style="width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div class="skeleton"
                style="width: 120px; height: 14px; margin-bottom: var(--space-2);"></div>
              <div class="skeleton" style="width: 180px; height: 12px;"></div>
            </div>
          </div>
        </template>

        <!-- Empty -->
        <div v-else-if="conversations.length === 0" class="empty-state"
          style="padding: var(--space-12) var(--space-6);">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
              fill="none"
              stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 class="empty-state-title" style="font-size: var(--text-xl);">No messages yet</h2>
          <p class="empty-state-text">Start a conversation with someone you follow.</p>
        </div>

        <!-- Conversation list -->
        <ul role="list" style="list-style: none;">
          <li v-for="convo in conversations" :key="convo.id">
            <button class="convo-item"
              :class="{ 'convo-item--active': activeConversation?.id === convo.id, 'convo-item--unread': convo.unread_count > 0 }"
              :aria-label="`Conversation with ${convo.other_user.display_name}${convo.unread_count > 0 ? `, ${convo.unread_count} unread` : ''}`"
              :aria-current="activeConversation?.id === convo.id ? 'true' : undefined"
              @click="openConversation(convo)">
              <!-- Avatar -->
              <div class="convo-avatar" aria-hidden="true">
                <img v-if="convo.other_user.avatar_url" :src="convo.other_user.avatar_url"
                  :alt="convo.other_user.display_name" width="48" height="48"
                  style="width: 100%; height: 100%; object-fit: cover;" />
                <div v-else class="post-avatar-placeholder"
                  style="height: 100%; font-size: var(--text-base);">
                  {{ convo.other_user.display_name?.[0]?.toUpperCase() ?? '?' }}
                </div>
              </div>
              <!-- Info -->
              <div class="convo-info">
                <div class="convo-header">
                  <span class="convo-name">{{ convo.other_user.display_name }}</span>
                </div>
                <div class="convo-preview">
                  <span class="convo-preview-text">{{ convo.last_message ?? 'No messages yet'
                  }}</span>
                  <span v-if="convo.unread_count > 0" class="convo-unread-badge" aria-hidden="true">
                    {{ convo.unread_count > 99 ? '99+' : convo.unread_count }}
                  </span>
                </div>
              </div>
            </button>
          </li>
        </ul>
      </section>

      <!-- Message thread -->
      <section class="messages-thread"
        :class="{ 'messages-thread--visible': activeConversation || !isMobile }"
        aria-label="Message thread">

        <!-- No conversation selected -->
        <div v-if="!activeConversation" class="empty-state"
          style="height: 100%; justify-content: center;">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32"
              fill="none"
              stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 class="empty-state-title" style="font-size: var(--text-xl);">Select a message</h2>
          <p class="empty-state-text">Choose from your existing conversations or start a new one.
          </p>
          <button class="nav-post-btn"
            style="margin-top: var(--space-4); width: auto; padding: var(--space-3) var(--space-6);"
            @click="showNewMessage = true">
            New message
          </button>
        </div>

        <!-- Active conversation -->
        <template v-else>
          <!-- Thread header -->
          <div class="feed-tabs messages-thread-header">
            <button
              v-if="isMobile"
              class="modal-close-btn"
              aria-label="Back to conversations"
              style="margin-left: var(--space-2);"
              @click="activeConversation = null">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div class="messages-thread-header-user">
              <div class="convo-avatar convo-avatar--sm" aria-hidden="true">
                <img v-if="activeConversation.other_user.avatar_url"
                  :src="activeConversation.other_user.avatar_url"
                  :alt="activeConversation.other_user.display_name"
                  width="36" height="36"
                  style="width: 100%; height: 100%; object-fit: cover;" />
                <div v-else class="post-avatar-placeholder"
                  style="height: 100%; font-size: var(--text-sm);">
                  {{ activeConversation.other_user.display_name?.[0]?.toUpperCase() ?? '?' }}
                </div>
              </div>
              <div>
                <NuxtLink
                  :to="`/profile/${activeConversation.other_user.username}`"
                  style="font-weight: 700; color: var(--color-text-primary); font-size: var(--text-base); text-decoration: none; display: block;"
                  :aria-label="`View ${activeConversation.other_user.display_name}'s profile`">
                  {{ activeConversation.other_user.display_name }}
                </NuxtLink>
                <div style="color: var(--color-text-tertiary); font-size: var(--text-sm);">
                  @{{ activeConversation.other_user.username }}
                </div>
              </div>
            </div>
          </div>

          <!-- Messages -->
          <div
            class="messages-scroll"
            ref="messagesScrollEl"
            role="log"
            aria-label="Messages"
            aria-live="polite">

            <template v-if="loadingMessages">
              <div v-for="i in 6" :key="i"
                :style="{ display: 'flex', justifyContent: i % 3 === 0 ? 'flex-end' : 'flex-start', padding: 'var(--space-2) var(--space-5)' }">
                <div class="skeleton"
                  :style="{ width: `${120 + (i * 20)}px`, height: '40px', borderRadius: 'var(--radius-xl)' }">
                </div>
              </div>
            </template>

            <template v-else>
              <div v-if="messages.length === 0" class="empty-state"
                style="padding: var(--space-8);">
                <p class="empty-state-text">No messages yet. Say hello!</p>
              </div>

              <div v-else>
                <div v-for="(msg, idx) in messages" :key="msg.id"
                  class="message-row"
                  :class="{ 'message-row--mine': msg.sender_id === session?.user?.id }">

                  <!-- Date separator -->
                  <div v-if="shouldShowDateSeparator(idx)"
                    class="message-date-separator"
                    role="separator"
                    :aria-label="formatDateSeparator(msg.created_at)">
                    {{ formatDateSeparator(msg.created_at) }}
                  </div>

                  <!-- Bubble -->
                  <div class="message-bubble-wrapper"
                    :class="{ 'message-bubble-wrapper--mine': msg.sender_id === session?.user?.id }">
                    <div
                      class="message-bubble"
                      :class="{ 'message-bubble--mine': msg.sender_id === session?.user?.id }"
                      :aria-label="`${msg.sender_id === session?.user?.id ? 'You' : activeConversation.other_user.display_name}: ${msg.content}`">
                      {{ msg.content }}
                    </div>
                    <time
                      class="message-time"
                      :datetime="msg.created_at"
                      :aria-label="formatFullTime(msg.created_at)">
                      {{ formatMsgTime(msg.created_at) }}
                    </time>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- Message composer -->
          <form class="message-composer" aria-label="Send a message" @submit.prevent="sendMessage">
            <label for="message-input" class="sr-only">Message {{
              activeConversation.other_user.display_name
              }}</label>
            <div class="message-composer-inner">
              <textarea id="message-input" v-model="newMessage" class="message-input"
                :placeholder="`Message @${activeConversation.other_user.username}`" rows="1"
                :aria-label="`Message ${activeConversation.other_user.display_name}`"
                :disabled="sending"
                @keydown.enter.exact.prevent="sendMessage"
                @keydown.enter.shift.exact="newMessage += '\n'"
                @input="autoResize"
                ref="messageInputEl">
              </textarea>
              <button type="submit" class="message-send-btn"
                :disabled="!newMessage.trim() || sending"
                :aria-label="sending ? 'Sending...' : 'Send message'"
                :aria-busy="sending ? 'true' : undefined">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                  fill="currentColor" aria-hidden="true">
                  <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </template>
      </section>
    </div>
  </ClientOnly>

  <!-- New message modal — outside ClientOnly so it renders immediately -->
  <Teleport to="body">
    <div v-if="showNewMessage" class="modal-overlay" role="dialog" aria-modal="true"
      aria-labelledby="new-message-title" @click.self="showNewMessage = false"
      @keydown.esc="showNewMessage = false">
      <div class="modal" style="max-width: 480px;">
        <div class="modal-header">
          <button class="modal-close-btn" aria-label="Close" @click="showNewMessage = false">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2 id="new-message-title" class="modal-title">New message</h2>
        </div>

        <div style="padding: var(--space-4);">
          <div style="position: relative; margin-bottom: var(--space-4);">
            <label for="recipient-search" class="sr-only">Search people</label>
            <input id="recipient-search" v-model="recipientSearch" type="search"
              class="form-input"
              placeholder="Search people..." autocomplete="off"
              @input="searchRecipients" />
          </div>

          <ul v-if="recipientResults.length > 0" role="list" aria-label="Search results"
            style="list-style: none;">
            <li v-for="person in recipientResults" :key="person.id" class="convo-item"
              style="width: 100%;" role="option" tabindex="0"
              :aria-label="`Start conversation with ${person.display_name}`"
              @click="startConversation(person)"
              @keydown.enter.prevent="startConversation(person)"
              @keydown.space.prevent="startConversation(person)">
              <div class="convo-avatar" aria-hidden="true">
                <img v-if="person.avatar_url" :src="person.avatar_url"
                  :alt="person.display_name" width="48" height="48"
                  style="width: 100%; height: 100%; object-fit: cover;" />
                <div v-else class="post-avatar-placeholder"
                  style="height: 100%; font-size: var(--text-base);">
                  {{ person.display_name?.[0]?.toUpperCase() ?? '?' }}
                </div>
              </div>
              <div class="convo-info">
                <span class="convo-name">{{ person.display_name }}</span>
                <span class="convo-preview-text">@{{ person.username }}</span>
              </div>
            </li>
          </ul>

          <p v-else-if="recipientSearch && !searchingRecipients"
            style="color: var(--color-text-tertiary); font-size: var(--text-sm); padding: var(--space-4); text-align: center;">
            No results for "{{ recipientSearch }}"
          </p>

          <!-- Show all users when search is empty -->
          <ul v-else-if="!recipientSearch" role="list" aria-label="Suggested people"
            style="list-style: none;">
            <li v-for="person in suggestedUsers" :key="person.id" class="convo-item"
              style="width: 100%;" role="option" tabindex="0"
              :aria-label="`Start conversation with ${person.display_name}`"
              @click="startConversation(person)"
              @keydown.enter.prevent="startConversation(person)"
              @keydown.space.prevent="startConversation(person)">
              <div class="convo-avatar" aria-hidden="true">
                <img v-if="person.avatar_url" :src="person.avatar_url"
                  :alt="person.display_name" width="48" height="48"
                  style="width: 100%; height: 100%; object-fit: cover;" />
                <div v-else class="post-avatar-placeholder"
                  style="height: 100%; font-size: var(--text-base);">
                  {{ person.display_name?.[0]?.toUpperCase() ?? '?' }}
                </div>
              </div>
              <div class="convo-info">
                <span class="convo-name">{{ person.display_name }}</span>
                <span class="convo-preview-text">@{{ person.username }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Database } from '~/types/database.types'
import type { Profile } from '~/types'

definePageMeta({ layout: 'default' })
useHead({ title: 'Messages — Chirp' })

const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const { showToast } = useToast()

// Types
interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read: boolean
}

interface Conversation {
  id: string
  other_user: Profile
  last_message: string | null
  last_message_at: string
  unread_count: number
}

// State
const conversations = ref<Conversation[]>([])
const activeConversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sending = ref(false)
const showNewMessage = ref(false)
const recipientSearch = ref('')
const recipientResults = ref<Profile[]>([])
const suggestedUsers = ref<Profile[]>([])
const searchingRecipients = ref(false)
const messagesScrollEl = ref<HTMLElement>()
const messageInputEl = ref<HTMLTextAreaElement>()
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth <= 700
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 700
  })
})

// Fetch conversations
async function fetchConversations() {
  if (!session.value?.user) return
  loadingConversations.value = true

  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      last_message,
      last_message_at,
      participant_1,
      participant_2,
      unread_count_1,
      unread_count_2
    `)
    .or(`participant_1.eq.${session.value.user.id},participant_2.eq.${session.value.user.id}`)
    .order('last_message_at', { ascending: false })

  if (error || !data) {
    loadingConversations.value = false
    return
  }

  const otherIds = data.map((c) =>
    c.participant_1 === session.value?.user!.id ? c.participant_2 : c.participant_1
  )

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherIds)

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  conversations.value = data.map((c) => {
    const otherId = c.participant_1 === session.value?.user!.id ? c.participant_2 : c.participant_1
    const isParticipant1 = c.participant_1 === session.value?.user!.id
    return {
      id: c.id,
      other_user: profileMap.get(otherId) as Profile,
      last_message: c.last_message,
      last_message_at: c.last_message_at,
      unread_count: isParticipant1 ? (c.unread_count_1 ?? 0) : (c.unread_count_2 ?? 0),
    }
  }).filter((c) => c.other_user)

  loadingConversations.value = false
}

// Suggested users
async function fetchSuggestedUsers() {
  if (!session.value?.user) return
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', session.value.user.id)
    .limit(10)
  suggestedUsers.value = (data ?? []) as Profile[]
}

// Open conversation
async function openConversation(convo: Conversation) {
  activeConversation.value = convo
  await fetchMessages(convo.id)
  await markConversationRead(convo.id)
  convo.unread_count = 0
  await fetchUnreadCount() // refresh the nav badge
  nextTick(() => scrollToBottom())
}

const { fetchUnreadCount } = useMessages()

async function fetchMessages(conversationId: string) {
  loadingMessages.value = true
  const { data } = await supabase
    .from('direct_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(100)
  messages.value = (data ?? []) as Message[]
  loadingMessages.value = false
}

async function markConversationRead(conversationId: string) {
  if (!session.value?.user) return
  const { data: convo } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversationId)
    .single()
  if (!convo) return
  const field = convo.participant_1 === session.value.user.id ? 'unread_count_1' : 'unread_count_2'
  await supabase
    .from('conversations')
    .update({ [field]: 0 } as never)
    .eq('id', conversationId)
}

// Send message
async function sendMessage() {
  if (!newMessage.value.trim() || !activeConversation.value || !session.value?.user) return
  sending.value = true
  const content = newMessage.value.trim()
  newMessage.value = ''

  if (messageInputEl.value) {
    messageInputEl.value.style.height = 'auto'
    messageInputEl.value.style.height = '36px'
  }

  const { data, error } = await supabase
    .from('direct_messages')
    .insert({
      conversation_id: activeConversation.value.id,
      sender_id: session.value.user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    showToast('Failed to send message.', 'error')
    newMessage.value = content
    sending.value = false
    return
  }

  if (data) {
    messages.value.push(data as Message)
    activeConversation.value.last_message = content
    activeConversation.value.last_message_at = data.created_at
    nextTick(() => scrollToBottom())
  }

  sending.value = false
}

// New conversation
let searchTimeout: ReturnType<typeof setTimeout>

async function searchRecipients() {
  if (!recipientSearch.value.trim()) {
    recipientResults.value = []
    return
  }
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    searchingRecipients.value = true
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', session.value?.user?.id ?? '')
      .or(`username.ilike.%${recipientSearch.value}%,display_name.ilike.%${recipientSearch.value}%`)
      .limit(8)
    recipientResults.value = (data ?? []) as Profile[]
    searchingRecipients.value = false
  }, 300)
}

async function startConversation(person: Profile) {
  if (!session.value?.user) return

  const existing = conversations.value.find((c) => c.other_user.id === person.id)
  if (existing) {
    showNewMessage.value = false
    await openConversation(existing)
    return
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: session.value.user.id,
      participant_2: person.id,
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !data) {
    showToast('Failed to start conversation.', 'error')
    return
  }

  const newConvo: Conversation = {
    id: data.id,
    other_user: person,
    last_message: null,
    last_message_at: data.last_message_at,
    unread_count: 0,
  }

  conversations.value.unshift(newConvo)
  showNewMessage.value = false
  recipientSearch.value = ''
  recipientResults.value = []
  await openConversation(newConvo)
}

// Realtime
function subscribeToMessages() {
  if (!session.value?.user) return
  const channel = supabase
    .channel('messages-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'direct_messages' },
      async (payload) => {
        const msg = payload.new as Message
        if (activeConversation.value?.id === msg.conversation_id && msg.sender_id !== session.value?.user?.id) {
          messages.value.push(msg)
          nextTick(() => scrollToBottom())
          await markConversationRead(msg.conversation_id)
        } else {
          const convo = conversations.value.find((c) => c.id === msg.conversation_id)
          if (convo) {
            convo.unread_count++
            convo.last_message = msg.content
            convo.last_message_at = msg.created_at
          } else {
            await fetchConversations()
          }
        }
      }
    )
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// Helpers
function scrollToBottom() {
  if (messagesScrollEl.value) {
    messagesScrollEl.value.scrollTop = messagesScrollEl.value.scrollHeight
  }
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  const newHeight = Math.min(el.scrollHeight, 80)
  el.style.height = newHeight + 'px'
}

function shouldShowDateSeparator(idx: number): boolean {
  if (idx === 0) return true
  const prev = messages.value[idx - 1]
  const curr = messages.value[idx]
  if (!prev || !curr) return false
  return new Date(prev.created_at).toDateString() !== new Date(curr.created_at).toDateString()
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMsgTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function formatFullTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Lifecycle
let unsubscribe: (() => void) | undefined

watch(session, (s) => {
  if (s?.user) {
    fetchConversations()
    fetchSuggestedUsers()
    unsubscribe = subscribeToMessages()
  }
}, { immediate: true })

onUnmounted(() => unsubscribe?.())
</script>

<style scoped>
:global(.app-main:has(.messages-layout)) {
  overflow: hidden;
  padding: 0;
}

.messages-layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  min-height: 100vh;
  max-width: 100%;
  overflow: hidden;
}

.messages-sidebar {
  border-right: 1px solid var(--color-border-subtle);
  overflow-y: auto;
  height: 100vh;
  position: sticky;
  top: 0;
  min-width: 0;
}

.messages-sidebar .feed-tabs {
  width: 100%;
  box-sizing: border-box;
}

.messages-thread {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  min-width: 0;
  overflow: hidden;
}

.messages-thread-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  flex-shrink: 0;
}

.messages-thread-header-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
}

.messages-thread-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  text-decoration: none;
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  transition: background var(--transition-fast);
}

.messages-thread-user:hover {
  background: var(--color-surface-2);
}

.messages-thread-user:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.messages-scroll {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) 0;
  display: flex;
  flex-direction: column;
}

/* Conversations */
.convo-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  padding-right: var(--space-6);
  background: none;
  border: none;
  border-bottom: 1px solid var(--color-border-subtle);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background var(--transition-fast);
  color: var(--color-text-primary);
}

.convo-item:hover {
  background: var(--color-surface-2);
}

.convo-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.convo-item--active {
  background: var(--color-accent-dim);
}

.convo-item--active:hover {
  background: var(--color-accent-muted);
}

.convo-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-surface-3);
}

.convo-avatar--sm {
  width: 36px;
  height: 36px;
}

.convo-info {
  flex: 1;
  min-width: 0;
}

.convo-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
}

.convo-name {
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.convo-item--unread .convo-name {
  font-weight: 700;
}

.convo-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.convo-preview-text {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.convo-item--unread .convo-preview-text {
  color: var(--color-text-primary);
  font-weight: 500;
}

.convo-unread-badge {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* Messages */
.message-row {
  display: flex;
  flex-direction: column;
  padding: 2px var(--space-5);
}

.message-row--mine {
  align-items: flex-end;
}

.message-date-separator {
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  padding: var(--space-4) 0 var(--space-2);
  width: 100%;
}

.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 70%;
  margin-bottom: var(--space-1);
}

.message-bubble-wrapper--mine {
  align-items: flex-end;
}

.message-bubble {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  border-bottom-left-radius: var(--radius-sm);
  background: var(--color-surface-3);
  color: var(--color-text-primary);
  font-size: var(--text-base);
  line-height: var(--leading-snug);
  word-break: break-word;
  white-space: pre-wrap;
}

.message-bubble--mine {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-bottom-left-radius: var(--radius-xl);
  border-bottom-right-radius: var(--radius-sm);
}

.message-time {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  padding: 2px var(--space-2);
}

/* Composer */
.message-composer {
  border-top: 1px solid var(--color-border-subtle);
  padding: var(--space-3) var(--space-4);
  flex-shrink: 0;
}

.message-composer-inner {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-3);
  transition: border-color var(--transition-fast);
}

.message-composer-inner:focus-within {
  border-color: var(--color-accent);
}

.message-input {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text-primary);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-snug);
  resize: none;
  padding: var(--space-2) 0;
  min-height: unset;
  max-height: 36px;
  overflow-y: auto;
}

.message-input::placeholder {
  color: var(--color-text-tertiary);
}

.message-input:focus {
  outline: none;
}

.message-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-accent);
  border: none;
  border-radius: 50%;
  color: var(--color-text-inverse);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.message-send-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
  transform: scale(1.05);
}

.message-send-btn:disabled {
  background: var(--color-surface-3);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.message-send-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* New message button */
.new-message-btn {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-3);
  background: var(--color-accent-dim);
  border: 1px solid var(--color-accent-muted);
  border-radius: var(--radius-lg);
  color: var(--color-accent);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin: auto;
}

.new-message-btn:hover {
  background: var(--color-accent-muted);
}

.new-message-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Mobile */
@media (max-width: 700px) {
  .messages-layout {
    grid-template-columns: 1fr;
  }

  .messages-sidebar--hidden {
    display: none;
  }

  .messages-thread {
    display: none;
  }

  .messages-thread--visible {
    display: flex;
  }
}
</style>