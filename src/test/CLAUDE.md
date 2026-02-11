# Test Setup

## Configuration

- **Runner**: Vitest with jsdom environment
- **Setup file**: `setup.ts` — loaded before every test
- **Coverage**: v8 provider, 95% threshold on lines/functions/branches/statements
- **Coverage excludes**: `src/test/`, test files, `layout.tsx`, `utils.ts`, `components/ui/`

## Global Setup (`setup.ts`)

1. **jest-dom matchers** — `@testing-library/jest-dom/vitest` for `.toBeInTheDocument()`, etc.
2. **Explicit RTL cleanup** — `afterEach(cleanup)` because Radix portal-based components (sidebar, sheet, tooltip) break auto-cleanup
3. **`window.innerWidth = 1024`** — prevents shadcn `useIsMobile` from triggering mobile mode (breakpoint is 768)
4. **`matchMedia` mock** — returns `{ matches: false }` for all queries
5. **Pointer/scroll mocks** — `hasPointerCapture`, `setPointerCapture`, `releasePointerCapture`, `scrollIntoView` on `Element.prototype` (required by Radix Select)

## Testing Patterns

- **Smart components**: test with contexts wrapped around them (or mock the hooks)
- **Dumb components**: test by passing props directly
- **Radix Select**: use `getByRole("combobox", { name })` for trigger, click then `getByRole("option", { name })` for selection
- **Sidebar trigger**: use `data-slot="sidebar-trigger"` selector (not `aria-label` which matches SidebarRail too)
- **localStorage**: jsdom provides a working `localStorage` — no mocking needed for storage tests
