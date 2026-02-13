# Components

Follows a **smart/dumb** separation pattern. Each feature subdirectory contains smart (container) components that use React context and dumb (presentational) components that receive all data via props.

## Subdirectories

### `accounts/`

Account management UI for the dashboard page.

| Component | Type | Description |
|---|---|---|
| `CreateAccountDialog` | Smart | Dialog with form to add a new account with optional opening balance. Triggered from sidebar via "+" button. Uses `useAccounts` + `useTransactions` |
| `NetWorthSummary` | Smart | Computes net worth from contexts, passes to `NetWorthCard` |
| `NetWorthCard` | Dumb | Displays formatted net worth number in a card |

### `charts/`

Net worth visualization on the dashboard.

| Component | Type | Description |
|---|---|---|
| `NetWorthChart` | Smart | Main chart component. Uses Recharts `LineChart`. Manages period state and account exclusion toggles. |
| `PeriodPicker` | Dumb | Row of buttons for selecting `ChartPeriod` (Week/Month/Quarter/Year) |
| `ChartLegend` | Dumb | Toggleable account buttons to include/exclude accounts from the chart |

### `transactions/`

Transaction management for the account detail page (`/accounts/[id]`).

| Component | Type | Description |
|---|---|---|
| `TransactionList` | Smart | Reads from `useTransactions`, filters by `accountId`, renders sorted list |
| `TransactionListItem` | Dumb | Displays single transaction (description, date, signed amount, delete button) |
| `CreateTransactionForm` | Smart | Form to add a transaction to a specific account |

### `layout/`

App shell components.

| Component | Type | Description |
|---|---|---|
| `AppLayout` | Smart | Wraps page content with sidebar. Reads accounts to build sidebar nav groups. |
| `AppSidebar` | Dumb | Renders sidebar with nav groups using shadcn `Sidebar*` components. Supports optional `action` per group. |
| `NavGroup` | Type | `{ label, items: NavItem[], action?: ReactNode }` |
| `NavItem` | Type | `{ title, url, isActive? }` |

### `shared/`

Reusable non-shadcn components used across multiple feature directories.

| Component | Type | Description |
|---|---|---|
| `MultiSelectPicker` | Dumb | Generic popover + checkbox list. Used by `AccountPicker` and `ScenarioPicker`. Props: `label`, `items`, `selectedIds`, `onToggle`, optional `onClearAll`, `renderActions`, `popoverWidth` |

### `ui/`

Auto-generated shadcn/ui primitives. **Do not edit directly** — these are managed by `npx shadcn add`.

Available: button, card, dialog, input, label, select, separator, sheet, sidebar, skeleton, tooltip.
