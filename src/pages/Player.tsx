import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { useShorts } from "@/hooks/useShorts";
import { fmtViews, fmtDuration } from "@/lib/utils";
import type { Category, Short } from "@/types/shorts";

const THRESHOLD = 50;
const SLOTS = [-1, 0, 1] as const;

const CAT_COLORS: Record<string, string> = {
  레전드: "#8b5cf6",
  신트로트: "#e8453c",
  오디션: "#f59e0b",
  커버: "#10b981",
};

export default function Player() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = (searchParams.get("category") ?? "전체") as Category;
  const startIndex = parseInt(searchParams.get("index") ?? "0", 10);

  const [index, setIndex] = useState(startIndex);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [snapTarget, setSnapTarget] = useState<number | null>(null);
  const [skipTransition, setSkipTransition] = useState(false);

  const touchYRef = useRef<number | null>(null);
  const dragYRef = useRef(0);
  const snapRef = useRef<number | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useShorts(category);
  const items: Short[] = data?.pages.flatMap((p) => p) ?? [];

  const vh = window.innerHeight;
  const hasNext = index < items.length - 1;
  const hasPrev = index > 0;

  // 끝 근처에서 추가 로드
  useEffect(() => {
    if (index >= items.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [index, items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      snapRef.current = -vh;
      setSnapTarget(-vh);
    } else if (d > THRESHOLD && hasPrev) {
      snapRef.current = vh;
      setSnapTarget(vh);
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
          src={`https://www.youtube.com/embed/${short.youtube_id}?autoplay=1&rel=0`}
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
          style={{ color: CAT_COLORS[short.category] ?? "#e8453c" }}
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
