// types/index.ts — Shared TypeScript types for Chirp

export interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  website: string | null
  location: string | null
  created_at: string
  updated_at: string
  followers_count: number
  following_count: number
  posts_count: number
  is_verified: boolean
}

export interface Post {
  id: string
  user_id: string
  content: string
  image_url: string | null
  image_urls: readonly string[] | null
  image_alts: readonly string[] | null  // alt text per image
  reply_to_id: string | null
  repost_of_id: string | null
  created_at: string
  updated_at: string
  likes_count: number
  reposts_count: number
  replies_count: number
  views_count: number
  profile?: Profile
  is_liked?: boolean
  is_reposted?: boolean
  is_bookmarked?: boolean
  reply_to?: Post
  repost_of?: Post
}

export interface Like {
  id: string
  user_id: string
  post_id: string
  created_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'like' | 'repost' | 'follow' | 'reply' | 'mention'
  post_id: string | null
  read: boolean
  created_at: string
  actor?: Profile
  post?: Post
}

export interface Trend {
  tag: string
  post_count: number
  category?: string
}

export type FeedType = 'for-you' | 'following'
export type ThemeMode = 'dark' | 'light'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

// Content Filtering

export interface BlockedAccount {
  id: string
  user_id: string
  blocked_user_id: string
  created_at: string
  // Joined
  blocked_profile?: Profile
}

export interface MutedAccount {
  id: string
  user_id: string
  muted_user_id: string
  created_at: string
  // Joined
  muted_profile?: Profile
}

export interface MutedKeyword {
  id: string
  user_id: string
  keyword: string          // plain word or #hashtag
  match_whole_word: boolean
  mute_reposts: boolean    // also suppress posts that contain keyword as a repost
  created_at: string
  expires_at: string | null
}

export interface ContentFilterPrefs {
  id: string
  user_id: string
  hide_reposts: boolean        // never show any repost in feed
  hide_quote_posts: boolean    // never show quote-posts in feed
  created_at: string
  updated_at: string
}