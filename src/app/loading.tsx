export default function Loading() {
  return (
    <div id="main-content" className="max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading catalog">
        <div className="h-8 w-64 rounded" style={{ background: "var(--color-ruled)" }} />
        <div className="h-4 w-96 rounded" style={{ background: "var(--color-ruled)" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass p-5 h-48 rounded" style={{ background: "var(--glass-bg)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
