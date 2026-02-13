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

## Mock Utilities (`mocks/`)

Non-universal mocks live in `src/test/mocks/` and are imported explicitly by tests that need them:

| Utility | When to use |
|---|---|
| `mockResizeObserver()` | Tests rendering Recharts charts or Radix Tooltip |
| `suppressRechartsWarnings()` | Tests rendering Recharts components (suppresses jsdom dimension warnings) |
| `suppressActWarnings()` | Tests interacting with Radix Select or other Radix components that trigger act() warnings |

Usage:
```ts
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

mockResizeObserver();
suppressRechartsWarnings();
suppressActWarnings();
```

**Important:** If a component import triggers ResizeObserver usage (e.g., via Radix Tooltip), call `mockResizeObserver()` *before* the component import.

## Page Object Pattern

Use Page Objects for dialog/form component tests to encapsulate rendering, queries, and user interactions.

### Conventions
- **File:** `ComponentName.page.tsx` co-located with the component
- **Class:** `ComponentNamePage` with `private constructor`
- **Factory:** `static render(...)` — creates `userEvent`, renders with providers, returns page instance
- **Queries:** getters for elements (`get nameInput`), `queryX()` methods for nullable elements
- **Actions:** async methods returning `this` (`async fillName(name)`)
- **TestHarness:** lives inside the `.page.tsx` file (implementation detail)
- **Mocks** (`vi.mock`, `vi.stubGlobal`) stay in the test file, not the page object

### Exemplars
- `src/components/accounts/CreateAccountDialog.page.tsx` — simple dialog
- `src/components/accounts/EditAccountDialog.page.tsx` — complex dialog with delete confirmation

## Testing Patterns

- **Smart components**: test with contexts wrapped around them (or mock the hooks)
- **Dumb components**: test by passing props directly
- **Radix Select**: use `getByRole("combobox", { name })` for trigger, click then `getByRole("option", { name })` for selection
- **Sidebar trigger**: use `data-slot="sidebar-trigger"` selector (not `aria-label` which matches SidebarRail too)
- **localStorage**: jsdom provides a working `localStorage` — no mocking needed for storage tests
- **Parameterized tests**: use `it.each()` when 3+ tests share identical structure with only input/output varying
- **Page Objects**: use for dialog/form tests with repetitive setup/interaction patterns (see exemplars above)
