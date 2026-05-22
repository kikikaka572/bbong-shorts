import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Category, type Short, PAGE_SIZE } from "@/types/shorts";

export async function incrementClick(shortId: string) {
  await supabase.rpc("increment_click", { short_id: shortId });
}

export function useRanking(limit = 20) {
  return useQuery({
    queryKey: ["ranking", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shorts")
        .select("*")
        .order("click_count", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Short[];
    },
    staleTime: 1000 * 60,
  });
}

// Total count for a given category (for stats display)
export function useShortsCount(category: Category) {
  return useQuery({
    queryKey: ["shorts-count", category],
    queryFn: async () => {
      let q = supabase.from("shorts").select("*", { count: "exact", head: true });
      if (category !== "전체") q = q.eq("category", category);
      const { count, error } = await q;
      if (error) throw error;
      return count ?? 0;
    },
  });
}

// Paginated shorts list
export function useShorts(category: Category) {
  return useInfiniteQuery({
    queryKey: ["shorts", category],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const from = (pageParam as number) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let q = supabase
        .from("shorts")
        .select("*")
        .order("published_at", { ascending: false });

      if (category !== "전체") q = q.eq("category", category);

      const { data, error } = await q.range(from, to);
      if (error) throw error;
      return (data ?? []) as Short[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}
