import { useEffect, useRef } from "react";
import { ShortsCard } from "./ShortsCard";
import type { Short } from "@/types/shorts";

interface ShortsGridProps {
  items: Short[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  onSelect: (short: Short) => void;
}

export function ShortsGrid({
  items,
  isLoading,
  isError,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onSelect,
}: ShortsGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center py-20 text-muted-foreground">
        <span className="mb-3 text-4xl">⚠️</span>
        <p className="text-sm">데이터를 불러오지 못했습니다.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-20 text-muted-foreground">
        <span className="mb-3 text-5xl">🎵</span>
        <p className="text-sm">해당 카테고리에 쇼츠가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {items.map((short) => (
          <ShortsCard key={short.id} short={short} onClick={onSelect} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-px mt-5" />

      {isFetchingNextPage && (
        <p className="py-6 text-center text-sm text-muted-foreground">불러오는 중...</p>
      )}
    </>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-shorts w-full animate-pulse bg-muted" />
      <div className="p-2.5">
        <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
