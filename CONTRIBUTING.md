# Contributing

Thanks for helping! The UI is in Portuguese (pt-BR); code and docs are in English.

## Setup

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

Before opening a PR, make sure these pass:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Adding a tool

1. Create `src/features/<tool>/domain.ts` (pure math, no React) and `page.tsx` (wrap it in `ToolLayout`).
2. Add a thin route in `src/routes/<tool>.tsx` using `searchSchema` from `dataset-input/search`.
3. Add it to `TOOLS` in `src/features/dataset-input/tool-layout.tsx` and a card in `src/features/home/page.tsx`.

Keep the URL free of data: it holds only `run` and `sel` (entry ids). Data lives in the entries collection (`dataset-input/runs.ts`).

## Pull requests

- Fork, branch from `main`, keep PRs small and focused.
- For statistical changes, name the formula or reference you used and add a test in `src/shared/stats.test.ts` (or next to the code).
- Describe what changed and how you checked it (screenshots help for UI).

## Issues

Bug reports: include the input numbers, what you expected and what you got. Feature ideas are welcome too.

By contributing you agree your work is released under the [MIT License](LICENSE).
