<template>
  <Teleport to="body">
    <div
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="emit('close')"
      @keydown.esc="emit('close')">
      <div class="modal" ref="modalEl">

        <!-- Header -->
        <header class="modal-header">
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close edit profile"
            @click="emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
              fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <h2 :id="titleId" class="modal-title">Edit profile</h2>
          <button
            type="button"
            class="modal-save-btn"
            :disabled="saving"
            :aria-busy="saving"
            @click="handleSave">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </header>

        <div class="modal-body">
          <!-- Banner -->
          <div class="banner-upload-wrap">
            <div class="banner-preview">
              <img
                v-if="bannerPreview"
                :src="bannerPreview"
                alt="Banner preview"
                class="banner-img" />
              <div v-else class="banner-empty" aria-hidden="true"></div>

              <!-- Banner overlay buttons -->
              <div class="banner-overlay">
                <label class="upload-icon-btn" :for="bannerInputId" aria-label="Upload banner image"
                  title="Upload banner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                    fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <input
                    :id="bannerInputId"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    ref="bannerInputEl"
                    @change="onBannerChange" />
                </label>
                <button
                  v-if="bannerPreview"
                  type="button"
                  class="upload-icon-btn"
                  aria-label="Remove banner image"
                  title="Remove banner"
                  @click="removeBanner">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"
                    fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Avatar overlaid on banner bottom-left -->
            <div class="avatar-upload-wrap">
              <div class="avatar-preview">
                <img
                  v-if="avatarPreview"
                  :src="avatarPreview"
                  alt="Avatar preview"
                  class="avatar-img" />
                <div v-else class="avatar-placeholder" aria-hidden="true">
                  {{ props.profile.display_name?.[0]?.toUpperCase() ?? '?' }}
                </div>
                <label class="avatar-upload-btn" :for="avatarInputId"
                  aria-label="Upload avatar image" title="Change avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path
                      d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <input
                    :id="avatarInputId"
                    type="file"
                    accept="image/*"
                    class="sr-only"
                    ref="avatarInputEl"
                    @change="onAvatarChange" />
                </label>
              </div>
            </div>
          </div>

          <!-- Form fields -->
          <div class="modal-fields">
            <div class="modal-field">
              <label :for="fieldId('name')" class="modal-label">Display name</label>
              <input
                :id="fieldId('name')"
                v-model="form.display_name"
                type="text"
                class="form-input"
                maxlength="50"
                autocomplete="name" />
            </div>

            <div class="modal-field">
              <label :for="fieldId('bio')" class="modal-label">Bio</label>
              <textarea
                :id="fieldId('bio')"
                v-model="form.bio"
                class="form-input"
                rows="3"
                maxlength="160"
                style="resize: vertical;"
                :aria-describedby="fieldId('bio-count')" />
              <p :id="fieldId('bio-count')" class="modal-hint" aria-live="polite">
                {{ form.bio?.length ?? 0 }} / 160
              </p>
            </div>

            <div class="modal-field">
              <label :for="fieldId('location')" class="modal-label">Location</label>
              <input
                :id="fieldId('location')"
                v-model="form.location"
                type="text"
                class="form-input"
                maxlength="30"
                autocomplete="address-level2" />
            </div>

            <div class="modal-field">
              <label :for="fieldId('website')" class="modal-label">Website</label>
              <input
                :id="fieldId('website')"
                v-model="form.website"
                type="url"
                class="form-input"
                placeholder="https://"
                autocomplete="url" />
            </div>
          </div>

          <!-- Error -->
          <p v-if="errorMsg" class="modal-error" role="alert">{{ errorMsg }}</p>
        </div>
      </div>
    </div>
    <BannerCropModal
      v-if="showCropModal"
      :src="cropSrc"
      @cropped="onBannerCropped"
      @cancel="showCropModal = false" />
  </Teleport>
</template>

<script setup lang="ts">
import type { Profile } from '~/types'
import type { Database } from '~/types/database.types'

const props = defineProps<{ profile: Profile }>()

const emit = defineEmits<{
  close: []
  saved: [profile: Profile]
}>()

const supabase = useSupabaseClient<Database>()
const session = useSupabaseSession()
const titleId = useId()
const bannerInputId = useId()
const avatarInputId = useId()
const modalEl = ref<HTMLElement>()
const bannerInputEl = ref<HTMLInputElement>()
const avatarInputEl = ref<HTMLInputElement>()
const showCropModal = ref(false)
const cropSrc = ref('')

function fieldId(name: string) { return `edit-profile-${name}` }

// Form state
const form = reactive({
  display_name: props.profile.display_name ?? '',
  bio: props.profile.bio ?? '',
  location: props.profile.location ?? '',
  website: props.profile.website ?? '',
})

