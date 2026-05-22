import { useEffect } from "react";

declare global {
  interface Window { adsbygoogle: unknown[] }
}

// AD_SLOT: AdSense 광고 단위 생성 후 슬롯 ID 입력 (숫자 10자리)
const AD_SLOT = "";

export function AdBanner() {
  useEffect(() => {
    if (!AD_SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (_) {}
  }, []);

  if (!AD_SLOT) {
    return (
      <div className="flex h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-card text-[13px] text-muted-foreground">
        광고 영역 (AdSense 광고 단위 슬롯 ID 등록 후 활성화)
      </div>
    );
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9613545366726961"
      data-ad-slot={AD_SLOT}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
