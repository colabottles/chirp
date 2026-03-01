<template>
  <footer
    style="padding: var(--space-4) var(--space-2);"
    aria-label="Footer links">
    <nav aria-label="Legal and info">
      <ul
        style="list-style: none; display: flex; flex-wrap: wrap; gap: var(--space-2) var(--space-4);"
        role="list">
        <li v-for="link in links" :key="link.href">
          <a
            :href="link.href"
            style="color: var(--color-text-tertiary); font-size: var(--text-xs); text-decoration: none; transition: color var(--transition-fast);"
            @mouseenter="($event.target as HTMLElement).style.color = 'var(--color-text-secondary)'"
            @mouseleave="($event.target as HTMLElement).style.color = 'var(--color-text-tertiary)'">{{
              link.label }}</a>
        </li>
      </ul>
    </nav>
    <p
      style="color: var(--color-text-tertiary); font-size: var(--text-xs); margin-top: var(--space-3);">
      &copy; {{ year }} Chirp. Made with ❤️, accessibility, and plain vanilla CSS.
    </p>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const links = [
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
  { href: '/accessibility', label: 'Accessibility' },
  { href: '/about', label: 'About' },
]
</script>