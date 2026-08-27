function Bar({ w, h }: { w: string; h: string }) {
  return <div className="rounded-sm" style={{ width: w, height: h, background: "var(--color-ruled)" }} />;
}
export default function Loading() {
  return (
    <div id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading project">
      <div className="animate-pulse motion-reduce:animate-none space-y-8" aria-hidden="true">
        {/* Breadcrumb */}
        <div className="flex gap-2">
          <Bar w="36px" h="10px" />
          <Bar w="48px" h="10px" />
          <Bar w="72px" h="10px" />
        </div>
        {/* Header */}
        <div className="space-y-3">
          <Bar w="120px" h="10px" />
          <Bar w="55%" h="36px" />
          <Bar w="100%" h="16px" />
          <Bar w="88%" h="16px" />
          <div className="flex gap-3 pt-2">
            <Bar w="52px" h="12px" />
            <Bar w="64px" h="12px" />
            <Bar w="56px" h="20px" />
          </div>
        </div>
        {/* Score panel */}
        <div className="glass p-6" style={{ boxShadow: "var(--card-shadow)" }}>
          <div className="flex justify-between mb-6">
            <div className="space-y-2">
              <Bar w="96px" h="10px" />
              <Bar w="64px" h="36px" />
            </div>
            <Bar w="72px" h="20px" />
          </div>
          <Bar w="120px" h="10px" />
          <div className="space-y-3 mt-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-b py-3 flex items-center justify-between" style={{ borderColor: "var(--color-ruled)" }}>
                <Bar w="28%" h="11px" />
                <Bar w="48px" h="12px" />
              </div>
            ))}
          </div>
        </div>
        {/* Observation */}
        <div className="border-l-2 pl-5 py-2 space-y-2" style={{ borderColor: "var(--color-margin)" }}>
          <Bar w="100%" h="14px" />
          <Bar w="92%" h="14px" />
          <Bar w="70%" h="14px" />
        </div>
      </div>
    </div>
  );
}
