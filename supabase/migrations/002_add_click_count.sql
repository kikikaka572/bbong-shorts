-- click_count 컬럼 추가
ALTER TABLE shorts ADD COLUMN IF NOT EXISTS click_count BIGINT NOT NULL DEFAULT 0;

-- 랭킹 정렬용 인덱스
CREATE INDEX IF NOT EXISTS shorts_click_count_idx ON shorts (click_count DESC);

-- 클릭 수 원자적 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_click(short_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE shorts SET click_count = click_count + 1 WHERE id = short_id;
END;
$$;

-- 아티스트별 총 클릭수 집계 함수
CREATE OR REPLACE FUNCTION get_artist_ranking()
RETURNS TABLE(category TEXT, total_clicks BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT category, SUM(click_count) AS total_clicks
  FROM shorts
  GROUP BY category
  ORDER BY total_clicks DESC;
$$;

-- 익명 사용자도 RPC 호출 허용
GRANT EXECUTE ON FUNCTION increment_click(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_artist_ranking() TO anon, authenticated;
