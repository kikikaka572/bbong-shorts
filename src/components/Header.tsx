import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  updatedAt?: string;
}

export function Header({ updatedAt }: HeaderProps) {
  const { pathname } = useLocation();
  const isRanking = pathname === "/ranking";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5">
        <Link to="/" className="flex items-baseline gap-2 cursor-pointer">
          <span
            className="text-[22px] font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #e8453c, #ff7b54)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            뽕쇼츠
          </span>
          <span className="text-[13px] text-muted-foreground font-normal">
            트로트 쇼츠 전문
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/ranking"
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              isRanking
                ? "bg-[#e8453c] text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🔥 랭킹
          </Link>
          {updatedAt && (
            <span className="text-xs text-muted-foreground">
              업데이트: {updatedAt.slice(0, 10)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
