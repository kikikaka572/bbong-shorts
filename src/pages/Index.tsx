import { useState } from "react";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ShortsGrid } from "@/components/ShortsGrid";
import { VideoModal } from "@/components/VideoModal";
import { AdBanner } from "@/components/AdBanner";
import { useShorts, useShortsCount } from "@/hooks/useShorts";
import type { Category, Short } from "@/types/shorts";

export default function Index() {
  const [category, setCategory] = useState<Category>("전체");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data: count } = useShortsCount(category);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useShorts(category);

  const allItems: Short[] = data?.pages.flatMap((p) => p) ?? [];
  const selected = selectedIndex !== null ? (allItems[selectedIndex] ?? null) : null;

  const handleSelect = (short: Short) => {
    const idx = allItems.findIndex((s) => s.id === short.id);
    setSelectedIndex(idx >= 0 ? idx : null);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    const next = selectedIndex + 1;
    // 끝에 가까워지면 추가 로드
    if (next >= allItems.length - 3 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
    if (next < allItems.length) setSelectedIndex(next);
  };

  const handlePrev = () => {
    if (selectedIndex === null || selectedIndex === 0) return;
    setSelectedIndex(selectedIndex - 1);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setSelectedIndex(null);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <CategoryTabs active={category} onChange={handleCategoryChange} />

      <main className="mx-auto max-w-[1400px] px-5 py-5 pb-16">
        <div className="mb-5">
          <AdBanner />
        </div>

        <p className="mb-4 text-[13px] text-muted-foreground">
          <strong className="text-foreground">{(count ?? 0).toLocaleString()}</strong>개의 쇼츠
        </p>

        <ShortsGrid
          items={allItems}
          isLoading={isLoading}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          onSelect={handleSelect}
        />
      </main>

      <VideoModal
        short={selected}
        onClose={() => setSelectedIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedIndex !== null && selectedIndex < allItems.length - 1}
        hasPrev={selectedIndex !== null && selectedIndex > 0}
      />
    </div>
  );
}
