-- ============================================================
-- TRA3 AI Character Chat Platform - Database Schema
-- Supabase SQL Editor에서 순서대로 실행하세요
-- ============================================================

-- 1. Tags 테이블
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  "group" TEXT NOT NULL DEFAULT 'general'
    CHECK ("group" IN ('general', 'relationship', 'genre', 'concept', 'personality', 'species', 'meta')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Characters 테이블
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  greeting TEXT NOT NULL DEFAULT '',
  personality TEXT NOT NULL DEFAULT '',
  scenario TEXT DEFAULT '',
  image_url TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_name TEXT,
  chat_count INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Character-Tag 관계 테이블
CREATE TABLE IF NOT EXISTS character_tags (
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (character_id, tag_id)
);

-- 4. Favorites 테이블
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, character_id)
);

-- 5. Chat Sessions 테이블
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Chat Messages 테이블
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  token_count INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes (성능 최적화)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_characters_creator ON characters(creator_id);
CREATE INDEX IF NOT EXISTS idx_characters_chat_count ON characters(chat_count DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_character ON chat_sessions(character_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(session_id, created_at);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Tags: 누구나 읽기 가능
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

-- Characters: 누구나 읽기, 본인만 생성/수정/삭제
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Characters are viewable by everyone"
  ON characters FOR SELECT
  USING (true);

CREATE POLICY "Users can create own characters"
  ON characters FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "Users can update own characters"
  ON characters FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY "Users can delete own characters"
  ON characters FOR DELETE
  USING (creator_id = auth.uid());

-- Character Tags: 누구나 읽기
ALTER TABLE character_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Character tags are viewable by everyone"
  ON character_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can manage tags for own characters"
  ON character_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters
      WHERE id = character_id AND creator_id = auth.uid()
    )
  );

-- Favorites: 본인 데이터만
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (user_id = auth.uid());

-- Chat Sessions: 본인 세션만
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON chat_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON chat_sessions FOR DELETE
  USING (user_id = auth.uid());

-- Chat Messages: 본인 세션의 메시지만
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own sessions"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- updated_at 자동 갱신 트리거
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 기본 태그 데이터 (Seed)
-- ============================================================

INSERT INTO tags (name, "group") VALUES
  ('남자친구', 'relationship'),
  ('여자친구', 'relationship'),
  ('친구', 'relationship'),
  ('선생님', 'relationship'),
  ('판타지', 'genre'),
  ('로맨스', 'genre'),
  ('공포', 'genre'),
  ('코미디', 'genre'),
  ('모험', 'genre'),
  ('츤데레', 'personality'),
  ('다정함', 'personality'),
  ('차가움', 'personality'),
  ('장난꾸러기', 'personality'),
  ('지적', 'personality'),
  ('인간', 'species'),
  ('요정', 'species'),
  ('뱀파이어', 'species'),
  ('로봇', 'species'),
  ('OC', 'meta'),
  ('애니', 'meta')
ON CONFLICT (name) DO NOTHING;
