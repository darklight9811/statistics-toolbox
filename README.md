# Caixa de ferramentas de estatística

Statistics toolbox (Portuguese UI) built on the TanStack ecosystem. Paste your numbers, get the chart and the stats.

**Live:** https://statistics-yamiassu.vercel.app/

## Tools

- **Histograma** — Sturges bins, normal curve, skewness/kurtosis, PNG/PDF export
- **Gráfico probabilístico normal** — Blom positions, 95% limits, Anderson-Darling A² and p-value
- **Box-plot** — compare several entries side by side
- **Distribuição de probabilidade** — density vs. fitted normal, probability of an interval, 68-95-99.7 coverage

Entries are saved in your browser (localStorage) and shared across tools. The URL only holds entry ids, never the data.

## Stack

TanStack Start, Router, Query, Form, DB, Charts and Redact · Tailwind v4 · zod · Vite · deployed on Vercel.

## Running locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # unit tests for the math
pnpm build
```

## Project layout

Vertical slices under `src/features/*` (one folder per tool, each with `domain.ts` for the math and `page.tsx` for the UI). `src/routes/*` are thin wrappers; `src/shared/` holds shared math. `src/features/dataset-input` is the shared form, entries list and export code.

## Contributing

Issues and pull requests are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md). New tool ideas, statistical corrections and translation fixes are especially useful.

## License

[MIT](LICENSE) © 2026 darklight9811
