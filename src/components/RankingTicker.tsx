import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useArtistRanking } from "@/hooks/useShorts";

const RANK_ICONS = ["🥇", "🥈", "🥉"];
const CYCLE_INTERVAL = 3000;

export function RankingTicker() {
  const navigate = useNavigate();
  const { data: artists = [] } = useArtistRanking();
  const top = artists.filter(a => a.total_clicks > 0).slice(0, 3);

  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (top.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % top.length);
        setVisible(true);
      }, 300);
    }, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, [top.length]);

  if (top.length === 0) return null;

  const current = top[idx];

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm">
      <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-between px-5">
        {/* 왼쪽: 라벨 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#e8453c]">🔥 랭킹</span>
          <span className="h-3 w-px bg-border" />
          {/* 순위 목록 (데스크탑) */}
          <div className="hidden items-center gap-3 sm:flex">
            {top.map((a, i) => (
              <span key={a.category} className="flex items-center gap-1 text-[12px]">
                <span>{RANK_ICONS[i]}</span>
                <span className="font-semibold">{a.category}</span>
                <span className="text-muted-foreground">{a.total_clicks.toLocaleString()}클릭</span>
              </span>
            ))}
          </div>
          {/* 순위 (모바일 - 사이클) */}
          <div className="flex items-center gap-1 sm:hidden">
            <span
              className="text-[13px] font-semibold transition-opacity duration-300"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {RANK_ICONS[idx]} {idx + 1}위&nbsp;
              <span className="text-foreground">{current.category}</span>
              <span className="ml-1 text-muted-foreground text-[11px]">{current.total_clicks.toLocaleString()}클릭</span>
            </span>
          </div>
        </div>

        {/* 오른쪽: 전체 보기 */}
        <button
          onClick={() => navigate("/ranking")}
          className="text-[12px] font-medium text-muted-foreground hover:text-[#e8453c] transition-colors"
        >
          전체 보기 →
        </button>
      </div>
    </div>
  );
}
