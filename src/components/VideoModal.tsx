import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { fmtViews } from "@/lib/utils";
import type { Short } from "@/types/shorts";

interface VideoModalProps {
  short: Short | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

const SWIPE_THRESHOLD = 60;

export function VideoModal({
  short,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}: VideoModalProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!short) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowUp" && hasPrev) onPrev?.();
      if (e.key === "ArrowDown" && hasNext) onNext?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [short, onClose, onNext, onPrev, hasNext, hasPrev]);

  // Reset drag when switching to a different short
  useEffect(() => {
    setDrag({ x: 0, y: 0 });
    dragRef.current = { x: 0, y: 0 };
  }, [short?.id]);

  if (!short) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const x = t.clientX - touchStart.current.x;
    const y = t.clientY - touchStart.current.y;
    dragRef.current = { x, y };
    setDrag({ x, y });
  };

  const handleTouchEnd = () => {
    const { x, y } = dragRef.current;
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    setIsDragging(false);
    touchStart.current = null;

    if (absX > absY && absX > SWIPE_THRESHOLD) {
      // 좌우 스와이프 → 닫기
      onClose();
      return;
    }

    if (absY > absX && absY > SWIPE_THRESHOLD) {
      if (y < 0 && hasNext) {
        // 위로 스와이프 → 다음
        onNext?.();
        return;
      }
      if (y > 0 && hasPrev) {
        // 아래로 스와이프 → 이전
        onPrev?.();
        return;
      }
    }

    // 임계값 미달 → 원위치
    setDrag({ x: 0, y: 0 });
    dragRef.current = { x: 0, y: 0 };
  };

  const absX = Math.abs(drag.x);
  const absY = Math.abs(drag.y);
  const isHSwipe = absX > absY;

  const cardStyle: React.CSSProperties = {
    transform: isHSwipe
      ? `translateX(${drag.x}px)`
      : `translateY(${drag.y * 0.35}px)`,
    transition: isDragging
      ? "none"
      : "transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    opacity: isDragging && isHSwipe ? Math.max(0.4, 1 - absX / 200) : 1,
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4"
      style={{ touchAction: "none" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label={short.title}
    >
      {/* 이전 인디케이터 */}
      {hasPrev && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 text-white/40 pointer-events-none select-none">
          <ChevronUp className="h-5 w-5" />
          <span className="text-[10px] font-medium">이전</span>
        </div>
      )}

      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-xl bg-card"
        style={cardStyle}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* YouTube 임베드 */}
        <div className="aspect-shorts w-full">
          <iframe
            src={`https://www.youtube.com/embed/${short.youtube_id}?autoplay=1&rel=0`}
            className="h-full w-full border-none"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={short.title}
          />
        </div>

        {/* 영상 정보 */}
        <div className="px-4 pb-4 pt-3">
          <p className="mb-1.5 text-[15px] font-semibold leading-[1.4]">{short.title}</p>
          <div className="mb-3 flex items-center justify-between text-[13px] text-muted-foreground">
            <span>{short.channel_name}</span>
            <span>{fmtViews(short.view_count)} 조회</span>
          </div>
          <a
            href={short.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[#e8453c] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#cc3a32]"
          >
            YouTube에서 보기
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* 다음 인디케이터 */}
      {hasNext && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 text-white/40 pointer-events-none select-none">
          <span className="text-[10px] font-medium">다음</span>
          <ChevronDown className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
