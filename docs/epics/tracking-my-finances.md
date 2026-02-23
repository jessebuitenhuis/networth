# Tracking My Finances — Detail

Design specifics and behavioral details for stories in the "Tracking my finances" epic.

## Story 7: CSV Import

The import flow should feel effortless for common bank exports. Users shouldn't need to understand CSV structure to get their data in.

| Detail | Status |
| --- | --- |
| "Select CSV file" label has proper margin above the file input | Planned |
| File input is clearly styled as a clickable button | Planned |
| Import modal is wide enough for the sample data table to fit without overflowing | Planned |
| Sample data table is constrained to modal width with its own scroll; mapping inputs remain visible above | Planned |
| Preview table in the final import step has the same scroll constraint | Planned |
| Column mappings are auto-detected from common header names across languages (Dutch: Datum, Omschrijving, Bedrag; German: Betrag, Beschreibung; English: Date, Amount, Description; etc.) | Planned |
| Date format is pre-selected based on browser locale, then validated against sample data — if the locale default doesn't parse correctly, the best matching format is selected instead | Planned |
| Each CSV column can only be mapped to one transaction field — duplicate mappings are prevented | Planned |
| A live mapping preview table (Date, Description, Amount) sits below the column selects and updates as mappings change | Planned |

## Story 43: Dashboard Quick-Add Transaction (Done)

Users can record a transaction without leaving the dashboard. Uses the existing transaction dialog with an added account selector.

| Detail | Status |
| --- | --- |
| Dashboard has an "Add Transaction" button | Done |
| Transaction dialog includes an account select field (no account context on dashboard) | Done |
| Account select has no default — user picks the account | Done |

## Story 44: Contextual Transaction Columns

The transaction table adapts to context — the account column is only visible when it adds information.

| Detail | Status |
| --- | --- |
| Account column is hidden when viewing a single account's transactions | Done |
| Account column is visible when transactions span multiple accounts (e.g. planning tab) | Done |

## Story 45: Category Management

Managing the category hierarchy feels direct and fast. Progressive disclosure keeps the UI clean.

| Detail | Status |
| --- | --- |
| Category list has no Card wrapper — the page title is sufficient context | Done |
| No redundant "Categories" heading inside the list | Done |
| Edit and add-subcategory buttons are visible only on hover | Done |
| Each category has a "+" button to create a subcategory inline | Done |
| Categories can be dragged onto another category to reparent — no reordering | Done |
