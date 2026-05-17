<template>
  <section class="composer" aria-label="Compose a new chirp">
    <figure class="composer-avatar" aria-hidden="true">
      <img
        v-if="userProfile?.avatar_url"
        :src="userProfile.avatar_url"
        :alt="userProfile.display_name"
        width="44"
        height="44" />
      <span v-else class="post-avatar-placeholder">
        {{ userProfile?.display_name?.[0]?.toUpperCase() || '?' }}
      </span>
    </figure>

    <form class="composer-form" novalidate @submit.prevent="handleSubmit">

      <!-- Replying to context -->
      <p
        v-if="replyTo"
        style="color: var(--color-text-tertiary); font-size: var(--text-sm); margin-bottom: var(--space-2);"
        aria-live="polite">
        Replying to
        <NuxtLink
          :to="`/profile/${replyTo.profile?.username}`"
          style="color: var(--color-accent); text-decoration: none;">@{{ replyTo.profile?.username
          }}</NuxtLink>
      </p>

      <!-- Textarea -->
      <label :for="`composer-text-${uid}`" class="sr-only">
        {{ replyTo ? `Reply to ${replyTo.profile?.display_name}` : "What's happening?" }}
      </label>
      <textarea
        :id="`composer-text-${uid}`"
        ref="textareaEl"
        v-model="content"
        class="composer-textarea"
        :placeholder="replyTo ? 'Write your reply...' : `What's happening?`"
        :aria-describedby="`char-count-${uid} composer-hint-${uid}`"
        :aria-invalid="isOverLimit"
        maxlength="300"
        rows="3"
        @input="autoResize"
        @keydown.ctrl.enter="handleSubmit"
        @keydown.meta.enter="handleSubmit"></textarea>

      <!-- Multi-image preview grid -->
      <div
        v-if="images.length > 0"
        class="composer-image-grid"
        :class="`composer-image-grid--${images.length}`"
        role="list"
        aria-label="Attached images">
        <div
          v-for="(img, index) in images"
          :key="img.previewUrl"
          class="composer-image-item"
          role="listitem">

          <!-- Thumbnail + remove button -->
          <figure class="composer-image-figure">
            <img
              :src="img.previewUrl"
              alt=""
              class="composer-image-thumb" />
            <button
              type="button"
              class="composer-image-remove"
              :aria-label="`Remove image ${index + 1}`"
              @click="removeImage(index)">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14"
                fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </figure>

          <!-- Alt text input -->
          <div class="composer-alt-wrapper">
            <!-- Saved state: show summary + edit button -->
            <div v-if="img.altSaved" class="composer-alt-saved">
              <span class="composer-alt-saved-label">ALT</span>
              <span class="composer-alt-saved-text">{{ img.altText || 'No alt text' }}</span>
              <button
                type="button"
                class="composer-alt-edit-btn"
                :aria-label="`Edit alt text for image ${index + 1}`"
                @click="img.altSaved = false">
                Edit
              </button>
            </div>

            <!-- Editing state: show textarea + save button -->
            <template v-else>
              <label :for="`alt-${uid}-${index}`" class="composer-alt-label">
                Alt text
                <span
                  v-if="requireAltText && !img.altText.trim()"
                  class="composer-alt-required"
                  aria-label="required">*</span>
              </label>
              <div class="composer-alt-field">
                <textarea
                  :id="`alt-${uid}-${index}`"
                  v-model="img.altText"
                  class="composer-alt-textarea"
                  placeholder="Describe this image for screen readers…"
                  maxlength="1000"
                  rows="2"
                  :aria-describedby="`alt-count-${uid}-${index}`"
                  @input="onAltInput"></textarea>
                <output
                  :id="`alt-count-${uid}-${index}`"
                  class="composer-alt-count"
                  :class="{ danger: img.altText.length > 950 }"
                  :aria-label="`${1000 - img.altText.length} characters remaining for alt text`">
                  <span aria-hidden="true">{{ 1000 - img.altText.length }}</span>
                </output>
              </div>
              <button
                type="button"
                class="composer-alt-save-btn"
                :aria-label="`Save alt text for image ${index + 1}`"
                :disabled="!mounted || !canSubmit || isPosting"
                @click="img.altSaved = true">
                Save alt text
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Soft alt text warning -->
      <div
        v-if="showAltWarning"
        class="composer-alt-warning"
        role="alert"
        aria-live="assertive">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16"
          fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p>
          {{ imagesWithoutAlt }} image{{ imagesWithoutAlt > 1 ? 's are' : ' is' }} missing alt text.
          This may make your post less accessible.
        </p>
        <button
          type="button"
          class="composer-alt-warning-dismiss"
          @click="dismissAndPost">
          Post anyway
        </button>
      </div>

      <!-- Error message -->
      <output
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
      </output>

      <div class="composer-divider"></div>

      <footer class="composer-footer">
        <menu class="composer-actions" aria-label="Add to post">
          <li style="position: relative; display: flex; align-items: center; gap: var(--space-1);">
            <input
              type="file"
              :id="`image-upload-${uid}`"
              accept="image/*"
              multiple
              class="sr-only"
              ref="fileInputEl"
              :disabled="images.length >= MAX_IMAGES"
              @change="handleImageUpload" />
            <label
              :for="`image-upload-${uid}`"
              class="composer-action-btn"
              :class="{ 'composer-action-btn--disabled': images.length >= MAX_IMAGES }"
              tabindex="0"
              :aria-label="images.length >= MAX_IMAGES ? 'Maximum 4 images attached' : 'Add images to post'"
              :aria-disabled="images.length >= MAX_IMAGES"
              @keydown.enter.prevent="images.length < MAX_IMAGES && fileInputEl?.click()"
              @keydown.space.prevent="images.length < MAX_IMAGES && fileInputEl?.click()">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"
                focusable="false">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </label>
            <span
              v-if="images.length > 0"
              class="composer-image-badge"
              aria-live="polite"
              :aria-label="`${images.length} of ${MAX_IMAGES} images attached`">
              {{ images.length }}/{{ MAX_IMAGES }}
            </span>
          </li>
          <li>
            <button
              ref="emojiTriggerEl"
              type="button"
              @click="toggleEmojiPicker"
              class="composer-action-btn"
              aria-label="Add emoji"
              :aria-expanded="showEmojiPicker">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                fill="none" stroke="var(--color-accent)" stroke-width="2" aria-hidden="true"
                focusable="false">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <circle cx="9" cy="9" r="1.5" fill="var(--color-accent)" stroke="none" />
                <circle cx="15" cy="9" r="1.5" fill="var(--color-accent)" stroke="none" />

              </svg>
            </button>
            <Teleport to="body">
              <EmojiPicker
                v-if="showEmojiPicker"
                :style="pickerStyle"
                style="position: fixed; z-index: 9999;"
                @select="onEmojiSelect"
                @close="showEmojiPicker = false" />
            </Teleport>
          </li>
        </menu>

        <div class="composer-right" role="group" aria-label="Post controls">
          <!-- Character count -->
          <output
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
          </output>

          <!-- Progress ring -->
          <svg
            v-if="content.length > 0"
            viewBox="0 0 30 30"
            width="30"
            height="30"
            aria-hidden="true">
            <circle cx="15" cy="15" r="12" fill="none" stroke="var(--color-surface-3)"
              stroke-width="3" />
            <circle
              cx="15" cy="15" r="12"
              fill="none"
              :stroke="isOverLimit ? 'var(--color-error)' : charsRemaining <= 20 ? 'var(--color-warning)' : 'var(--color-accent)'"
              stroke-width="3"
              stroke-linecap="round"
              stroke-dasharray="75.4"
              :stroke-dashoffset="75.4 - (content.length / 140) * 75.4"
              transform="rotate(-90 15 15)"
              style="transition: stroke-dashoffset 100ms ease, stroke 200ms ease;" />
          </svg>

          <span :id="`composer-hint-${uid}`" class="sr-only">
            Press Ctrl+Enter or Cmd+Enter to chirp. Maximum 140 characters.
          </span>

          <button
            type="submit"
            class="composer-submit-btn"
            :disabled="!canSubmit || isPosting"
            :aria-busy="isPosting">
            <span v-if="isPosting">
              <span class="sr-only">Chirping...</span>
              <span aria-hidden="true">Chirping...</span>
            </span>
            <span v-else>{{ replyTo ? 'Reply' : 'Chirp' }}</span>
          </button>
        </div>
      </footer>
    </form>
  </section>
