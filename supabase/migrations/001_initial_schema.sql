-- ============================================================
-- Chirp Twitter Clone — Supabase Database Schema
-- Run this in your Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- for full-text search

-- ============================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with public profile data
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  bio text,
  avatar_url text,
  banner_url text,
  website text,
  location text,
  followers_count integer default 0 not null,
  following_count integer default 0 not null,
  posts_count integer default 0 not null,
  is_verified boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Constraints
  constraint username_length check (char_length(username) >= 3 and char_length(username) <= 30),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$'),
  constraint display_name_length check (char_length(display_name) >= 1 and char_length(display_name) <= 50),
  constraint bio_length check (bio is null or char_length(bio) <= 160),
  constraint website_format check (website is null or website ~ '^https?://')
);

-- ============================================================
-- POSTS TABLE
-- Core content: posts, replies, reposts
-- ============================================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  reply_to_id uuid references public.posts(id) on delete set null,
  repost_of_id uuid references public.posts(id) on delete cascade,
  likes_count integer default 0 not null,
  reposts_count integer default 0 not null,
  replies_count integer default 0 not null,
  views_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Constraints
  constraint content_length check (char_length(content) >= 1 and char_length(content) <= 280),
  constraint no_self_repost check (repost_of_id != id),
  -- Reposts have no content beyond the original
  constraint repost_has_content check (
    repost_of_id is null or char_length(content) <= 280
  )
);

-- ============================================================
-- LIKES TABLE
-- ============================================================
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  unique(user_id, post_id)
);

-- ============================================================
-- FOLLOWS TABLE
-- ============================================================
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('like', 'repost', 'follow', 'reply', 'mention')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false not null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now() not null,

  unique(user_id, post_id)
);

-- ============================================================
-- HASHTAGS TABLE
-- For trending topics
-- ============================================================
create table public.hashtags (
  id uuid default uuid_generate_v4() primary key,
  tag text unique not null,
  post_count integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create table public.post_hashtags (
  post_id uuid references public.posts(id) on delete cascade not null,
  hashtag_id uuid references public.hashtags(id) on delete cascade not null,
  primary key (post_id, hashtag_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_posts_reply_to_id on public.posts(reply_to_id);
create index idx_posts_repost_of_id on public.posts(repost_of_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(user_id, read);
create index idx_bookmarks_user_id on public.bookmarks(user_id);
create index idx_profiles_username on public.profiles(username);

-- Full text search on posts
create index idx_posts_content_fts on public.posts using gin(to_tsvector('english', content));
create index idx_profiles_username_trgm on public.profiles using gin(username gin_trgm_ops);
create index idx_profiles_display_name_trgm on public.profiles using gin(display_name gin_trgm_ops);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url, banner_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New User'),
    new.raw_user_meta_data->>'avatar_url',
    null
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update profile updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at();
create trigger posts_updated_at before update on public.posts
  for each row execute procedure public.update_updated_at();

-- Update likes_count when a like is added/removed
create or replace function public.update_likes_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    -- Create notification
    insert into public.notifications (user_id, actor_id, type, post_id)
      select p.user_id, new.user_id, 'like', new.post_id
      from public.posts p
      where p.id = new.post_id and p.user_id != new.user_id;
  elsif (tg_op = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
  end if;
  return null;
end;
$$;

create trigger on_like_change
  after insert or delete on public.likes
  for each row execute procedure public.update_likes_count();

-- Update replies_count
create or replace function public.update_replies_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT' and new.reply_to_id is not null) then
    update public.posts set replies_count = replies_count + 1 where id = new.reply_to_id;
    -- Create notification
    insert into public.notifications (user_id, actor_id, type, post_id)
      select p.user_id, new.user_id, 'reply', new.id
      from public.posts p
      where p.id = new.reply_to_id and p.user_id != new.user_id;
  elsif (tg_op = 'DELETE' and old.reply_to_id is not null) then
    update public.posts set replies_count = greatest(0, replies_count - 1) where id = old.reply_to_id;
  end if;
  return null;
end;
$$;

create trigger on_reply_change
  after insert or delete on public.posts
  for each row execute procedure public.update_replies_count();

-- Update reposts_count
create or replace function public.update_reposts_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT' and new.repost_of_id is not null) then
    update public.posts set reposts_count = reposts_count + 1 where id = new.repost_of_id;
    insert into public.notifications (user_id, actor_id, type, post_id)
      select p.user_id, new.user_id, 'repost', new.id
      from public.posts p
      where p.id = new.repost_of_id and p.user_id != new.user_id;
  elsif (tg_op = 'DELETE' and old.repost_of_id is not null) then
    update public.posts set reposts_count = greatest(0, reposts_count - 1) where id = old.repost_of_id;
  end if;
  return null;
end;
$$;

create trigger on_repost_change
  after insert or delete on public.posts
  for each row execute procedure public.update_reposts_count();

-- Update posts_count on profile
create or replace function public.update_posts_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles set posts_count = posts_count + 1 where id = new.user_id;
  elsif (tg_op = 'DELETE') then
    update public.profiles set posts_count = greatest(0, posts_count - 1) where id = old.user_id;
  end if;
  return null;
end;
$$;

create trigger on_post_change
  after insert or delete on public.posts
  for each row execute procedure public.update_posts_count();

-- Update follower/following counts
create or replace function public.update_follow_counts()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set followers_count = followers_count + 1 where id = new.following_id;
    insert into public.notifications (user_id, actor_id, type)
      values (new.following_id, new.follower_id, 'follow');
  elsif (tg_op = 'DELETE') then
    update public.profiles set following_count = greatest(0, following_count - 1) where id = old.follower_id;
    update public.profiles set followers_count = greatest(0, followers_count - 1) where id = old.following_id;
  end if;
  return null;
end;
$$;

create trigger on_follow_change
  after insert or delete on public.follows
  for each row execute procedure public.update_follow_counts();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;
alter table public.hashtags enable row level security;
alter table public.post_hashtags enable row level security;

-- PROFILES policies
create policy "Profiles are publicly viewable"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- POSTS policies
create policy "Posts are publicly viewable"
  on public.posts for select using (true);

create policy "Authenticated users can create posts"
  on public.posts for insert with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete using (auth.uid() = user_id);

-- LIKES policies
create policy "Likes are publicly viewable"
  on public.likes for select using (true);

create policy "Authenticated users can like posts"
  on public.likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike their own likes"
  on public.likes for delete using (auth.uid() = user_id);

-- FOLLOWS policies
create policy "Follows are publicly viewable"
  on public.follows for select using (true);

create policy "Authenticated users can follow"
  on public.follows for insert with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete using (auth.uid() = follower_id);

-- NOTIFICATIONS policies
create policy "Users can view their own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update their own notifications (mark read)"
  on public.notifications for update using (auth.uid() = user_id);

-- BOOKMARKS policies
create policy "Users can view their own bookmarks"
  on public.bookmarks for select using (auth.uid() = user_id);

create policy "Users can add bookmarks"
  on public.bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can remove their own bookmarks"
  on public.bookmarks for delete using (auth.uid() = user_id);

-- HASHTAGS - public read
create policy "Hashtags are publicly viewable"
  on public.hashtags for select using (true);

create policy "Post hashtags are publicly viewable"
  on public.post_hashtags for select using (true);

-- ============================================================
-- REALTIME
-- Enable realtime for key tables
-- ============================================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.notifications;