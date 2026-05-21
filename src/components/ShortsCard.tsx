import { Play } from "lucide-react";
import { fmtDuration, fmtViews } from "@/lib/utils";
import type { Short } from "@/types/shorts";

interface ShortsCardProps {
  short: Short;
  onClick: (short: Short) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  레전드: "#8b5cf6",
  신트로트: "#e8453c",
  오디션: "#f59e0b",
  커버: "#10b981",
};

export function ShortsCard({ short, onClick }: ShortsCardProps) {
  const catColor = CATEGORY_COLORS[short.category] ?? "#e8453c";

  return (
    <article
      className="group cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[#e8453c] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
      onClick={() => onClick(short)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(short)}
      aria-label={`${short.title} - ${short.channel_name}`}
    >
      {/* Thumbnail */}
      <div className="aspect-shorts relative overflow-hidden bg-muted">
        {short.thumbnail ? (
          <img
            src={short.thumbnail}
            alt={short.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            <Play className="h-10 w-10 fill-white text-white" />
          </div>
        </div>

        {/* Category badge */}
        <span
          className="absolute left-2 top-2 rounded px-2 py-0.5 text-[11px] font-semibold text-white"
          style={{ backgroundColor: catColor }}
        >
          {short.category}
        </span>

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] text-white">
          {fmtDuration(short.duration)}
        </span>
      </div>

      {/* Info */}
      <div className="p-2.5 pb-3">
        <p className="line-clamp-2 text-[13px] font-semibold leading-[1.4] mb-1.5">
          {short.title}
        </p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="font-medium text-[#ff7b54]">{short.channel_name}</span>
          <span>▶ {fmtViews(short.view_count)}</span>
        </div>
      </div>
    </article>
  );
}
