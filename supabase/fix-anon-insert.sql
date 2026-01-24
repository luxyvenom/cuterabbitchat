-- 1. creator_id 외래키 제거 (Supabase auth.users 참조 문제 방지)
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_creator_id_fkey;

-- 2. 캐릭터 생성: 로그인 사용자만 허용
DROP POLICY IF EXISTS "Users can create own characters" ON characters;
DROP POLICY IF EXISTS "Anyone can create characters" ON characters;
CREATE POLICY "Authenticated users can create characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND creator_id = auth.uid());

-- 3. 캐릭터 수정: 누구나 가능 (조회수/좋아요 카운트 업데이트용)
DROP POLICY IF EXISTS "Users can update own characters" ON characters;
DROP POLICY IF EXISTS "Anyone can update characters" ON characters;
CREATE POLICY "Anyone can update characters"
  ON characters FOR UPDATE
  USING (true);

-- 4. 캐릭터 삭제: 본인만 가능
DROP POLICY IF EXISTS "Users can delete own characters" ON characters;
DROP POLICY IF EXISTS "Anyone can delete characters" ON characters;
CREATE POLICY "Creator can delete own characters"
  ON characters FOR DELETE
  USING (auth.uid() = creator_id);

-- 5. 태그 연결: 로그인 사용자만 허용
DROP POLICY IF EXISTS "Users can manage tags for own characters" ON character_tags;
DROP POLICY IF EXISTS "Anyone can add character tags" ON character_tags;
CREATE POLICY "Authenticated users can add character tags"
  ON character_tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
