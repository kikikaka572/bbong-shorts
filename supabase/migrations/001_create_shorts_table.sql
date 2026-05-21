-- =============================================
-- 뽕쇼츠 Supabase 스키마
-- Supabase Dashboard > SQL Editor 에서 실행
-- =============================================

CREATE TABLE IF NOT EXISTS shorts (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id        TEXT        UNIQUE NOT NULL,
  title             TEXT        NOT NULL,
  channel_name      TEXT        NOT NULL,
  channel_youtube_id TEXT       NOT NULL,
  category          TEXT        NOT NULL,
  thumbnail         TEXT,
  published_at      TIMESTAMPTZ,
  duration          INTEGER     NOT NULL DEFAULT 0,
  view_count        BIGINT      NOT NULL DEFAULT 0,
  like_count        BIGINT      NOT NULL DEFAULT 0,
  url               TEXT        NOT NULL,
  fetched_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 카테고리 필터링 인덱스
CREATE INDEX IF NOT EXISTS shorts_category_idx ON shorts (category);
-- 최신순 정렬 인덱스
CREATE INDEX IF NOT EXISTS shorts_published_at_idx ON shorts (published_at DESC);
-- 복합 인덱스 (카테고리별 최신순)
CREATE INDEX IF NOT EXISTS shorts_category_published_idx ON shorts (category, published_at DESC);

-- RLS 활성화 (공개 읽기 허용)
ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON shorts
  FOR SELECT USING (true);

-- 서비스 롤키로만 INSERT/UPDATE/DELETE 가능 (RLS bypass)
-- GitHub Actions 스크립트는 SUPABASE_SERVICE_ROLE_KEY 사용
