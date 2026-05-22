import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Header } from "@/components/Header";
import { useRanking } from "@/hooks/useShorts";
import type { Short } from "@/types/shorts";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Ranking() {
  const navigate = useNavigate();
  const { data: shorts = [], isLoading } = useRanking(20);

  const handleClick = (short: Short) => {
    navigate(`/${encodeURIComponent(short.category)}/play?index=0`);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[800px] px-5 py-6 pb-16">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h1 className="text-xl font-bold">클릭 랭킹</h1>
          <span className="text-sm text-muted-foreground">팬들이 가장 많이 클릭한 쇼츠</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-sm text-muted-foreground">불러오는 중...</div>
        ) : shorts.filter(s => (s.click_count ?? 0) > 0).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl">🎤</span>
            <p className="text-sm text-muted-foreground">아직 클릭 데이터가 없습니다</p>
            <p className="text-xs text-muted-foreground">쇼츠를 클릭하면 랭킹이 쌓여요!</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {shorts
              .filter(s => (s.click_count ?? 0) > 0)
              .map((short, i) => (
                <li
                  key={short.id}
                  className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-3 transition-all hover:border-[#e8453c] hover:shadow-md active:scale-[0.99]"
                  onClick={() => handleClick(short)}
                >
                  {/* 순위 */}
                  <div className="w-8 shrink-0 text-center">
                    {i < 3 ? (
                      <span className="text-xl">{MEDALS[i]}</span>
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  {/* 썸네일 */}
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {short.thumbnail ? (
                      <img src={short.thumbnail} alt={short.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* 정보 */}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-[1.4]">{short.title}</p>
                    <p className="mt-0.5 text-[11px] font-medium text-[#ff7b54]">{short.channel_name}</p>
                  </div>

                  {/* 클릭수 */}
                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold text-[#e8453c]">{(short.click_count ?? 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">클릭</p>
                  </div>
                </li>
              ))}
          </ol>
        )}
      </main>
    </div>
  );
}
