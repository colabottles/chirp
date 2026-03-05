<template>
  <Teleport to="body">
    <div
      class="crop-backdrop"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      @keydown.esc="emit('cancel')">
      <div class="crop-modal">

        <header class="crop-header">
          <button
            type="button"
            class="crop-btn-ghost"
            aria-label="Cancel crop"
            @click="emit('cancel')">
            Cancel
          </button>
          <h2 :id="titleId" class="crop-title">Adjust banner</h2>
          <button
            type="button"
            class="crop-btn-save"
            @click="confirmCrop">
            Apply
          </button>
        </header>

        <p class="crop-hint">Drag to reposition · Scroll or pinch to zoom</p>

        <!-- Canvas viewport -->
        <div
          class="crop-viewport"
          ref="viewportEl"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @wheel.prevent="onWheel"
          @touchstart.prevent="onTouchStart"
          @touchmove.prevent="onTouchMove"
          @touchend="onTouchEnd">
          <canvas ref="canvasEl" class="crop-canvas" />
          <!-- 16:9 overlay guide -->
          <div class="crop-overlay" aria-hidden="true">
            <div class="crop-frame" />
          </div>
        </div>

        <!-- Zoom slider -->
        <div class="crop-controls">
          <span class="crop-zoom-label" aria-hidden="true">−</span>
          <input
            type="range"
            class="crop-zoom-slider"
            :min="minScale"
            :max="minScale * 4"
            :step="0.01"
            :value="scale"
            aria-label="Zoom"
            @input="onSlider" />
          <span class="crop-zoom-label" aria-hidden="true">+</span>
        </div>

        <!-- Hidden output canvas -->
        <canvas ref="outputEl" style="display: none;" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string }>()

const emit = defineEmits<{
  cancel: []
  cropped: [blob: Blob]
}>()

const titleId = useId()
const viewportEl = ref<HTMLDivElement>()
const canvasEl = ref<HTMLCanvasElement>()
const outputEl = ref<HTMLCanvasElement>()

// Output dimensions (16:9)
const OUT_W = 1200
const OUT_H = 675

// Display canvas size (set on mount)
let displayW = 600
let displayH = 337

// Image
const img = new Image()
let imgLoaded = false

// Transform state
const scale = ref(1)
const minScale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

// Drag state
let dragging = false
let dragStartX = 0
let dragStartY = 0
let dragOffsetX = 0
let dragOffsetY = 0

// Pinch state
let lastPinchDist = 0

function clampOffset() {
  if (!imgLoaded) return
  const scaledW = img.naturalWidth * scale.value
  const scaledH = img.naturalHeight * scale.value
  const maxX = 0
  const minX = displayW - scaledW
  const maxY = 0
  const minY = displayH - scaledH
  offsetX.value = Math.min(maxX, Math.max(minX, offsetX.value))
  offsetY.value = Math.min(maxY, Math.max(minY, offsetY.value))
}

function draw() {
  const canvas = canvasEl.value
  if (!canvas || !imgLoaded) return
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, displayW, displayH)
  ctx.drawImage(
    img,
    offsetX.value,
    offsetY.value,
    img.naturalWidth * scale.value,
    img.naturalHeight * scale.value
  )
  requestAnimationFrame(() => { }) // keep reactive
}

function setMinScale() {
  const scaleW = displayW / img.naturalWidth
  const scaleH = displayH / img.naturalHeight
  minScale.value = Math.max(scaleW, scaleH)
  scale.value = minScale.value
  // Center image
  offsetX.value = (displayW - img.naturalWidth * scale.value) / 2
  offsetY.value = (displayH - img.naturalHeight * scale.value) / 2
}

// ── Mouse ──────────────────────────────────────────────────────

function onMouseDown(e: MouseEvent) {
  dragging = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragOffsetX = offsetX.value
  dragOffsetY = offsetY.value
  if (viewportEl.value) viewportEl.value.style.cursor = 'grabbing'
}

function onMouseMove(e: MouseEvent) {
  if (!dragging) return
  offsetX.value = dragOffsetX + (e.clientX - dragStartX)
  offsetY.value = dragOffsetY + (e.clientY - dragStartY)
  clampOffset()
  draw()
}

function onMouseUp() {
  dragging = false
  if (viewportEl.value) viewportEl.value.style.cursor = 'grab'
}

// ── Wheel / scroll zoom ────────────────────────────────────────

function onWheel(e: WheelEvent) {
  const delta = -e.deltaY * 0.001
  const newScale = Math.min(
    minScale.value * 4,
    Math.max(minScale.value, scale.value + delta * scale.value)
  )

  // Zoom toward cursor
  const rect = viewportEl.value!.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  const ratio = newScale / scale.value
  offsetX.value = mouseX - ratio * (mouseX - offsetX.value)
  offsetY.value = mouseY - ratio * (mouseY - offsetY.value)

  scale.value = newScale
  clampOffset()
  draw()
}

