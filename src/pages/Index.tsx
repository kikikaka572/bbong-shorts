import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { RankingTicker } from "@/components/RankingTicker";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ShortsGrid } from "@/components/ShortsGrid";
import { AdBanner } from "@/components/AdBanner";
import { useShorts, useShortsCount, incrementClick } from "@/hooks/useShorts";
import type { Category, Short } from "@/types/shorts";

export default function Index() {
  const navigate = useNavigate();
  const { category: categoryParam } = useParams<{ category: string }>();
  const category: Category = categoryParam ? decodeURIComponent(categoryParam) : "전체";

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

  const handleCategoryChange = (newCategory: Category) => {
    if (newCategory === "전체") navigate("/");
    else navigate(`/${encodeURIComponent(newCategory)}`);
  };

  const handleSelect = (short: Short) => {
    const idx = allItems.findIndex((s) => s.id === short.id);
    if (idx < 0) return;
    incrementClick(short.id);
    navigate(`/${encodeURIComponent(category)}/play?index=${idx}`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <RankingTicker />
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
    </div>
  );
}
