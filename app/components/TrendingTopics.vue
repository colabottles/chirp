<template>
  <div class="trending-card">
    <h2 class="card-title">Trending</h2>
    <template v-if="loading">
      <div v-for="i in 5" :key="i" style="padding: var(--space-3) var(--space-5);">
        <div class="skeleton"
          style="width: 80px; height: 11px; margin-bottom: 6px; border-radius: 2px;"></div>
        <div class="skeleton" style="width: 140px; height: 14px; border-radius: 2px;"></div>
      </div>
    </template>
    <NuxtLink v-for="trend in trends" :key="trend.tag"
      :to="`/explore?tag=${encodeURIComponent(trend.tag)}`" class="trend-item">
      <div class="trend-category">Trending</div>
      <div class="trend-tag">#{{ trend.tag }}</div>
      <div class="trend-count">{{ formatCount(trend.post_count) }} posts</div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Trend } from '~/types'

const supabase = useSupabaseClient()
const trends = ref<Trend[]>([])
const loading = ref(true)

async function fetchTrends() {
  loading.value = true
  const { data } = await supabase
    .from('hashtags')
    .select('tag, post_count')
    .order('post_count', { ascending: false })
    .limit(5)
  trends.value = (data ?? []) as Trend[]
  loading.value = false
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

onMounted(fetchTrends)
</script>