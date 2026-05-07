CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  region VARCHAR(8) NOT NULL,
  favorite_phrase VARCHAR(20),
  role INTEGER NOT NULL DEFAULT 200,
  genres_like JSONB NOT NULL DEFAULT '[]'::jsonb,
  genres_unlike JSONB NOT NULL DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  notifications_read BOOLEAN NOT NULL DEFAULT false,
  is_plex_friend BOOLEAN NOT NULL DEFAULT false,
  api_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_confirm BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(100) NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  "like" BOOLEAN NOT NULL DEFAULT false,
  seen BOOLEAN NOT NULL DEFAULT false,
  pending BOOLEAN NOT NULL DEFAULT false,
  "repeat" BOOLEAN NOT NULL DEFAULT false,
  runtime INTEGER,
  vote NUMERIC(4, 2) NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, media_id)
);

CREATE TABLE IF NOT EXISTS media_tv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(100) NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  "like" BOOLEAN NOT NULL DEFAULT false,
  seen BOOLEAN NOT NULL DEFAULT false,
  pending BOOLEAN NOT NULL DEFAULT false,
  seen_complete BOOLEAN NOT NULL DEFAULT false,
  "repeat" BOOLEAN NOT NULL DEFAULT false,
  runtime INTEGER,
  number_seasons INTEGER,
  number_of_episodes INTEGER,
  runtime_seen INTEGER,
  runtime_seasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  vote NUMERIC(4, 2) NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, media_id)
);

CREATE TABLE IF NOT EXISTS media_tv_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(100) NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  season VARCHAR(20) NOT NULL,
  number_seasons INTEGER NOT NULL,
  number_of_episodes INTEGER NOT NULL,
  seen_complete BOOLEAN NOT NULL DEFAULT false,
  "like" BOOLEAN NOT NULL DEFAULT false,
  seen BOOLEAN NOT NULL DEFAULT false,
  runtime INTEGER,
  vote NUMERIC(4, 2) NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, media_id, season)
);

CREATE TABLE IF NOT EXISTS media_tv_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_id VARCHAR(100) NOT NULL,
  media_type VARCHAR(20) NOT NULL,
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  number_seasons INTEGER NOT NULL,
  number_of_episodes INTEGER NOT NULL,
  episode_external_id VARCHAR(100) NOT NULL,
  "like" BOOLEAN,
  seen BOOLEAN,
  runtime INTEGER,
  vote NUMERIC(4, 2) NOT NULL DEFAULT -1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, media_id, season, episode)
);

CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(40) NOT NULL,
  description TEXT,
  img_playlist TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  medias JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS playlist_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  "like" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, playlist_id)
);

CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  short_description VARCHAR(40),
  description TEXT,
  img_forum TEXT,
  medias JSONB NOT NULL DEFAULT '[]'::jsonb,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forum_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forum_id UUID NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  "like" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, forum_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  text_message TEXT NOT NULL,
  edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plex_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_count INTEGER NOT NULL DEFAULT 0,
  tv_count INTEGER NOT NULL DEFAULT 0,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plex_movie (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_key VARCHAR(50) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  original_title TEXT NOT NULL DEFAULT '',
  year INTEGER,
  imdb_id TEXT,
  tmdb_id TEXT,
  tvdb_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plex_tv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rating_key VARCHAR(50) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  original_title TEXT NOT NULL DEFAULT '',
  year INTEGER,
  imdb_id TEXT,
  tmdb_id TEXT,
  tvdb_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plex_movie_rating_key ON plex_movie(rating_key);
CREATE INDEX IF NOT EXISTS idx_plex_tv_rating_key ON plex_tv(rating_key);

CREATE INDEX IF NOT EXISTS idx_user_followers_following_id ON user_followers(following_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_tv_user_id ON media_tv(user_id);
CREATE INDEX IF NOT EXISTS idx_media_tv_seasons_lookup ON media_tv_seasons(user_id, media_id, season);
CREATE INDEX IF NOT EXISTS idx_media_tv_episodes_lookup ON media_tv_episodes(user_id, media_id, season, episode);
CREATE INDEX IF NOT EXISTS idx_playlist_followers_playlist_id ON playlist_followers(playlist_id);
CREATE INDEX IF NOT EXISTS idx_forum_followers_forum_id ON forum_followers(forum_id);
CREATE INDEX IF NOT EXISTS idx_messages_forum_id ON messages(forum_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_users_lookup ON messages(sender_id, receiver_id, created_at);