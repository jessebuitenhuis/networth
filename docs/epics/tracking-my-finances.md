# Tracking My Finances — Detail

Design specifics and behavioral details for stories in the "Tracking my finances" epic.

## Story 7: CSV Import

The import flow should feel effortless for common bank exports. Users shouldn't need to understand CSV structure to get their data in.

| Detail |
| --- |
| "Select CSV file" label has proper margin above the file input |
| File input is clearly styled as a clickable button |
| Import modal is wide enough for the sample data table to fit without overflowing |
| Sample data table is constrained to modal width with its own scroll; mapping inputs remain visible above |
| Preview table in the final import step has the same scroll constraint |
| Column mappings are auto-detected from common header names across languages (Dutch: Datum, Omschrijving, Bedrag; German: Betrag, Beschreibung; English: Date, Amount, Description; etc.) |
| Date format is pre-selected based on browser locale, then validated against sample data — if the locale default doesn't parse correctly, the best matching format is selected instead |
| Each CSV column can only be mapped to one transaction field — duplicate mappings are prevented |
| A live mapping preview table (Date, Description, Amount) sits below the column selects and updates as mappings change |

## Story 43: Dashboard Quick-Add Transaction

Users can record a transaction without leaving the dashboard. Uses the existing transaction dialog with an added account selector.

| Detail |
| --- |
| Dashboard has an "Add Transaction" button |
| Transaction dialog includes an account select field (no account context on dashboard) |
| Account select has no default — user picks the account |

## Story 44: Contextual Transaction Columns

The transaction table adapts to context — the account column is only visible when it adds information.

| Detail |
| --- |
| Account column is hidden when viewing a single account's transactions |
| Account column is visible when transactions span multiple accounts (e.g. planning tab) |

## Story 45: Category Management

Managing the category hierarchy feels direct and fast. Progressive disclosure keeps the UI clean.

| Detail |
| --- |
| Category list has no Card wrapper — the page title is sufficient context |
| No redundant "Categories" heading inside the list |
| Edit and add-subcategory buttons are visible only on hover |
| Each category has a "+" button to create a subcategory inline |
| Categories can be dragged onto another category to reparent — no reordering |
