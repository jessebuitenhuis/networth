# Lib

Pure utility functions. No React, no side effects.

## Files

- **`utils.ts`** — `cn()` helper (shadcn standard) — merges Tailwind classes via `clsx` + `tailwind-merge`
- **`formatCurrency.ts`** — `formatCurrency(amount)` — formats as `$1,234.56` with negative sign prefix (e.g. `-$500.00`)
- **`formatSignedCurrency.ts`** — `formatSignedCurrency(amount)` — always shows sign: `+$1,234.56` or `-$500.00`

Note: `NetWorthChart.tsx` also has a local `formatCurrency` for the chart Y-axis (no decimal places). This is separate from `lib/formatCurrency.ts`.