</template>

<script setup lang="ts">
import type { Post } from '~/types'
import type { Database } from '~/types/database.types'

interface ImageEntry {
  file: File
  previewUrl: string
  altText: string
  altSaved: boolean
}

const props = defineProps<{
  replyTo?: Post
  autoFocus?: boolean
}>()

const emit = defineEmits<{
  posted: [post: Post]
}>()

const uid = useId()
const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const { userProfile } = useProfile()
const { announce } = useA11yAnnouncer()
const { showToast } = useToast()
const { prefs: a11yPrefs } = useAccessibilityPrefs()

const content = ref('')
const images = ref<ImageEntry[]>([])
const isPosting = ref(false)
const errorMsg = ref('')
const showEmojiPicker = ref(false)
const showAltWarning = ref(false)
const altWarningDismissed = ref(false)
const textareaEl = ref<HTMLTextAreaElement>()
const fileInputEl = ref<HTMLInputElement>()

const MAX_CHARS = 140
const MAX_IMAGES = 4

const emojiTriggerEl = ref<HTMLButtonElement>()
const pickerStyle = ref<Record<string, string>>({})

const requireAltText = computed(() => a11yPrefs.value?.require_alt_text ?? false)
const charsRemaining = computed(() => MAX_CHARS - content.value.length)
const isOverLimit = computed(() => charsRemaining.value < 0)
const imagesWithoutAlt = computed(() => images.value.filter(img => !img.altText.trim()).length)
const canSubmit = computed(() =>
  content.value.trim().length > 0 &&
  !isOverLimit.value &&
  !isPosting.value &&
  !showAltWarning.value
)
const mounted = ref(false)
onMounted(() => { mounted.value = true })

