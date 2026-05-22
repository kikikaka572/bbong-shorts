# 뽕쇼츠 (bbong-shorts)

트로트 YouTube Shorts 큐레이션 사이트. 연예인별 쇼츠를 모아보고 틱톡 스타일로 재생.

## 기술 스택

- **프론트엔드**: React 18 + TypeScript + Vite + Tailwind CSS
- **데이터**: Supabase (PostgreSQL) + `@supabase/supabase-js` v2
- **상태관리**: TanStack Query (`useInfiniteQuery`)
- **라우팅**: React Router v6 (`basename="/bbong-shorts/"`)
- **배포**: GitHub Pages (`gh-pages` 브랜치) — Actions 자동 배포
- **데이터 수집**: Python 스크립트 → GitHub Actions (3시간마다 자동 실행)

## 주요 파일 구조

```
src/
  pages/
    Index.tsx       — 그리드 목록 (카테고리 탭 + 쇼츠 카드)
    Player.tsx      — 틱톡 스타일 전체화면 플레이어 (스와이프 이동)
  components/
    CategoryTabs.tsx  — 연예인 카테고리 탭 (수평 스크롤)
    ShortsGrid.tsx    — 무한 스크롤 그리드
    ShortsCard.tsx    — 썸네일 카드 (NEW 뱃지 포함)
    Header.tsx        — 상단 헤더
    AdBanner.tsx      — 광고 배너
  hooks/
    useShorts.ts      — useShorts / useShortsCount (TanStack Query)
  types/
    shorts.ts         — Short 타입, Category 타입, CATEGORIES 배열
  lib/
    supabase.ts       — Supabase 클라이언트
    utils.ts          — fmtViews, fmtDuration, cn

scripts/
  fetch_shorts.py   — YouTube API → Supabase upsert (GitHub Actions 실행)

supabase/
  migrations/001_create_shorts_table.sql  — DB 스키마

.github/workflows/
  deploy.yml        — main 푸시 시 GitHub Pages 자동 배포
  fetch-shorts.yml  — 3시간마다 쇼츠 수집 (workflow_dispatch로 수동 실행 가능)
```

## 카테고리 = 연예인명

`src/types/shorts.ts`의 `CATEGORIES` 배열과 `scripts/fetch_shorts.py`의 `CHANNELS` 배열을 항상 같이 수정.

**연예인 추가 방법**:
1. `fetch_shorts.py` → `CHANNELS`에 항목 추가
   ```python
   {"id": "UC...", "name": "채널명", "category": "연예인명"}
   ```
2. `src/types/shorts.ts` → `CATEGORIES`에 연예인명 추가

현재 연예인: 임영웅, 영탁, 이찬원, 정동원, 송가인, TV조선

## Player 스와이프 구조

- 3슬롯 고정 (`-1`, `0`, `+1`) — `key={slot}`으로 DOM 재사용
- 슬롯 위치: `slot * vh + (snapTarget ?? dragY)`
- `onTransitionEnd` → 인덱스 업데이트 → `skipTransition=true`로 역방향 애니메이션 방지
- iframe 위 80px 투명 제스처 영역으로 YouTube 터치 차단 우회

## Supabase DB 스키마

```sql
shorts (
  id UUID PK,
  youtube_id TEXT UNIQUE,  -- upsert 기준 키
  title, channel_name, channel_youtube_id, category TEXT,
  thumbnail TEXT,
  published_at TIMESTAMPTZ,
  duration INT,
  view_count, like_count BIGINT,
  url TEXT,
  fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()  -- NEW 뱃지 기준 (7일)
)
```

## 환경변수

로컬 개발 시 `.env` 파일 생성 (`.env.example` 참고):
```
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

GitHub Secrets (Actions용):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — 빌드 시 주입
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — fetch 스크립트용
- `YOUTUBE_API_KEY` — YouTube Data API v3

## 자주 하는 작업

**로컬 개발 서버 실행**
```bash
npm run dev
```

**GitHub Actions 수동으로 데이터 수집**
GitHub → Actions → "뽕쇼츠 쇼츠 데이터 자동 수집" → Run workflow

**카테고리 필터가 안 될 때**
DB 데이터의 category 값이 구버전일 수 있음 → Actions 수동 실행하면 `migrate_categories()`가 자동으로 정정

## PC 간 작업 흐름

```bash
# 작업 시작 전 (어느 PC든)
git pull

# 작업 후
git add .
git commit -m "변경 내용"
git push
```
