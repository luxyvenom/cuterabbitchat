-- 조회수 증가 함수
CREATE OR REPLACE FUNCTION increment_chat_count(char_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE characters
  SET chat_count = chat_count + 1
  WHERE id = char_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