onMounted(() => {
  if (props.autoFocus) nextTick(() => textareaEl.value?.focus())
})

function autoResize() {
  const el = textareaEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

// Dismiss warning if user fills in alt text after seeing it
function onAltInput() {
  if (imagesWithoutAlt.value === 0) {
    showAltWarning.value = false
  }
}

function handleImageUpload(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files ?? [])
  if (!files.length) return

  const remaining = MAX_IMAGES - images.value.length
  const toAdd = files.slice(0, remaining)

  for (const file of toAdd) {
    if (!file.type.startsWith('image/')) {
      errorMsg.value = 'Please select image files only.'
      continue
    }
    if (file.size > 5 * 1024 * 1024) {
      errorMsg.value = `${file.name} exceeds the 5MB limit.`
      continue
    }
    images.value.push({ file, previewUrl: URL.createObjectURL(file), altText: '', altSaved: false })
  }

  errorMsg.value = ''
  if (fileInputEl.value) fileInputEl.value.value = ''
  // Reset warning state when image set changes
  altWarningDismissed.value = false
  showAltWarning.value = false
}

function removeImage(index: number) {
  const removed = images.value.splice(index, 1)[0]
  if (removed) URL.revokeObjectURL(removed.previewUrl)
  altWarningDismissed.value = false
  showAltWarning.value = false
}

function insertEmoji(emoji: string) {
  const el = textareaEl.value
  if (!el) {
    content.value += emoji
    return
  }
  const start = el.selectionStart ?? content.value.length
  const end = el.selectionEnd ?? content.value.length
  content.value = content.value.slice(0, start) + emoji + content.value.slice(end)
  nextTick(() => {
    el.selectionStart = el.selectionEnd = start + emoji.length
    el.focus()
  })
  showEmojiPicker.value = false
}

function toggleEmojiPicker() {
  if (!showEmojiPicker.value) {
    const rect = emojiTriggerEl.value!.getBoundingClientRect()
    const pickerHeight = 360
    const wouldOverflow = rect.bottom + 8 + pickerHeight > window.innerHeight

    pickerStyle.value = {
      bottom: '100px',
      left: '800px',
    }
  }
  showEmojiPicker.value = !showEmojiPicker.value
}

function onEmojiSelect(emoji: string) {
  insertEmoji(emoji)
}

function dismissAndPost() {
  altWarningDismissed.value = true
  showAltWarning.value = false
  submitPost()
}

