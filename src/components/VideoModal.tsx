import { useEffect, useRef } from "react";
import { X, ExternalLink } from "lucide-react";
import { fmtViews } from "@/lib/utils";
import type { Short } from "@/types/shorts";

interface VideoModalProps {
  short: Short | null;
  onClose: () => void;
}

export function VideoModal({ short, onClose }: VideoModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!short) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [short, onClose]);

  if (!short) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={short.title}
    >
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-xl bg-card">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          aria-label="닫기"
        >
          <X className="h-4 w-4" />
        </button>

        {/* YouTube Embed */}
        <div className="aspect-shorts w-full">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${short.youtube_id}?autoplay=1&rel=0`}
            className="h-full w-full border-none"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={short.title}
          />
        </div>

        {/* Video info */}
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
    </div>
  );
}
