<template>
  <Teleport to="body">
    <div
      class="alt-modal-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @click.self="emit('close')"
      @keydown.esc="emit('close')">
      <div class="alt-modal" ref="modalEl">
        <header class="alt-modal-header">
          <h2 :id="titleId" class="alt-modal-title">Alt text</h2>
          <button
            type="button"
            class="alt-modal-close"
            aria-label="Close alt text"
            @click="emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"
              fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <!-- Image thumbnail -->
        <figure class="alt-modal-image-wrap">
          <img
            :src="imageUrl"
            alt=""
            class="alt-modal-image"
            loading="lazy" />
        </figure>

        <!-- Editable alt text -->
        <div class="alt-modal-body">
          <label :for="textareaId" class="alt-modal-label">
            Describe this image for people who can't see it.
          </label>
          <textarea
            :id="textareaId"
            ref="textareaEl"
            v-model="draft"
            class="alt-modal-textarea"
            maxlength="1000"
            rows="4"
            placeholder="No alt text yet — add a description here."
            :aria-describedby="charCountId" />
          <div class="alt-modal-footer">
            <span :id="charCountId" class="alt-modal-charcount" aria-live="polite">
              {{ draft.length }} / 1000
            </span>
            <div class="alt-modal-actions">
              <button type="button" class="alt-modal-btn alt-modal-btn--cancel"
                @click="emit('close')">
                Cancel
              </button>
              <button
                type="button"
                class="alt-modal-btn alt-modal-btn--save"
                :disabled="saving"
                :aria-busy="saving"
                @click="handleSave">
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  imageUrl: string
  altText: string
  imageIndex: number
  postId: string
}>()

const emit = defineEmits<{
  close: []
  saved: [index: number, altText: string]
}>()

const supabase = useSupabaseClient()
const titleId = useId()
const textareaId = useId()
const charCountId = useId()
const modalEl = ref<HTMLElement>()
const textareaEl = ref<HTMLTextAreaElement>()

const draft = ref(props.altText)
const saving = ref(false)

async function handleSave() {
  saving.value = true
  try {
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('image_alts')
      .eq('id', props.postId)
      .single()

    if (fetchError) throw fetchError

    const alts: string[] = Array.isArray(post.image_alts) ? [...post.image_alts] : []
    alts[props.imageIndex] = draft.value

    const { error: updateError } = await supabase
      .from('posts')
      .update({ image_alts: alts })
      .eq('id', props.postId)

    if (updateError) throw updateError

    emit('saved', props.imageIndex, draft.value)
    emit('close')
  } catch (err) {
    console.error('Failed to save alt text:', err)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    textareaEl.value?.focus()
  })
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.alt-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal, 1000);
  padding: var(--space-4);
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

.alt-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl, 0 25px 50px rgba(0, 0, 0, 0.5));
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 150ms ease;
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

.alt-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.alt-modal-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.alt-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s;
}

.alt-modal-close:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
}

.alt-modal-close:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.alt-modal-image-wrap {
  margin: 0;
  max-height: 240px;
  overflow: hidden;
  background: var(--color-surface-2);
}

.alt-modal-image {
  width: 100%;
  height: 100%;
  max-height: 240px;
  object-fit: contain;
  display: block;
}

.alt-modal-body {
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alt-modal-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.alt-modal-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.6;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.alt-modal-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
}

.alt-modal-textarea::placeholder {
  color: var(--color-text-tertiary);
  font-style: italic;
}

.alt-modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.alt-modal-charcount {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.alt-modal-actions {
  display: flex;
  gap: var(--space-2);
}

.alt-modal-btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.alt-modal-btn--cancel {
  background: var(--color-surface-2);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.alt-modal-btn--cancel:hover {
  background: var(--color-surface-3);
  color: var(--color-text);
}

.alt-modal-btn--save {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.alt-modal-btn--save:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.alt-modal-btn--save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.alt-modal-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>