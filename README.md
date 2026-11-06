<div align="center">

<img src="public/favicon.svg" alt="" width="72" height="72" />

# Caixa de ferramentas de estatística

**Paste your numbers, get the chart and the stats.**
A statistics toolbox (Portuguese UI) built on the TanStack ecosystem.

[![CI](https://github.com/darklight9811/statistics-toolbox/actions/workflows/ci.yml/badge.svg)](https://github.com/darklight9811/statistics-toolbox/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-indigo.svg)](LICENSE)
[![Live](https://img.shields.io/badge/live-vercel-black.svg)](https://statistics-yamiassu.vercel.app/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[**Open the app →**](https://statistics-yamiassu.vercel.app/)

</div>

---

## ✨ Tools

| Tool | What you get |
| --- | --- |
| 📊 **Histograma** | Sturges bins, fitted normal curve, skewness and kurtosis, class table |
| 📉 **Gráfico probabilístico normal** | Blom plotting positions, 95% limit lines, Anderson-Darling A² and p-value |
| 📦 **Box-plot** | Compare several entries side by side, quartiles, IQR, outliers |
| 🔔 **Distribuição de probabilidade** | Density vs. fitted normal, P(a < X < b) calculator, 68-95-99.7 coverage |

Every tool can export the chart **with its stats** as PNG or PDF.

Entries are saved in your browser (`localStorage`) and shared across all tools, so you can switch graphs without losing your data.

## 🚀 Running locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck  # tsc --noEmit
pnpm test       # unit tests for the math
pnpm build
```

Every push to `main` runs CI and deploys to Vercel.

## 🧱 Stack

TanStack **Start** · **Router** · **Query** · **Form** · **DB** · **Charts** · **Redact** · Tailwind v4 · zod 4 · Vite · Nitro · Vitest

## 🗺️ Architecture

> This section is written for humans **and AI agents**. Read it before changing code.

### Principles

- **Screaming architecture + vertical slices.** One folder per tool under `src/features/*`. A tool owns its math and its UI.
- **`src/routes/*` is wiring only.** Each route file is a `createFileRoute` that sets `validateSearch` and renders a feature page. No logic.
- **`domain.ts` is pure.** No React, no DOM; takes numbers, returns plain objects, throws `Error` with a Portuguese message on bad input. This is what the tests cover.
- **`page.tsx` is UI.** Calls the domain through `useQuery`, builds a chart with `@tanstack/charts`, and renders inside `ToolLayout`.
- **The URL never holds data.** Datasets can be huge. Search params carry only ids.
- **UI text is Portuguese (pt-BR); code, comments and docs are English.**

### Layout

```text
src/
├── routes/                       thin TanStack Router file routes (+ __root.tsx: <head>, OG tags)
│   ├── index.tsx                 → features/home
│   ├── histogram.tsx             → features/histogram
│   ├── normal-probability.tsx    → features/normal-probability
│   ├── box-plot.tsx              → features/box-plot
│   └── probability-distribution.tsx → features/probability-distribution
│   └── glossary.index.tsx / glossary.$stat.tsx → features/stats-card/stat-page (docs section: index + one page per statistic, search: run)
├── features/
│   ├── dataset-input/            SHARED slice used by every tool
│   │   ├── tool-layout.tsx       ToolLayout: header, ☰ drawer (tool switcher), data form, entries list
│   │   ├── runs.ts               runsCollection (TanStack DB + localStorage) and useEntryValue(run)
│   │   ├── search.ts             zod searchSchema: { run?, sel[] }
│   │   ├── parse.ts              parseNumbers (separators: space, ; newline; comma = decimal)
│   │   └── exportable-chart.tsx  PNG/PDF export (SVG → canvas → PNG; hand-built single-page PDF)
│   ├── stats-card/               SHARED: catalog.ts (label, what, use, how-to for every stat), StatsCard + StatHint (tooltip, links to the stat page), docs-layout.tsx + stat-page.tsx (documentation section) + examples.ts (worked example from the open entry)
│   ├── histogram/                domain.ts + page.tsx
│   ├── normal-probability/       domain.ts + page.tsx
│   ├── box-plot/                 domain.ts + page.tsx
│   ├── probability-distribution/ domain.ts + page.tsx
│   └── home/                     landing page with a card per tool
├── shared/normal.ts              normCdf, reused by several domains
├── integrations/tanstack-query/  QueryClient provider and devtools
└── router.tsx                    router factory
```

### Data flow

```text
 form (TanStack Form) ──Generate──▶ runsCollection (localStorage key "histogram-runs")
                                          │  insert, or update if an entry is open
                                          ▼
                       navigate({ search: { run, sel } })      ← only ids in the URL
                                          │
                  useEntryValue(run) ─────┘  reads { data, bins, name } from the entry
                                          ▼
              useQuery(['tool', data, bins]) ─▶ domain.compute*(parseNumbers(data))
                                          ▼
              defineChart({ marks, scales }) ─▶ <ExportableChart> + stats cards
```

- **Entries** are `{ id: number, name?: string, data: string, bins: number }`, id = `Date.now()`.
- **Search params** (`searchSchema`): `run` = id of the open entry; `sel` = ids ticked for multi-entry tools (box-plot).
- **Generate** updates the open entry (`run`) if there is one, otherwise inserts a new one. Clicking an entry opens it; **Novo** closes it; × removes one; **Limpar** removes all (with a confirm).
- Switching tools through the drawer keeps `run` and `sel`, so the loaded entry follows you.
- Unsaved form text is local to the form and is **not** carried across tools.

### How to add a tool

1. `src/features/<tool>/domain.ts`: pure `compute…(values: number[], …)`, with a test in `src/shared/stats.test.ts`.
2. `src/features/<tool>/page.tsx`: read `run`/`sel` from `getRouteApi('/<tool>').useSearch()`, get data via `useEntryValue(run)`, compute with `useQuery`, wrap in `ToolLayout`, and render `ExportableChart` (pass `stats` so they appear in exports).
3. `src/routes/<tool>.tsx`: `createFileRoute('/<tool>')({ validateSearch: searchSchema, component })`.
4. Register it in `TOOLS` in `tool-layout.tsx` and add a card in `features/home/page.tsx`.
5. `pnpm typecheck && pnpm test && pnpm build`.

### Statistical conventions

| Topic | Choice |
| --- | --- |
| Histogram classes | Sturges: ⌈log₂ n + 1⌉ unless the user sets them |
| Quantiles | Type 7 (linear interpolation) |
| Standard deviation | Sample (n − 1) |
| Skewness / excess kurtosis | Using the sample standard deviation |
| Normal probability plot | Blom positions `(i − 0.375)/(n + 0.25)`, inverse CDF by Acklam |
| 95% limits | `x_p ± 1.96 · sd · √(1 + z²/2) / √n` |
| Normality test | Anderson-Darling A², p-value by D'Agostino & Stephens |
| Normal CDF | Numerical Recipes `erfc` approximation |
| Box-plot whiskers | 1.5 × IQR (Tukey fences) |

### Statistics glossary

Add a statistic once in `stats-card/catalog.ts` (label, `what`, `use`, `help`) and, if it can be exemplified, a `case` in `stats-card/examples.ts`. It then gets a tooltip wherever `StatsCard`/`StatHint` shows it, its group in `GROUPS` (docs sidebar and index), and its own page `/glossary/<key>?run=<entry id>`.

### Gotchas

- `@tanstack/redact/vite` swaps the React runtime, so `vite.config.ts` needs `ssr: { noExternal: true }`. Keep the plugin order.
- `@tanstack/charts` mark channels: `rect` takes `y1`/`y2` from fields (use a `base: 0` field), and `curve` options are objects, not strings.
- `routeTree.gen.ts` is generated by the router plugin. Do not edit it by hand.
- Vitest uses its own `vitest.config.ts` so the Start/Nitro plugins are not loaded in tests; the `#/` alias is declared there too.
- Import alias: `#/*` → `src/*` (`package.json` `imports`, `tsconfig.json`).

## 🤝 Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). New tool ideas, statistical corrections and translation fixes are especially useful. Security reports: see [SECURITY.md](SECURITY.md).

## 📄 License

[MIT](LICENSE) © 2026 darklight9811
