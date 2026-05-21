import { useState } from "react";
import { Header } from "@/components/Header";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ShortsGrid } from "@/components/ShortsGrid";
import { VideoModal } from "@/components/VideoModal";
import { AdBanner } from "@/components/AdBanner";
import { useShortsCount } from "@/hooks/useShorts";
import type { Category, Short } from "@/types/shorts";

export default function Index() {
  const [category, setCategory] = useState<Category>("전체");
  const [selected, setSelected] = useState<Short | null>(null);

  const { data: count } = useShortsCount(category);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <CategoryTabs active={category} onChange={handleCategoryChange} />

      <main className="mx-auto max-w-[1400px] px-5 py-5 pb-16">
        {/* Ad Banner */}
        <div className="mb-5">
          <AdBanner />
        </div>

        {/* Stats */}
        <p className="mb-4 text-[13px] text-muted-foreground">
          <strong className="text-foreground">{(count ?? 0).toLocaleString()}</strong>개의 쇼츠
        </p>

        {/* Grid */}
        <ShortsGrid category={category} onSelect={setSelected} />
      </main>

      {/* Video modal */}
      <VideoModal short={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
