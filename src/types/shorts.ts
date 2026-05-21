export type Category = "전체" | "레전드" | "신트로트" | "오디션" | "커버";

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
}

export const CATEGORIES: Category[] = ["전체", "레전드", "신트로트", "오디션", "커버"];
export const PAGE_SIZE = 20;