// Image state
const bannerPreview = ref<string>(props.profile.banner_url ?? '')
const avatarPreview = ref<string>(props.profile.avatar_url ?? '')
const bannerFile = ref<File | null>(null)
const avatarFile = ref<File | null>(null)
const bannerRemoved = ref(false)

const saving = ref(false)
const errorMsg = ref('')

function onBannerChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    errorMsg.value = 'Banner image must be under 10MB.'
    return
  }
  cropSrc.value = URL.createObjectURL(file)
  showCropModal.value = true
  if (bannerInputEl.value) bannerInputEl.value.value = ''
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    errorMsg.value = 'Avatar image must be under 5MB.'
    return
  }
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function removeBanner() {
  bannerPreview.value = ''
  bannerFile.value = null
  bannerRemoved.value = true
  if (bannerInputEl.value) bannerInputEl.value.value = ''
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const userId = session.value!.user.id
  const ext = file.name.split('.').pop()
  const path = `${folder}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path)
  return publicUrl
}

function onBannerCropped(blob: Blob) {
  showCropModal.value = false
  bannerFile.value = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
  bannerPreview.value = URL.createObjectURL(blob)
  bannerRemoved.value = false
}

async function handleSave() {
  if (!session.value?.user) return
  saving.value = true
  errorMsg.value = ''

  try {
    let avatarUrl = props.profile.avatar_url ?? null
    let bannerUrl = props.profile.banner_url ?? null

    // Upload new avatar if changed
    if (avatarFile.value) {
      avatarUrl = await uploadImage(avatarFile.value, 'avatars')
    }

    // Upload new banner if changed, or null if removed
    if (bannerFile.value) {
      bannerUrl = await uploadImage(bannerFile.value, 'banners')
    } else if (bannerRemoved.value) {
      bannerUrl = null
    }

    const updates = {
      display_name: form.display_name.trim(),
      bio: form.bio.trim() || null,
      location: form.location.trim() || null,
      website: form.website.trim() || null,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.value.user.id)
      .select('*')
      .single()

    if (error) throw error

    emit('saved', data as unknown as Profile)
    emit('close')
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Failed to save profile.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    modalEl.value?.querySelector<HTMLElement>('input, button')?.focus()
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
  if (bannerFile.value) URL.revokeObjectURL(bannerPreview.value)
  if (avatarFile.value) URL.revokeObjectURL(avatarPreview.value)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: var(--z-modal, 1000);
  padding: var(--space-6) var(--space-4);
  overflow-y: auto;
  animation: fadeIn 150ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl, 0 25px 50px rgba(0, 0, 0, 0.5));
  width: 100%;
  max-width: 560px;
  animation: slideUp 150ms ease;
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ── Header ── */
.modal-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.modal-title {
  flex: 1;
  font-family: var(--font-display);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.modal-close-btn:hover {
  background: var(--color-surface-2);
}

.modal-close-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.modal-save-btn {
  padding: var(--space-2) var(--space-5);
  background: var(--color-text-primary);
  color: var(--color-surface);
  border: none;
  border-radius: var(--radius-full);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.modal-save-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.modal-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-save-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ── Banner ── */
.banner-upload-wrap {
  position: relative;
  margin-bottom: 56px;
  /* space for avatar overlap */
}

.banner-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--color-surface-2);
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-empty {
  width: 100%;
  height: 100%;
  background: var(--color-surface-3);
}

.banner-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.15s;
}

.banner-preview:hover .banner-overlay,
.banner-preview:focus-within .banner-overlay {
  opacity: 1;
}

.upload-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}

.upload-icon-btn:hover {
  background: rgba(0, 0, 0, 0.85);
}

.upload-icon-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* ── Avatar ── */
.avatar-upload-wrap {
  position: absolute;
  bottom: -52px;
  left: var(--space-5);
}

.avatar-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid var(--color-surface);
  overflow: hidden;
  background: var(--color-surface-2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent-dim);
  color: var(--color-accent);
  font-size: var(--text-xl);
  font-weight: 700;
  font-family: var(--font-display);
}

.avatar-upload-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.avatar-preview:hover .avatar-upload-btn,
.avatar-preview:focus-within .avatar-upload-btn {
  opacity: 1;
}

.avatar-upload-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  opacity: 1;
}

/* ── Fields ── */
.modal-body {
  padding-bottom: var(--space-6);
}

.modal-fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: 0 var(--space-5);
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.modal-label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal-hint {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  text-align: right;
  margin: 0;
}

.modal-error {
  margin: var(--space-3) var(--space-5) 0;
  font-size: var(--text-sm);
  color: var(--color-error);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>