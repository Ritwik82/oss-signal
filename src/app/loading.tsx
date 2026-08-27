function PulseBar({ w, h }: { w: string; h: string }) {
  return <div className="rounded-sm" style={{ width: w, height: h, background: "var(--color-ruled)" }} />;
}
function SkeletonWatchCard() {
  return (
    <div className="glass p-4 flex flex-col gap-3" style={{ boxShadow: "var(--card-shadow)" }}>
      <div className="flex items-start justify-between gap-2">
        <PulseBar w="64px" h="18px" />
        <PulseBar w="72px" h="18px" />
      </div>
      <div className="space-y-2">
        <PulseBar w="70%" h="14px" />
        <PulseBar w="45%" h="10px" />
      </div>
      <div className="flex items-center justify-between pt-2 mt-auto" style={{ borderTop: "1px solid var(--color-ruled)" }}>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-ruled)" }} />
          <PulseBar w="80px" h="11px" />
        </div>
        <PulseBar w="40px" h="11px" />
      </div>
    </div>
  );
}
function SkeletonFreshCard() {
  return (
    <div className="glass p-5 flex flex-col gap-3" style={{ boxShadow: "var(--card-shadow)" }}>
      <div className="flex items-start justify-between gap-2">
        <PulseBar w="56px" h="16px" />
        <PulseBar w="36px" h="16px" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-[10px] flex-1 rounded-sm" style={{ background: "var(--color-ruled)" }} />
        <PulseBar w="32px" h="10px" />
      </div>
      <PulseBar w="60%" h="14px" />
      <PulseBar w="40%" h="10px" />
      <PulseBar w="100%" h="12px" />
      <PulseBar w="92%" h="12px" />
      <div className="flex items-center justify-between gap-2 pt-3 flex-wrap" style={{ borderTop: "1px solid var(--color-ruled)" }}>
        <PulseBar w="110px" h="11px" />
        <div className="flex gap-2">
          <PulseBar w="28px" h="22px" />
          <PulseBar w="52px" h="22px" />
        </div>
      </div>
    </div>
  );
}
function SkeletonArchiveRow() {
  return (
    <div className="glass flex items-center gap-3 px-4 min-h-[44px]">
      <PulseBar w="14px" h="10px" />
      <PulseBar w="96px" h="12px" />
      <PulseBar w="18%" h="6px" />
      <PulseBar w="32px" h="12px" />
    </div>
  );
}
export default function Loading() {
  return (
    <div id="main-content" className="w-full min-h-screen" aria-busy="true" aria-label="Loading catalog">
      <div className="max-w-6xl mx-auto px-4">
        {/* Watchlist zone skeleton */}
        <section className="py-12 animate-pulse motion-reduce:animate-none" aria-hidden="true">
          <PulseBar w="280px" h="36px" />
          <div className="mt-3 space-y-2 max-w-lg">
            <PulseBar w="100%" h="14px" />
            <PulseBar w="80%" h="14px" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <SkeletonWatchCard />
            <SkeletonWatchCard />
            <SkeletonWatchCard />
          </div>
        </section>

        {/* Fresh Finds zone skeleton */}
        <section className="py-12 animate-pulse motion-reduce:animate-none" aria-hidden="true" style={{ animationDelay: "80ms" }}>
          <PulseBar w="320px" h="32px" />
          <div className="mt-3">
            <PulseBar w="100%" h="14px" />
            <PulseBar w="75%" h="14px" />
          </div>
          <div className="flex gap-2 mt-4">
            <PulseBar w="48px" h="20px" />
            <PulseBar w="48px" h="20px" />
            <PulseBar w="48px" h="20px" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <SkeletonFreshCard />
            <SkeletonFreshCard />
            <SkeletonFreshCard />
            <SkeletonFreshCard />
            <SkeletonFreshCard />
            <SkeletonFreshCard />
          </div>
        </section>

        {/* Archive zone skeleton */}
        <section className="py-12 animate-pulse motion-reduce:animate-none" aria-hidden="true" style={{ animationDelay: "160ms" }}>
          <PulseBar w="340px" h="36px" />
          <PulseBar w="60%" h="14px" />
          <div className="mt-6 glass p-5 flex gap-3">
            <PulseBar w="80px" h="20px" />
            <PulseBar w="60px" h="20px" />
            <PulseBar w="80px" h="20px" />
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <SkeletonArchiveRow />
            <SkeletonArchiveRow />
            <SkeletonArchiveRow />
            <SkeletonArchiveRow />
          </div>
        </section>
      </div>
    </div>
  );
}