async function handleSubmit() {
  if (!canSubmit.value || !session.value?.user) return

  // Show soft warning if require_alt_text is on and any image is missing alt
  if (requireAltText.value && imagesWithoutAlt.value > 0 && !altWarningDismissed.value) {
    showAltWarning.value = true
    return
  }

  await submitPost()
}

async function submitPost() {
  if (!session.value?.user) return
  isPosting.value = true
  errorMsg.value = ''

  try {
    const imageUrls: string[] = []
    const imageAlts: string[] = []

    for (const img of images.value) {
      const ext = img.file.name.split('.').pop()
      const path = `posts/${session.value.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, img.file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
      imageUrls.push(publicUrl)
      imageAlts.push(img.altText.trim())
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        user_id: session.value.user.id,
        content: content.value.trim(),
        image_urls: imageUrls.length > 0 ? imageUrls : null,
        image_alts: imageAlts.length > 0 ? imageAlts : null,
        reply_to_id: props.replyTo?.id || null,
      })
      .select('*, profile:profiles(*)')
      .single()

    if (error) throw error

    // Cleanup
    content.value = ''
    images.value.forEach(img => URL.revokeObjectURL(img.previewUrl))
    images.value = []
    altWarningDismissed.value = false
    showAltWarning.value = false
    if (textareaEl.value) textareaEl.value.style.height = 'auto'

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

<style scoped>
/* ── Image grid ─────────────────────────────────────────────── */
.composer-image-grid {
  display: grid;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}

.composer-image-grid--1 {
  grid-template-columns: 1fr;
}

.composer-image-grid--2 {
  grid-template-columns: 1fr 1fr;
}

.composer-image-grid--3 {
  grid-template-columns: 1fr 1fr;
}

.composer-image-grid--3 .composer-image-item:first-child {
  grid-column: 1 / -1;
}

.composer-image-grid--4 {
  grid-template-columns: 1fr 1fr;
}

.composer-image-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.composer-image-figure {
  position: relative;
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-2);
}

.composer-image-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.composer-image-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: rgba(0, 0, 0, 0.75);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}

.composer-image-remove:hover {
  background: rgba(0, 0, 0, 0.92);
}

.composer-image-remove:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ── Alt text ───────────────────────────────────────────────── */
.composer-alt-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.composer-alt-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.composer-alt-required {
  color: var(--color-warning, #f59e0b);
  margin-left: 2px;
}

.composer-alt-field {
  position: relative;
}

.composer-alt-textarea {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  padding-right: 3rem;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--text-xs);
  font-family: inherit;
  resize: none;
  line-height: 1.5;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.composer-alt-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.composer-alt-count {
  position: absolute;
  bottom: var(--space-2);
  right: var(--space-2);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.composer-alt-count.danger {
  color: var(--color-error);
}

.composer-alt-saved {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-height: 36px;
}

.composer-alt-saved-label {
  flex-shrink: 0;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-inverse, #fff);
  background: var(--color-accent);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.04em;
}

.composer-alt-saved-text {
  flex: 1;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.composer-alt-edit-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.composer-alt-edit-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 2px;
}

.composer-alt-save-btn {
  align-self: flex-end;
  padding: var(--space-1) var(--space-3);
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-inverse, #fff);
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.composer-alt-save-btn:hover {
  opacity: 0.85;
}

.composer-alt-save-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ── Soft warning banner ────────────────────────────────────── */
.composer-alt-warning {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  margin: var(--space-2) 0;
  background: color-mix(in srgb, var(--color-warning, #f59e0b) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-warning, #f59e0b) 35%, transparent);
  border-radius: var(--radius-lg);
}

.composer-alt-warning svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--color-warning, #f59e0b);
}

.composer-alt-warning p {
  flex: 1;
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text);
  line-height: 1.4;
}

.composer-alt-warning-dismiss {
  flex-shrink: 0;
  padding: var(--space-1) var(--space-3);
  background: var(--color-warning, #f59e0b);
  border: none;
  border-radius: var(--radius-md);
  color: #000;
  font-size: var(--text-xs);
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.composer-alt-warning-dismiss:hover {
  opacity: 0.85;
}

.composer-alt-warning-dismiss:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* ── Image count badge + disabled state ─────────────────────── */
.composer-image-badge {
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-text-tertiary);
}

.composer-action-btn--disabled {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}
</style>