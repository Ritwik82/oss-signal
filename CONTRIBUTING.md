# Contributing

This is a personal project, but contributions are welcome if it ever gets opened up.

## Development

```bash
npm install
npm run dev
```

## Project structure

- `scripts/refresh-data.mjs` — fetch-and-score pipeline (runs via GitHub Actions)
- `data/projects.json` — committed data file, never edit by hand
- `src/app/page.tsx` — main grid with filters
- `src/app/project/[id]/page.tsx` — detail view with score breakdown
- `src/app/api/score/[owner]/[repo]/route.ts` — cached score API for the userscript
- `src/lib/data.ts` — shared data reader
