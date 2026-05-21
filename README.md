# 뽕쇼츠 🎵

트로트 YouTube 쇼츠 전문 큐레이션 사이트

**스택**: React 18 + TypeScript + Vite + Shadcn UI + Tailwind CSS  
**DB**: Supabase (PostgreSQL)  
**배포**: Vercel  
**데이터 파이프라인**: GitHub Actions (매일 KST 06:00)

---

## 파일 구조

```
bbong-shorts/
├── src/
│   ├── components/       # Header, CategoryTabs, ShortsCard, ShortsGrid, VideoModal, AdBanner
│   ├── hooks/            # useShorts (Tanstack Query + Supabase)
│   ├── lib/              # supabase.ts, utils.ts
│   ├── pages/            # Index.tsx
│   └── types/            # shorts.ts
├── scripts/
│   └── fetch_shorts.py   # YouTube API → Supabase upsert
├── supabase/
│   └── migrations/
│       └── 001_create_shorts_table.sql
├── .github/workflows/
│   └── fetch-shorts.yml  # 자동 수집 워크플로우
├── vercel.json           # SPA rewrite 설정
└── .env.example
```

---

## 설치 및 실행 가이드

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → New Project
2. Dashboard → **SQL Editor** → `supabase/migrations/001_create_shorts_table.sql` 내용 붙여넣고 실행
3. Settings → API → 다음 값 복사:
   - `Project URL` → `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**절대 프론트엔드 노출 금지**)

### 2. YouTube API 키 발급

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. API 및 서비스 → YouTube Data API v3 활성화
4. 사용자 인증 정보 → API 키 생성 → 복사

### 3. 채널 ID 확인

```
1. 트로트 채널 페이지 접속
2. 페이지 소스 보기 (Ctrl+U)
3. "channelId" 검색
4. UC로 시작하는 24자리 ID 복사
```

### 4. scripts/fetch_shorts.py 채널 설정

```python
CHANNELS = [
    {"id": "UC실제채널ID", "name": "임영웅 공식", "category": "신트로트"},
    # ...
]
```

### 5. 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력

# 개발 서버 시작
npm run dev
```

### 6. GitHub 레포 설정

```bash
git init
git add .
git commit -m "feat: 뽕쇼츠 초기 구성"
git remote add origin https://github.com/kikikaka572/bbong-shorts.git
git push -u origin main
```

GitHub 레포 → **Settings → Secrets and variables → Actions** → 다음 3개 추가:

| Secret 이름 | 값 |
|---|---|
| `YOUTUBE_API_KEY` | YouTube API 키 |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role 키 |

### 7. Vercel 배포

1. [vercel.com](https://vercel.com) → Import Git Repository → `bbong-shorts` 선택
2. Framework Preset: **Vite**
3. Environment Variables 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### 8. 데이터 첫 수집 (수동 실행)

GitHub 레포 → **Actions** 탭 → `뽕쇼츠 쇼츠 데이터 자동 수집` → **Run workflow**

이후 매일 KST 오전 6시에 자동 실행됩니다.

---

## AdSense 연동

`src/components/AdBanner.tsx` 주석 해제 후 publisher ID 교체:

```tsx
data-ad-client="ca-pub-실제ID"
```

`index.html` `<head>`에 AdSense 스크립트 추가:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-실제ID" crossorigin="anonymous"></script>
```

---

## API 할당량 관리

YouTube Data API v3 무료: **하루 10,000 유닛**

| 작업 | 소비 유닛 |
|---|---|
| channels.list (업로드 플리 조회) | ~1 유닛/채널 |
| playlistItems.list (영상 ID 수집) | ~2 유닛/50개 |
| videos.list (상세 정보 조회) | ~2 유닛/50개 |
| **채널 1개 합계** | ~약 6~10 유닛 |
| **10개 채널 합계** | ~약 60~100 유닛/일 |

> 10개 채널 기준 하루 약 60~100 유닛 소비 → 여유 있음.  
> 채널 늘릴 경우 `MAX_PER_CHANNEL` 줄여 조정.
