<template>
  <div class="app-layout" :class="{ 'app-layout--messages': route.path.startsWith('/messages') }">
    <NavSidebar />
    <main id="main-content" class="app-main" tabindex="-1">
      <slot />
    </main>
    <aside
      v-if="!route.path.startsWith('/messages')"
      class="app-aside"
      aria-label="Search and suggestions">
      <SearchBox />
      <TrendingTopics />
      <WhoToFollow />
      <AppFooterLinks />
    </aside>
  </div>
  <MobileNav />
  <ComposerModal />
</template>

<script setup lang="ts">
const route = useRoute()
const { announce } = useA11yAnnouncer()
watch(
  () => route.path,
  () => {
    nextTick(() => {
      const title = document.title.split(' — ')[0]
      announce(`Navigated to ${title}`)
    })
  }
)
</script>