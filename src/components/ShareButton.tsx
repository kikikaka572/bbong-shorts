import { useState } from "react";
import { Share2, Copy, Check, X } from "lucide-react";

interface ShareButtonProps {
  title?: string;
  text?: string;
  url?: string;
}

const SHARE_OPTIONS = [
  {
    label: "X (Twitter)",
    icon: "𝕏",
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    label: "Facebook",
    icon: "f",
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
];

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url ?? window.location.href;
  const shareTitle = title ?? "뽕쇼츠 - 트로트 쇼츠 모아보기";
  const shareText = text ?? "임영웅, 영탁, 이찬원, 정동원, 송가인 트로트 쇼츠 한 곳에서! 🔥";

  const handleShare = async () => {
    // 모바일: 네이티브 공유 시트
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (_) {}
      return;
    }
    // 데스크탑: 커스텀 팝업
    setOpen(o => !o);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* 팝업 */}
        {open && (
          <div className="mb-1 w-44 rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-sm">
            {/* 링크 복사 */}
            <button
              onClick={copyLink}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </span>
              {copied ? "복사됐어요!" : "링크 복사"}
            </button>

            {/* SNS 공유 */}
            {SHARE_OPTIONS.map(opt => (
              <a
                key={opt.label}
                href={opt.getUrl(shareUrl, shareTitle)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-muted"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[13px] font-bold">
                  {opt.icon}
                </span>
                {opt.label}
              </a>
            ))}
          </div>
        )}

        {/* 플로팅 버튼 */}
        <button
          onClick={handleShare}
          aria-label="공유하기"
          className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #e8453c, #ff7b54)",
          }}
        >
          {open ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <Share2 className="h-5 w-5 text-white" />
          )}
        </button>
      </div>
    </>
  );
}
