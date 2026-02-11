# App (Pages)

Next.js App Router pages. All pages are client components (`"use client"`).

## Routes

| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Dashboard — net worth summary, chart, create account form, account list |
| `/accounts/[id]` | `accounts/[id]/page.tsx` | Account detail — balance display, create transaction form, transaction list |

## Layout

`layout.tsx` is a **server component** that:
1. Reads the `sidebar_state` cookie to set sidebar default open/closed
2. Wraps the app in providers: `SidebarProvider > AccountProvider > TransactionProvider > AppLayout`
3. Defines the nav structure (currently just "Dashboard" under "Main" group)

The `AppLayout` component dynamically adds an "Accounts" nav group based on existing accounts.
