interface HeaderProps {
  updatedAt?: string;
}

export function Header({ updatedAt }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-5">
        <div className="flex items-baseline gap-2">
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
        </div>
        {updatedAt && (
          <span className="text-xs text-muted-foreground">
            업데이트: {updatedAt.slice(0, 10)}
          </span>
        )}
      </div>
    </header>
  );
}
