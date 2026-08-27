import { NextResponse } from "next/server";
import { getProjects } from "@/lib/data";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reposParam = searchParams.get("repos");
  const data = getProjects();

  let targetProjects = data.projects;

  if (reposParam) {
    const list = reposParam.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
    targetProjects = data.projects.filter(
      (p) => list.includes(p.id.toLowerCase()) || list.includes(`${p.owner}/${p.name}`.toLowerCase())
    );
  }

  // Sort by recent release date or added date
  const items = [...targetProjects]
    .sort((a, b) => new Date(b.last_release_at || b.created_at).getTime() - new Date(a.last_release_at || a.created_at).getTime())
    .slice(0, 30);

  const rssItemsXml = items
    .map((p) => {
      const pubDate = new Date(p.last_release_at || p.created_at).toUTCString();
      return `
    <item>
      <title>${escapeXml(p.name)} (${p.owner}) - Health Score ${(p.score * 10).toFixed(1)}/10</title>
      <link>https://pulsaross.vercel.app/project/${encodeURIComponent(p.id)}</link>
      <guid isPermaLink="true">https://pulsaross.vercel.app/project/${encodeURIComponent(p.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(p.description || "Android open-source project cataloged on Pulsaross.")}</description>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pulsaross Watchlist &amp; OSS Signal Feed</title>
    <link>https://pulsaross.vercel.app</link>
    <description>Automated Android FOSS app health and release monitoring feed.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
