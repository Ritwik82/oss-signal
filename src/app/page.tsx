import {
  getProjects,
  getWatchlist,
  getGenres,
  type GenreId,
} from "@/lib/data";
import { ThemeToggle } from "@/components/theme-toggle";
import { RelativeTime } from "@/components/relative-time";
import { NavBar } from "@/components/nav-bar";
import { LeftRail } from "@/components/left-rail";
import { HeroSection } from "@/components/hero-section";
import { ProjectGrid } from "@/components/project-grid";
import { ScoringSection } from "@/components/scoring-section";
import { WatchlistPanel } from "@/components/watchlist-panel";
import { FreshFinds } from "@/components/fresh-finds";

export default function Home() {
  const data = getProjects();
  const watchlistData = getWatchlist();
  const genres = getGenres();

  const topScore = data.projects.reduce(
    (max, p) => (p.score > max ? p.score : max),
    0
  );
  const shizukuCount = data.projects.filter((p) => p.shizuku).length;

  return (
    <div
      id="main-content"
      className="w-full min-h-screen font-sans"
      style={{ background: "var(--color-bg)", color: "var(--color-text)" }}
    >
      <div className="fixed top-3 right-4 z-[60]">
        <ThemeToggle />
      </div>

      <LeftRail />
      <NavBar />

      <HeroSection
        topScore={topScore}
        lastRefresh={data.generated_at}
        projectCount={data.projects.length}
        shizukuCount={shizukuCount}
      />

      <div className="section-divider" />

      {/* Zone 1 — Your Watchlist (most important, top) */}
      <WatchlistPanel apps={watchlistData.apps} genres={genres.genres} />

      <div className="section-divider" />

      {/* Zone 2 — Fresh Finds (recent, high-score fresh apps) */}
      <FreshFinds projects={data.projects} genres={genres.genres} />

      <div className="section-divider" />

      {/* Zone 3 — The rest of the archive with pagination */}
      <ProjectGrid projects={data.projects} genres={genres.genres} />

      <div className="section-divider" />

      {/* Scoring methodology — at the bottom, after the data */}
      <ScoringSection />

      <footer
        className="border-t py-12 px-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="status-dot" />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: "var(--color-accent)" }}
            >
              OSS Signal
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Built by{" "}
            <a
              href="https://github.com/Ritwik82"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:opacity-80"
              style={{ color: "var(--color-accent)" }}
            >
              Ritwik
            </a>
          </p>
          <p className="font-mono text-[10px]" style={{ color: "var(--color-text-dim)" }}>
            Last calibration: <RelativeTime iso={data.generated_at} />
          </p>
          <p
            className="text-[10px] max-w-md leading-relaxed mt-2"
            style={{ color: "var(--color-text-dim)" }}
          >
            Scores are automated health signals, not endorsements or safety
            reviews. Use your own judgment.
          </p>
        </div>
      </footer>
    </div>
  );
}
