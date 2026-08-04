import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const genres = JSON.parse(readFileSync(join(process.cwd(), "data", "genres.json"), "utf-8"));

function classifyGenre(desc, name) {
  const text = `${name} ${desc}`.toLowerCase();
  for (const g of genres.genres) {
    if (g.id === "other") continue;
    if (g.keywords?.some((kw) => kw && text.includes(kw.toLowerCase()))) {
      return { id: g.id, label: g.label };
    }
  }
  const other = genres.genres.find((g) => g.id === "other");
  return { id: "other", label: other?.label ?? "Other" };
}

const path = join(process.cwd(), "data", "projects.json");
const data = JSON.parse(readFileSync(path, "utf-8"));

let moved = 0;
for (const p of data.projects) {
  const { id, label } = classifyGenre(p.description ?? "", p.name ?? "");
  if (id !== p.genre) {
    p.genre = id;
    p.genre_label = label;
    moved++;
  }
}

writeFileSync(path, JSON.stringify(data, null, 2) + "\n");

const counts = {};
for (const p of data.projects) counts[p.genre] = (counts[p.genre] || 0) + 1;
console.log("moved:", moved);
console.log(JSON.stringify(counts));
console.log("other%:", ((counts.other / data.projects.length) * 100).toFixed(1));