// Touch / pinch

function getPinchDist(touches: TouchList) {
  const dx = touches[0]!.clientX - touches[1]!.clientX
  const dy = touches[0]!.clientY - touches[1]!.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) {
    dragging = true
    dragStartX = e.touches[0]!.clientX
    dragStartY = e.touches[0]!.clientY
    dragOffsetX = offsetX.value
    dragOffsetY = offsetY.value
  } else if (e.touches.length === 2) {
    dragging = false
    lastPinchDist = getPinchDist(e.touches)
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && dragging) {
    offsetX.value = dragOffsetX + (e.touches[0]!.clientX - dragStartX)
    offsetY.value = dragOffsetY + (e.touches[0]!.clientY - dragStartY)
    clampOffset()
    draw()
  } else if (e.touches.length === 2) {
    const dist = getPinchDist(e.touches)
    const ratio = dist / lastPinchDist
    const newScale = Math.min(
      minScale.value * 4,
      Math.max(minScale.value, scale.value * ratio)
    )
    const midX = (e.touches[0]!.clientX + e.touches[1]!.clientX) / 2
    const midY = (e.touches[0]!.clientY + e.touches[1]!.clientY) / 2
    const rect = viewportEl.value!.getBoundingClientRect()
    const localX = midX - rect.left
    const localY = midY - rect.top
    const scaleRatio = newScale / scale.value
    offsetX.value = localX - scaleRatio * (localX - offsetX.value)
    offsetY.value = localY - scaleRatio * (localY - offsetY.value)
    scale.value = newScale
    lastPinchDist = dist
    clampOffset()
    draw()
  }
}

function onTouchEnd() {
  dragging = false
}

// ── Slider ────────────────────────────────────────────────────

function onSlider(e: Event) {
  const newScale = parseFloat((e.target as HTMLInputElement).value)
  // Zoom from center
  const cx = displayW / 2
  const cy = displayH / 2
  const ratio = newScale / scale.value
  offsetX.value = cx - ratio * (cx - offsetX.value)
  offsetY.value = cy - ratio * (cy - offsetY.value)
  scale.value = newScale
  clampOffset()
  draw()
}

// ── Confirm ───────────────────────────────────────────────────

function confirmCrop() {
  const output = outputEl.value!
  output.width = OUT_W
  output.height = OUT_H
  const ctx = output.getContext('2d')!

  // Scale factor from display to output
  const scaleToOutput = OUT_W / displayW
  ctx.drawImage(
    img,
    offsetX.value * scaleToOutput,
    offsetY.value * scaleToOutput,
    img.naturalWidth * scale.value * scaleToOutput,
    img.naturalHeight * scale.value * scaleToOutput
  )

  output.toBlob((blob) => {
    if (blob) emit('cropped', blob)
  }, 'image/jpeg', 0.92)
}

// ── Init ──────────────────────────────────────────────────────

onMounted(() => {
  const viewport = viewportEl.value!
  const canvas = canvasEl.value!

  // Measure viewport
  displayW = viewport.clientWidth || 600
  displayH = Math.round(displayW * (9 / 16))
  canvas.width = displayW
  canvas.height = displayH
  viewport.style.height = `${displayH}px`

  img.onload = () => {
    imgLoaded = true
    setMinScale()
    draw()
  }
  img.src = props.src

  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.crop-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: calc(var(--z-modal, 1000) + 10);
  padding: var(--space-4);
  animation: fadeIn 120ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.crop-modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  animation: slideUp 120ms ease;
}

@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.crop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.crop-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.crop-btn-ghost {
  background: none;
  border: none;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  transition: color 0.15s;
}

.crop-btn-ghost:hover {
  color: var(--color-text-primary);
}

.crop-btn-ghost:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.crop-btn-save {
  padding: var(--space-1) var(--space-4);
  background: var(--color-text-primary);
  color: var(--color-surface);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
}

.crop-btn-save:hover {
  opacity: 0.85;
}

.crop-btn-save:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.crop-hint {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
  margin: var(--space-2) 0 0;
  padding: 0 var(--space-4);
}

.crop-viewport {
  position: relative;
  width: 100%;
  overflow: hidden;
  cursor: grab;
  background: #000;
  user-select: none;
  touch-action: none;
}

.crop-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.crop-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.crop-frame {
  position: absolute;
  inset: 0;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.crop-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5) var(--space-4);
}

.crop-zoom-label {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  font-weight: 700;
  flex-shrink: 0;
  width: 16px;
  text-align: center;
}

.crop-zoom-slider {
  flex: 1;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.crop-zoom-slider:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>