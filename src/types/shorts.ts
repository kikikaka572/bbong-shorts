export type Category = string; // "전체" 또는 연예인명

export interface Short {
  id: string;
  youtube_id: string;
  title: string;
  channel_name: string;
  channel_youtube_id: string;
  category: Category;
  thumbnail: string | null;
  published_at: string | null;
  duration: number;
  view_count: number;
  like_count: number;
  url: string;
  fetched_at: string;
  created_at?: string | null;
  click_count?: number;
}

// fetch_shorts.py의 CHANNELS category 필드와 순서를 맞춰 유지
export const CATEGORIES: Category[] = [
  "전체",
  "임영웅",
  "영탁",
  "이찬원",
  "정동원",
  "송가인",
  "TV조선",
];

export const PAGE_SIZE = 20;
