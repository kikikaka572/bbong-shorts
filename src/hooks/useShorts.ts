import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { type Category, type Short, PAGE_SIZE } from "@/types/shorts";

// Total count for a given category (for stats display)
export function useShortsCount(category: Category) {
  return useQuery({
    queryKey: ["shorts-count", category],
    queryFn: async () => {
      const q = supabase
        .from("shorts")
        .select("*", { count: "exact", head: true });
      if (category !== "전체") q.eq("category", category);
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

      const q = supabase
        .from("shorts")
        .select("*")
        .order("published_at", { ascending: false })
        .range(from, to);

      if (category !== "전체") q.eq("category", category);

      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Short[];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}
