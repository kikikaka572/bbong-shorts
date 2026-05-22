import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useShorts, incrementClick } from "@/hooks/useShorts";
import { ShareButton } from "@/components/ShareButton";
import { fmtViews, fmtDuration } from "@/lib/utils";
import type { Category, Short } from "@/types/shorts";

const THRESHOLD = 50;
const SLOTS = [-1, 0, 1] as const;

const PALETTE = ["#e8453c", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#f97316"];

function categoryColor(category: string): string {
  let hash = 0;
  for (const c of category) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return PALETTE[hash % PALETTE.length];
}

export default function Player() {
  const navigate = useNavigate();
  const { category: categoryParam } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const category = (categoryParam ? decodeURIComponent(categoryParam) : "전체") as Category;
  const startIndex = parseInt(searchParams.get("index") ?? "0", 10);

  const [index, setIndex] = useState(startIndex);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [snapTarget, setSnapTarget] = useState<number | null>(null);
  const [skipTransition, setSkipTransition] = useState(false);

  const touchYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const snapRef = useRef<number | null>(null);
  const lastWheelRef = useRef(0);
  const hasNextRef = useRef(false);
  const hasPrevRef = useRef(false);
  const indexRef = useRef(0);
  const itemsRef = useRef<Short[]>([]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useShorts(category);
  const items: Short[] = data?.pages.flatMap((p) => p) ?? [];

  const vh = window.innerHeight;
  const hasNext = index < items.length - 1;
  const hasPrev = index > 0;

  hasNextRef.current = hasNext;
  hasPrevRef.current = hasPrev;
  indexRef.current = index;
  itemsRef.current = items;

  // 끝 근처에서 추가 로드
  useEffect(() => {
    if (index >= items.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [index, items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const goNext = () => {
    if (!hasNextRef.current) return;
    const next = itemsRef.current[indexRef.current + 1];
    if (next) incrementClick(next.id);
    snapRef.current = -vh;
    setSkipTransition(false);
    setSnapTarget(-vh);
  };

  const goPrev = () => {
    if (!hasPrevRef.current) return;
    const prev = itemsRef.current[indexRef.current - 1];
    if (prev) incrementClick(prev.id);
    snapRef.current = vh;
    setSkipTransition(false);
    setSnapTarget(vh);
  };

  // 마우스 휠 스크롤
  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelRef.current < 600) return;
    lastWheelRef.current = now;
    if (e.deltaY > 0) goNext();
    else if (e.deltaY < 0) goPrev();
  };

  // 키보드 방향키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") goNext();
      else if (e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    touchYRef.current = e.touches[0].clientY;
    dragYRef.current = 0;
    setDragging(true);
    setSkipTransition(false);
    setSnapTarget(null);
    snapRef.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchYRef.current === null) return;
    let d = e.touches[0].clientY - touchYRef.current;
    // 끝에서 고무줄 저항감
    if ((d < 0 && !hasNext) || (d > 0 && !hasPrev)) d *= 0.15;
    dragYRef.current = d;
    setDragY(d);
  };

  const onTouchEnd = () => {
    const d = dragYRef.current;
    setDragging(false);
    touchYRef.current = null;

    if (d < -THRESHOLD && hasNext) {
      goNext();
    } else if (d > THRESHOLD && hasPrev) {
      goPrev();
    } else {
      snapRef.current = 0;
      setSnapTarget(0);
    }
  };

  // 슬롯 0 (현재)의 transition 완료 시 인덱스 업데이트
  const onTransitionEnd = () => {
    const snap = snapRef.current;
    setSkipTransition(true);
    if (snap === -vh) setIndex((i) => i + 1);
    else if (snap === vh) setIndex((i) => i - 1);
    snapRef.current = null;
    setSnapTarget(null);
    setDragY(0);
    dragYRef.current = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => setSkipTransition(false)));
  };

  const slotY = (slot: -1 | 0 | 1): number => {
    const offset = snapTarget !== null ? snapTarget : dragY;
    return slot * vh + offset;
  };

  const transition = (dragging || skipTransition)
    ? "none"
    : "transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <p className="text-sm text-white/50">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
      style={{ touchAction: "none" }}
    >
      {SLOTS.map((slot) => {
        const short = items[index + slot];
        if (!short) return null;

        return (
          <div
            key={slot}
            className="absolute inset-0"
            style={{
              transform: `translateY(${slotY(slot)}px)`,
              transition,
              willChange: "transform",
            }}
            onTransitionEnd={slot === 0 ? onTransitionEnd : undefined}
          >
            <Slide short={short} active={slot === 0} />
          </div>
        );
      })}

      {/* 뒤로가기 */}
      <button
        className="absolute left-4 z-[200] flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
        style={{ top: "max(1rem, env(safe-area-inset-top, 1rem))", touchAction: "auto" }}
        onClick={() => navigate(-1)}
        aria-label="뒤로가기"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      {/* 카운터 */}
      <div
        className="absolute right-4 z-[200] rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm"
        style={{ top: "max(1rem, env(safe-area-inset-top, 1rem))" }}
      >
        {index + 1} / {items.length}
      </div>

      <ShareButton
        title={items[index]?.title}
        text={`${items[index]?.channel_name} - ${items[index]?.title}`}
        url={items[index]?.url}
      />
    </div>
  );
}

function Slide({ short, active }: { short: Short; active: boolean }) {
  return (
    <div className="relative h-full bg-black">
      {/* 영상 (전체 화면) */}
      {active ? (
        <iframe
          key={short.youtube_id}
          src={`https://www.youtube.com/embed/${short.youtube_id}?autoplay=1&rel=0&controls=0`}
          className="absolute inset-0 h-full w-full border-none"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={short.title}
        />
      ) : short.thumbnail ? (
        <img
          src={short.thumbnail}
          alt={short.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Play className="h-16 w-16 text-white/20" />
        </div>
      )}

      {/* 상단 제스처 캡처 영역 (iframe 터치 차단 → 스와이프 인식) */}
      <div className="absolute inset-x-0 top-0 z-10 h-20" />

      {/* 하단 정보 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-5 pb-10 pt-24">
        <span
          className="mb-1.5 block text-[11px] font-semibold"
          style={{ color: categoryColor(short.category) }}
        >
          {short.category} · {fmtDuration(short.duration)}
        </span>
        <p className="mb-1.5 text-[15px] font-bold leading-[1.3] text-white line-clamp-2">
          {short.title}
        </p>
        <div className="mb-4 flex items-center justify-between text-[12px] text-white/60">
          <span>{short.channel_name}</span>
          <span>▶ {fmtViews(short.view_count)}</span>
        </div>
        <a
          href={short.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8453c] py-3 text-sm font-semibold text-white active:opacity-80"
          style={{ touchAction: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          YouTube에서 보기
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
