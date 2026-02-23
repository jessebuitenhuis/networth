# Tracking My Finances — Detail

Design specifics and behavioral details for stories in the "Tracking my finances" epic.

## Story 7: CSV Import (Partial)

The import flow should feel effortless for common bank exports. Users shouldn't need to understand CSV structure to get their data in.

| Detail | Status |
| --- | --- |
| Fix missing margin between "Select CSV file" label and the file input | Planned |
| Style the file input so it's clearly recognizable as a clickable button | Planned |
| Enlarge the import modal so the sample data table fits without overflowing | Planned |
| Constrain the sample data table to the modal width; only the table scrolls, inputs stay visible | Planned |
| Same constraint applies to the preview table in the final import step | Planned |
| Auto-detect column mappings using an expanded header lookup table (Dutch: Datum, Omschrijving, Bedrag; German: Betrag, Beschreibung; English: Date, Amount, Description; etc.) | Planned |
| Auto-select date format based on browser locale, then validate against sample data — if the locale default doesn't parse correctly, try other formats and pick the best match | Planned |
| Prevent the same CSV column from being mapped to multiple transaction fields | Planned |
| Show a live mapping preview table below the column selects (columns: Date, Description, Amount) that updates as the user changes mappings, so they can verify the result before proceeding | Planned |

## Story 43: Dashboard Quick-Add Transaction (Planned)

Users should be able to record a transaction without leaving the dashboard. Uses the existing transaction dialog with an added account selector.

| Detail | Status |
| --- | --- |
| Add an "Add Transaction" button to the dashboard | Planned |
| Open the existing add transaction dialog, but include an account select field (since there's no account context) | Planned |
| Account select defaults to no selection; user must pick an account | Planned |

## Story 44: Contextual Transaction Columns (Planned)

The transaction table should adapt to its context — showing the account column only when multiple accounts are displayed.

| Detail | Status |
| --- | --- |
| Hide the "Account" column when the transaction list is shown for a single account (account detail page) | Planned |
| Show the "Account" column when transactions from multiple accounts are displayed (e.g. planning tab) | Planned |

## Story 45: Category Management (Planned)

Managing the category hierarchy should feel direct and fast. Progressive disclosure keeps the UI clean.

| Detail | Status |
| --- | --- |
| Remove the Card wrapper around the category list — the page title is sufficient | Planned |
| Remove the redundant "Categories" title inside the card | Planned |
| Show edit and add-subcategory buttons only on hover over each category row | Planned |
| Add a "+" button on each category to create a subcategory inline | Planned |
| Support drag-and-drop to reparent categories (move a category under a different parent) — no reordering | Planned |
