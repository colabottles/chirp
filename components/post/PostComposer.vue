<template>
  <section
    class="composer"
    aria-label="Compose a new post">
    <div class="composer-avatar" aria-hidden="true">
      <img
        v-if="userProfile?.avatar_url"
        :src="userProfile.avatar_url"
        :alt="userProfile.display_name"
        width="44"
        height="44" />
      <div v-else class="post-avatar-placeholder">
        {{ userProfile?.display_name?.[0]?.toUpperCase() || '?' }}
      </div>
    </div>

    <form
      class="composer-form"
      @submit.prevent="handleSubmit"
      novalidate>
      <!-- Replying to context -->
      <div
        v-if="replyTo"
        style="color: var(--color-text-tertiary); font-size: var(--text-sm); margin-bottom: var(--space-2);"
        aria-live="polite">
        Replying to
        <NuxtLink
          :to="`/profile/${replyTo.profile?.username}`"
          style="color: var(--color-accent); text-decoration: none;">@{{ replyTo.profile?.username
          }}</NuxtLink>
      </div>

      <!-- Textarea -->
      <div class="composer-textarea-wrapper">
        <label
          :for="`composer-text-${uid}`"
          class="sr-only">
          {{ replyTo ? `Reply to ${replyTo.profile?.display_name}` : 'What\'s happening?' }}
        </label>
        <textarea
          :id="`composer-text-${uid}`"
          ref="textareaEl"
          v-model="content"
          class="composer-textarea"
          :placeholder="replyTo ? 'Write your reply...' : 'What\'s happening?'"
          :aria-describedby="`char-count-${uid} composer-hint-${uid}`"
          :aria-invalid="isOverLimit"
          maxlength="300"
          rows="3"
          @input="autoResize"
          @keydown.ctrl.enter="handleSubmit"
          @keydown.meta.enter="handleSubmit"></textarea>
      </div>

      <!-- Image preview -->
      <div
        v-if="imagePreview"
        class="composer-image-preview"
        style="position: relative; margin: var(--space-3) 0;">
        <img
          :src="imagePreview"
          alt="Image to be uploaded"
          style="width: 100%; border-radius: var(--radius-lg); max-height: 280px; object-fit: cover;" />
        <button
          type="button"
          class="modal-close-btn"
          style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7);"
          aria-label="Remove image"
          @click="removeImage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
            fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <!-- Error message -->
      <div
        v-if="errorMsg"
        role="alert"
        class="form-error"
        aria-live="assertive">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ errorMsg }}
      </div>

      <div class="composer-divider"></div>

      <div class="composer-footer">
        <!-- Attachment actions -->
        <div class="composer-actions" role="group" aria-label="Add to post">
          <!-- Image upload -->
          <input
            type="file"
            :id="`image-upload-${uid}`"
            accept="image/*"
            class="sr-only"
            ref="fileInputEl"
            @change="handleImageUpload" />
          <label
            :for="`image-upload-${uid}`"
            class="composer-action-btn"
            tabindex="0"
            aria-label="Add image to post"
            @keydown.enter.prevent="fileInputEl?.click()"
            @keydown.space.prevent="fileInputEl?.click()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </label>

          <!-- Emoji -->
          <button
            type="button"
            class="composer-action-btn"
            aria-label="Add emoji"
            @click="showEmojiPicker = !showEmojiPicker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
              focusable="false">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
        </div>

        <div class="composer-right">
          <!-- Character count — WCAG 3.3.1 Error Identification -->
          <div
            :id="`char-count-${uid}`"
            class="composer-char-count"
            :class="{
              warning: charsRemaining <= 20 && charsRemaining > 0,
              danger: isOverLimit
            }"
            :aria-label="`${charsRemaining} characters remaining`"
            aria-live="polite"
            aria-atomic="true">
            <span aria-hidden="true">{{ charsRemaining }}</span>
          </div>

          <!-- Progress ring -->
          <svg
            v-if="content.length > 0"
            viewBox="0 0 30 30"
            width="30"
            height="30"
            aria-hidden="true">
            <circle
              cx="15" cy="15" r="12"
              fill="none"
              stroke="var(--color-surface-3)"
              stroke-width="3" />
            <circle
              cx="15" cy="15" r="12"
              fill="none"
              :stroke="isOverLimit ? 'var(--color-error)' : charsRemaining <= 20 ? 'var(--color-warning)' : 'var(--color-accent)'"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="75.4"
              :stroke-dashoffset="75.4 - (content.length / 280) * 75.4"
              transform="rotate(-90 15 15)"
              style="transition: stroke-dashoffset 100ms ease, stroke 200ms ease;" />
          </svg>

          <!-- Hidden hint text -->
          <span :id="`composer-hint-${uid}`" class="sr-only">
            Press Ctrl+Enter or Cmd+Enter to post. Maximum 280 characters.
          </span>

          <!-- Submit button -->
          <button
            type="submit"
            class="composer-submit-btn"
            :disabled="!canSubmit || isPosting"
            :aria-busy="isPosting">
            <span v-if="isPosting">
              <span class="sr-only">Posting...</span>
              <span aria-hidden="true">Posting...</span>
            </span>
            <span v-else>{{ replyTo ? 'Reply' : 'Post' }}</span>
          </button>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Post } from '~/types'

const props = defineProps<{
  replyTo?: Post
  autoFocus?: boolean
}>()

const emit = defineEmits<{
  posted: [post: Post]
}>()

const uid = useId()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const { userProfile } = useProfile()
const { announce } = useAnnouncer()
const { showToast } = useToast()

const content = ref('')
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const isPosting = ref(false)
const errorMsg = ref('')
const showEmojiPicker = ref(false)
const textareaEl = ref<HTMLTextAreaElement>()
const fileInputEl = ref<HTMLInputElement>()

const MAX_CHARS = 280
const charsRemaining = computed(() => MAX_CHARS - content.value.length)
const isOverLimit = computed(() => charsRemaining.value < 0)
const canSubmit = computed(() =>
  content.value.trim().length > 0 && !isOverLimit.value && !isPosting.value
)

onMounted(() => {
  if (props.autoFocus) {
    nextTick(() => textareaEl.value?.focus())
  }
})

function autoResize() {
  const el = textareaEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errorMsg.value = 'Please select an image file.'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'Image must be under 5MB.'
    return
  }
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
  errorMsg.value = ''
}

function removeImage() {
  imagePreview.value = null
  imageFile.value = null
  if (fileInputEl.value) fileInputEl.value.value = ''
}

async function handleSubmit() {
  if (!canSubmit.value || !user.value) return

  isPosting.value = true
  errorMsg.value = ''

  try {
    let imageUrl: string | null = null

    // Upload image if present
    if (imageFile.value) {
      const ext = imageFile.value.name.split('.').pop()
      const path = `posts/${user.value.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile.value)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(path)
      imageUrl = publicUrl
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.value.id,
        content: content.value.trim(),
        image_url: imageUrl,
        reply_to_id: props.replyTo?.id || null,
      })
      .select(`
        *,
        profile:profiles(*)
      `)
      .single()

    if (error) throw error

    // Reset
    content.value = ''
    removeImage()
    if (textareaEl.value) {
      textareaEl.value.style.height = 'auto'
    }

    // Announce to screen reader
    announce(props.replyTo ? 'Reply posted successfully.' : 'Post published successfully.')
    showToast(props.replyTo ? 'Reply posted!' : 'Your post is live!', 'success')

    emit('posted', post as Post)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to post. Please try again.'
    errorMsg.value = message
    announce(`Error: ${message}`)
  } finally {
    isPosting.value = false
  }
}
</script>