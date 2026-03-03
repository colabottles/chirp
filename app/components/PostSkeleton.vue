<template>
  <div
    class="post-card"
    aria-hidden="true"
    style="pointer-events: none;">
    <div class="post-avatar-col">
      <div
        class="skeleton"
        style="width: 44px; height: 44px; border-radius: 50; flex-shrink: 0;"></div>
    </div>
    <div class="post-body">
      <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3);">
        <div class="skeleton" style="width: 120px; height: 14px; border-radius: var(--radius-sm);">
        </div>
        <div class="skeleton" style="width: 80px; height: 14px; border-radius: var(--radius-sm);">
        </div>
      </div>
      <div class="skeleton"
        style="width: 100%; height: 14px; border-radius: var(--radius-sm); margin-bottom: var(--space-2);">
      </div>
      <div class="skeleton"
        style="width: 80%; height: 14px; border-radius: var(--radius-sm); margin-bottom: var(--space-2);">
      </div>
      <div class="skeleton"
        style="width: 60%; height: 14px; border-radius: var(--radius-sm); margin-bottom: var(--space-4);">
      </div>
      <div style="display: flex; gap: var(--space-6);">
        <div class="skeleton" style="width: 48px; height: 14px; border-radius: var(--radius-sm);">
        </div>
        <div class="skeleton" style="width: 48px; height: 14px; border-radius: var(--radius-sm);">
        </div>
        <div class="skeleton" style="width: 48px; height: 14px; border-radius: var(--radius-sm);">
        </div>
      </div>
    </div>
  </div>
</template>