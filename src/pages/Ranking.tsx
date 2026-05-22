import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import { Header } from "@/components/Header";
import { useRanking, useArtistRanking } from "@/hooks/useShorts";
import type { Short } from "@/types/shorts";

const MEDALS = ["🥇", "🥈", "🥉"];
const ARTIST_COLORS = ["#e8453c", "#f59e0b", "#8b5cf6", "#10b981", "#3b82f6", "#ec4899", "#f97316"];

export default function Ranking() {
  const navigate = useNavigate();
  const { data: shorts = [], isLoading: shortsLoading } = useRanking(20);
  const { data: artists = [], isLoading: artistsLoading } = useArtistRanking();

  const rankedShorts = shorts.filter(s => (s.click_count ?? 0) > 0);
  const rankedArtists = artists.filter(a => a.total_clicks > 0);

  const handleShortClick = (short: Short) => {
    navigate(`/${encodeURIComponent(short.category)}/play?index=0`);
  };

  const isEmpty = !shortsLoading && !artistsLoading && rankedShorts.length === 0;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-[900px] px-5 py-6 pb-16">

        {/* 타이틀 */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <h1 className="text-xl font-bold">클릭 랭킹</h1>
          <span className="ml-1 rounded-full bg-[#e8453c]/10 px-2 py-0.5 text-[11px] font-semibold text-[#e8453c]">
            실시간
          </span>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl">🎤</span>
            <p className="text-sm font-medium text-muted-foreground">아직 클릭 데이터가 없습니다</p>
            <p className="text-xs text-muted-foreground">쇼츠를 클릭할수록 랭킹이 쌓여요!</p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">

            {/* 아티스트 랭킹 */}
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-[15px] font-bold">
                <span>🎙️</span> 아티스트 랭킹
              </h2>
              {artistsLoading ? (
                <p className="text-sm text-muted-foreground py-4">불러오는 중...</p>
              ) : rankedArtists.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">데이터 없음</p>
              ) : (
                <ol className="space-y-2">
                  {rankedArtists.map((artist, i) => (
                    <li
                      key={artist.category}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-[#e8453c] hover:shadow-md"
                      onClick={() => navigate(`/${encodeURIComponent(artist.category)}`)}
                    >
                      <div className="w-7 shrink-0 text-center">
                        {i < 3 ? (
                          <span className="text-lg">{MEDALS[i]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="text-[14px] font-bold">{artist.category}</span>
                      </div>
                      {/* 클릭 바 */}
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[13px] font-bold text-[#e8453c]">
                          {artist.total_clicks.toLocaleString()}
                        </span>
                        <div className="h-1 w-20 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (artist.total_clicks / (rankedArtists[0]?.total_clicks || 1)) * 100)}%`,
                              backgroundColor: ARTIST_COLORS[i % ARTIST_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* 쇼츠 랭킹 */}
            <section>
              <h2 className="mb-3 flex items-center gap-1.5 text-[15px] font-bold">
                <span>▶️</span> 인기 쇼츠 TOP 20
              </h2>
              {shortsLoading ? (
                <p className="text-sm text-muted-foreground py-4">불러오는 중...</p>
              ) : rankedShorts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">데이터 없음</p>
              ) : (
                <ol className="space-y-2">
                  {rankedShorts.map((short, i) => (
                    <li
                      key={short.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all hover:border-[#e8453c] hover:shadow-md active:scale-[0.99]"
                      onClick={() => handleShortClick(short)}
                    >
                      <div className="w-7 shrink-0 text-center">
                        {i < 3 ? (
                          <span className="text-lg">{MEDALS[i]}</span>
                        ) : (
                          <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </div>
                      <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {short.thumbnail ? (
                          <img src={short.thumbnail} alt={short.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Play className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-[12px] font-semibold leading-[1.4]">{short.title}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-[#ff7b54]">{short.channel_name}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-bold text-[#e8453c]">{(short.click_count ?? 0).toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">클릭</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
