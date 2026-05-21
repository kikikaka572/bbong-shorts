"""
뽕쇼츠 — YouTube Shorts Fetcher → Supabase Upsert
채널별 쇼츠 수집 후 Supabase shorts 테이블에 upsert
실행: python scripts/fetch_shorts.py
환경변수:
  YOUTUBE_API_KEY          (GitHub Secret)
  SUPABASE_URL             (GitHub Secret)
  SUPABASE_SERVICE_ROLE_KEY (GitHub Secret)
"""

import os
import re
import json
import requests
from datetime import datetime, timezone

# ─────────────────────────────────────────────────────────────
# 채널 설정
# channel_id 확인법:
#   1. 채널 페이지 접속
#   2. 페이지 소스(Ctrl+U) → "channelId" 검색
#   3. UC로 시작하는 24자리 ID 복사
# ─────────────────────────────────────────────────────────────
CHANNELS = [
    # 신트로트 (확인 완료 ✅)
    {"id": "UC3WZlO2Zl8NE1yIUgtwUtQw", "name": "임영웅",        "category": "신트로트"},
    {"id": "UCH7JoVNZFpo1pOzZH-t5uew", "name": "영탁의 불쑥TV", "category": "신트로트"},
    {"id": "UC4UnP3v-iaFaLdtKwp84Pmw", "name": "이찬원",        "category": "신트로트"},
    {"id": "UCrLQ0ovys23H9xBV6U-Sd4A", "name": "정동원(JD1)",   "category": "신트로트"},
    {"id": "UC3pa6gfuBooj8WUlluD-nNg", "name": "장민호",        "category": "신트로트"},
    # 신트로트 (⚠️ 채널 ID 직접 확인 후 교체)
    {"id": "UCxxxxxxxxxxxxxx06",        "name": "송가인",        "category": "신트로트"},
    # 레전드 (⚠️ 채널 ID 직접 확인 후 교체)
    {"id": "UCxxxxxxxxxxxxxx07",        "name": "나훈아",        "category": "레전드"},
    {"id": "UCxxxxxxxxxxxxxx08",        "name": "태진아",        "category": "레전드"},
    {"id": "UCxxxxxxxxxxxxxx09",        "name": "주현미",        "category": "레전드"},
    # 오디션 (⚠️ 채널 ID 직접 확인 후 교체)
    {"id": "UCxxxxxxxxxxxxxx10",        "name": "TV조선 트로트", "category": "오디션"},
]

MAX_PER_CHANNEL  = 20    # 채널당 최대 수집 수
MAX_DURATION_SEC = 60    # 쇼츠 기준 (60초 이하)

YOUTUBE_API_KEY         = os.environ.get("YOUTUBE_API_KEY", "")
SUPABASE_URL            = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY    = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
YT_BASE                 = "https://www.googleapis.com/youtube/v3"


# ─────────────────────────────────────────────────────────────
# 유틸
# ─────────────────────────────────────────────────────────────
def parse_duration(iso: str) -> int:
    """ISO 8601 → 초. PT1M30S → 90"""
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso)
    if not m:
        return 9999
    return int(m.group(1) or 0) * 3600 + int(m.group(2) or 0) * 60 + int(m.group(3) or 0)


def yt_get(endpoint: str, params: dict) -> dict:
    params["key"] = YOUTUBE_API_KEY
    r = requests.get(f"{YT_BASE}/{endpoint}", params=params, timeout=15)
    r.raise_for_status()
    return r.json()


# ─────────────────────────────────────────────────────────────
# YouTube helpers
# ─────────────────────────────────────────────────────────────
def get_uploads_playlist(channel_id: str) -> str:
    data = yt_get("channels", {"part": "contentDetails", "id": channel_id})
    items = data.get("items", [])
    if not items:
        return ""
    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]


def get_video_ids(playlist_id: str, max_results: int) -> list[str]:
    ids, token = [], None
    while len(ids) < max_results:
        params: dict = {
            "part": "contentDetails",
            "playlistId": playlist_id,
            "maxResults": min(50, max_results - len(ids)),
        }
        if token:
            params["pageToken"] = token
        data  = yt_get("playlistItems", params)
        ids  += [i["contentDetails"]["videoId"] for i in data.get("items", [])]
        token = data.get("nextPageToken")
        if not token:
            break
    return ids


def fetch_shorts(video_ids: list[str], channel_name: str, channel_id: str, category: str) -> list[dict]:
    shorts = []
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i : i + 50]
        data  = yt_get("videos", {
            "part": "snippet,contentDetails,statistics",
            "id":   ",".join(batch),
        })
        for item in data.get("items", []):
            duration = parse_duration(item["contentDetails"]["duration"])
            if duration > MAX_DURATION_SEC:
                continue
            snippet = item["snippet"]
            stats   = item.get("statistics", {})
            shorts.append({
                "youtube_id":         item["id"],
                "title":              snippet.get("title", ""),
                "channel_name":       channel_name,
                "channel_youtube_id": channel_id,
                "category":           category,
                "thumbnail":          snippet.get("thumbnails", {}).get("high", {}).get("url"),
                "published_at":       snippet.get("publishedAt"),
                "duration":           duration,
                "view_count":         int(stats.get("viewCount", 0)),
                "like_count":         int(stats.get("likeCount", 0)),
                "url":                f"https://www.youtube.com/shorts/{item['id']}",
                "fetched_at":         datetime.now(timezone.utc).isoformat(),
            })
    return shorts


# ─────────────────────────────────────────────────────────────
# Supabase upsert (REST API, no extra dependency)
# ─────────────────────────────────────────────────────────────
def supabase_upsert(rows: list[dict]) -> None:
    if not rows:
        return
    url     = f"{SUPABASE_URL}/rest/v1/shorts"
    headers = {
        "apikey":        SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates",
    }
    # Batch in chunks of 500 to stay within Supabase limits
    for i in range(0, len(rows), 500):
        chunk = rows[i : i + 500]
        r = requests.post(url, headers=headers, data=json.dumps(chunk), timeout=30)
        r.raise_for_status()
        print(f"  → Supabase upsert {len(chunk)}건 완료 (HTTP {r.status_code})")


# ─────────────────────────────────────────────────────────────
# 메인
# ─────────────────────────────────────────────────────────────
def main() -> None:
    if not YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY 환경변수가 없습니다.")
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다.")

    all_shorts: list[dict] = []

    for ch in CHANNELS:
        print(f"[{ch['category']}] {ch['name']} 수집 중...")
        try:
            playlist_id = get_uploads_playlist(ch["id"])
            if not playlist_id:
                print("  ✗ 업로드 플레이리스트 없음, 스킵")
                continue
            # 쇼츠 필터링 여유를 위해 3배 조회
            video_ids = get_video_ids(playlist_id, MAX_PER_CHANNEL * 3)
            shorts    = fetch_shorts(video_ids, ch["name"], ch["id"], ch["category"])
            shorts    = shorts[:MAX_PER_CHANNEL]
            all_shorts.extend(shorts)
            print(f"  ✓ {len(shorts)}개 수집 완료")
        except Exception as e:
            print(f"  ✗ 오류: {e}")

    if not all_shorts:
        print("수집된 쇼츠가 없습니다.")
        return

    print(f"\n총 {len(all_shorts)}개 → Supabase upsert 중...")
    supabase_upsert(all_shorts)
    print(f"\n✅ 완료: {len(all_shorts)}개 upsert")


if __name__ == "__main__":
    main()
