<template>
  <div class="app-layout">
    <!-- Primary navigation landmark -->
    <NavSidebar />

    <!-- Main content landmark -->
    <main id="main-content" class="app-main" tabindex="-1">
      <slot />
    </main>

    <!-- Complementary landmark -->
    <aside class="app-aside" aria-label="Search and suggestions">
      <SearchBox />
      <TrendingTopics />
      <WhoToFollow />
      <AppFooterLinks />
    </aside>
  </div>

  <!-- Mobile bottom navigation (outside layout grid) -->
  <MobileNav />
</template>

<script setup lang="ts">
const route = useRoute()
const { announce } = useAnnouncer()

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