// AdSense 연동 후 주석 해제하고 publisher ID 교체
// import { useEffect } from "react";
// declare global { interface Window { adsbygoogle: unknown[] } }

export function AdBanner() {
  // AdSense 활성화 시 아래 코드 사용:
  // useEffect(() => {
  //   try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  // }, []);
  // return (
  //   <ins
  //     className="adsbygoogle"
  //     style={{ display: "block" }}
  //     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
  //     data-ad-slot="XXXXXXXXXX"
  //     data-ad-format="auto"
  //     data-full-width-responsive="true"
  //   />
  // );

  return (
    <div className="flex h-[90px] items-center justify-center rounded-lg border border-dashed border-border bg-card text-[13px] text-muted-foreground">
      광고 영역 (AdSense 연동 후 활성화)
    </div>
  );
}
