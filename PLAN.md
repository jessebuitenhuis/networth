# Domain-Driven Folder Restructure

## Context

The codebase currently mixes domain-driven folders (`src/accounts/`, `src/transactions/`, etc.) with technical-concern folders (`src/services/`, `src/models/`, `src/components/{domain}/`). This restructure moves all domain-specific code into its domain folder, leaving only truly shared utilities in `src/lib/`, `src/components/shared/`, and `src/components/layout/`.

## Target Structure

```
src/
  accounts/
    Account.type.ts                     # existing
    AccountType.ts                      # existing
    AccountContext.tsx (+test)           # existing
    accountRepository.ts (+test)        # existing
    computeBalance.ts (+test)           # from services/
    components/
      AccountIcon.tsx (+test)           # from components/accounts/
      CreateAccountDialog.tsx (+page,test)
      EditAccountDialog.tsx (+page,test)
      EmptyDashboard.tsx (+test)
      NetWorthCard.tsx (+test)
      NetWorthSummary.tsx (+test)
      UpdateBalanceDialog.tsx (+page,test)

  transactions/
    Transaction.type.ts                 # existing
    TransactionContext.tsx (+test)       # existing
    transactionRepository.ts (+test)    # existing
    DisplayTransaction.type.ts          # from models/
    buildDisplayTransactions.ts (+test) # from services/
    filterTransactionsByScenario.ts (+test)
    isTransactionProjected.ts (+test)
    generateCompoundGrowthTransactions.ts (+test)
    components/
      CreateTransactionDialog.tsx (+test)  # from components/transactions/
      EditTransactionDialog.tsx (+test)
      EditRecurringTransactionDialog.tsx (+test)
      ScenarioSelect.tsx (+test)
      TransactionList.tsx (+test)
      TransactionTable.tsx (+test)
    import/
      CsvColumnMapping.type.ts          # from models/
      CsvImportStep.ts
      CsvParseResult.type.ts
      CsvSkippedRow.type.ts
      DateFormat.ts
      parseCsvText.ts (+test)           # from services/
      buildTransactionsFromCsv.ts (+test)
      ImportCsvDialog.tsx (+page,test)   # from components/transactions/

  recurring-transactions/
    RecurrenceFrequency.ts              # existing
    RecurringTransaction.type.ts        # existing
    RecurringTransactionContext.tsx (+test) # existing
    recurringTransactionRepository.ts (+test) # existing
    createProjectedTransaction.ts (+test)  # from services/
    iterateOccurrenceDates.ts (+test)
    generateOccurrences.ts (+test)
    getNextOccurrence.ts (+test)

  scenarios/
    Scenario.type.ts                    # existing
    ScenarioContext.tsx (+test)          # existing
    scenarioRepository.ts (+test)       # existing
    components/
      CreateScenarioDialog.tsx (+test)  # from components/scenarios/
      DuplicateScenarioDialog.tsx (+test)
      EditScenarioDialog.tsx (+test)
      ScenarioFilterSelect.tsx (+test)
      ScenarioPicker.tsx (+test)
      ScenarioTransactionList.tsx (+test)

  goals/
    Goal.type.ts                        # existing
    GoalContext.tsx (+test)              # existing
    goalRepository.ts (+test)           # existing
    GoalProgress.type.ts                # from models/
    computeGoalProgress.ts (+test)      # from services/
    components/                         # NEW subfolder (moves existing flat components)
      GoalCard.tsx (+test)              # existing, move to subfolder
      GoalList.tsx (+test)              # existing, move to subfolder
      CreateGoalDialog.tsx (+page,test) # existing, move to subfolder
      EditGoalDialog.tsx (+page,test)   # existing, move to subfolder
      GoalProgressCard.tsx (+test)      # from components/goals/
      GoalProgressSection.tsx (+test)   # from components/goals/

  charts/                               # NEW domain folder
    ChartPeriod.ts                      # from models/
    DateRange.type.ts                   # from models/
    NetWorthDataPoint.type.ts           # from models/
    MultiSeriesDataPoint.type.ts        # from models/
    chartColors.ts (+test)              # from lib/
    formatXAxisTick.ts (+test)          # from lib/
    accumulateNetWorth.ts (+test)       # from services/
    computeNetWorthSeries.ts (+test)    # from services/
    computeProjectedSeries.ts (+test)   # from services/
    mergeProjectedSeries.ts (+test)     # from services/
    components/
      AccountPicker.tsx (+test)         # from components/charts/
      ChartLegend.tsx (+test)
      CustomDateRangePicker.tsx (+test)
      NetWorthChart.tsx (+test)
      PeriodPicker.tsx (+test)
      ProjectedNetWorthChart.tsx (+test)
      ScenarioLegend.tsx (+test)

  lib/                                  # only generic utilities remain
    utils.ts
    generateId.ts (+test)
    dateUtils.ts (+test)
    getLocale.ts (+test)
    localeNumber.ts (+test)
    formatCurrency.ts (+test)
    formatSignedCurrency.ts (+test)
    formatCompactCurrency.ts (+test)

  components/
    ui/          # shadcn - UNCHANGED
    layout/      # UNCHANGED
    shared/      # consolidate shared form components here
      MultiSelectPicker.tsx (+test)     # existing
      CurrencyInput.tsx (+test)         # from components/currency-input/
      PercentageInput.tsx               # from components/percentage-input/

  app/           # UNCHANGED (Next.js convention)
  db/            # UNCHANGED
  hooks/         # UNCHANGED (use-mobile.ts)
  test/          # UNCHANGED
```

## Key Design Decisions

1. **`computeBalance` -> accounts/** — conceptually "what is this account's balance?" even though it operates on Transaction[]. TransactionContext importing from accounts is fine (transactions already reference accounts via accountId).

2. **`generateCompoundGrowthTransactions` -> transactions/** — produces Transaction[] objects. Only consumed by `computeProjectedSeries` (charts), which can import cross-domain.

3. **`filterTransactionsByScenario` -> transactions/** — generic filter but operates on transaction-shaped data. Has no domain imports of its own.

4. **`ImportCsvDialog` -> transactions/import/** — co-located with CSV types and services since it's the UI for the CSV import sub-domain.

5. **goals/components/ subfolder** — for consistency with other domains and to keep root under 10 source files. Moves existing flat goal components into subfolder.

6. **Import style** — use `@/` absolute imports everywhere (consistent with existing code). No switch to relative imports.

## Placement Summary

| Source | Destination |
|---|---|
| `src/services/computeBalance` | `src/accounts/computeBalance` |
| `src/components/accounts/*` | `src/accounts/components/*` |
| `src/services/{buildDisplayTransactions,filterTransactionsByScenario,isTransactionProjected,generateCompoundGrowthTransactions}` | `src/transactions/` |
| `src/models/DisplayTransaction.type` | `src/transactions/DisplayTransaction.type` |
| `src/components/transactions/{Create,Edit,ScenarioSelect,TransactionList,TransactionTable}*` | `src/transactions/components/` |
| `src/components/transactions/ImportCsvDialog*` | `src/transactions/import/` |
| `src/services/{parseCsvText,buildTransactionsFromCsv}` | `src/transactions/import/` |
| `src/models/{CsvColumnMapping,CsvImportStep,CsvParseResult,CsvSkippedRow,DateFormat}*` | `src/transactions/import/` |
| `src/services/{createProjectedTransaction,iterateOccurrenceDates,generateOccurrences,getNextOccurrence}` | `src/recurring-transactions/` |
| `src/components/scenarios/*` | `src/scenarios/components/` |
| `src/services/computeGoalProgress` | `src/goals/computeGoalProgress` |
| `src/models/GoalProgress.type` | `src/goals/GoalProgress.type` |
| `src/goals/{GoalCard,GoalList,Create,Edit}*` | `src/goals/components/` |
| `src/components/goals/*` | `src/goals/components/` |
| `src/models/{ChartPeriod,DateRange,NetWorthDataPoint,MultiSeriesDataPoint}*` | `src/charts/` |
| `src/lib/{chartColors,formatXAxisTick}*` | `src/charts/` |
| `src/services/{accumulateNetWorth,computeNetWorthSeries,computeProjectedSeries,mergeProjectedSeries}` | `src/charts/` |
| `src/components/charts/*` | `src/charts/components/` |
| `src/components/currency-input/*` | `src/components/shared/` |
| `src/components/percentage-input/*` | `src/components/shared/` |

## Implementation Steps

### Step 1: Create directory structure
Create all new directories: `src/charts/`, `src/charts/components/`, `src/accounts/components/`, `src/transactions/components/`, `src/transactions/import/`, `src/scenarios/components/`, `src/goals/components/`.

### Step 2: Move files with `git mv`
Move all files at once using `git mv`. This preserves git history and is a pure rename — no content changes yet.

### Step 3: Fix all imports
Global search-and-replace for each import path change. Key rewrites:

| Old import path | New import path |
|---|---|
| `@/services/computeBalance` | `@/accounts/computeBalance` |
| `@/components/accounts/X` | `@/accounts/components/X` |
| `@/services/buildDisplayTransactions` | `@/transactions/buildDisplayTransactions` |
| `@/services/filterTransactionsByScenario` | `@/transactions/filterTransactionsByScenario` |
| `@/services/isTransactionProjected` | `@/transactions/isTransactionProjected` |
| `@/services/generateCompoundGrowthTransactions` | `@/transactions/generateCompoundGrowthTransactions` |
| `@/models/DisplayTransaction.type` | `@/transactions/DisplayTransaction.type` |
| `@/components/transactions/X` | `@/transactions/components/X` |
| `@/services/parseCsvText` | `@/transactions/import/parseCsvText` |
| `@/services/buildTransactionsFromCsv` | `@/transactions/import/buildTransactionsFromCsv` |
| `@/models/CsvColumnMapping.type` | `@/transactions/import/CsvColumnMapping.type` |
| `@/models/CsvImportStep` | `@/transactions/import/CsvImportStep` |
| `@/models/CsvParseResult.type` | `@/transactions/import/CsvParseResult.type` |
| `@/models/CsvSkippedRow.type` | `@/transactions/import/CsvSkippedRow.type` |
| `@/models/DateFormat` | `@/transactions/import/DateFormat` |
| `@/services/createProjectedTransaction` | `@/recurring-transactions/createProjectedTransaction` |
| `@/services/iterateOccurrenceDates` | `@/recurring-transactions/iterateOccurrenceDates` |
| `@/services/generateOccurrences` | `@/recurring-transactions/generateOccurrences` |
| `@/services/getNextOccurrence` | `@/recurring-transactions/getNextOccurrence` |
| `@/components/scenarios/X` | `@/scenarios/components/X` |
| `@/services/computeGoalProgress` | `@/goals/computeGoalProgress` |
| `@/models/GoalProgress.type` | `@/goals/GoalProgress.type` |
| `@/components/goals/X` | `@/goals/components/X` |
| `@/goals/GoalCard` | `@/goals/components/GoalCard` |
| `@/goals/GoalList` | `@/goals/components/GoalList` |
| `@/goals/CreateGoalDialog` | `@/goals/components/CreateGoalDialog` |
| `@/goals/EditGoalDialog` | `@/goals/components/EditGoalDialog` |
| `@/models/ChartPeriod` | `@/charts/ChartPeriod` |
| `@/models/DateRange.type` | `@/charts/DateRange.type` |
| `@/models/NetWorthDataPoint.type` | `@/charts/NetWorthDataPoint.type` |
| `@/models/MultiSeriesDataPoint.type` | `@/charts/MultiSeriesDataPoint.type` |
| `@/lib/chartColors` | `@/charts/chartColors` |
| `@/lib/formatXAxisTick` | `@/charts/formatXAxisTick` |
| `@/services/accumulateNetWorth` | `@/charts/accumulateNetWorth` |
| `@/services/computeNetWorthSeries` | `@/charts/computeNetWorthSeries` |
| `@/services/computeProjectedSeries` | `@/charts/computeProjectedSeries` |
| `@/services/mergeProjectedSeries` | `@/charts/mergeProjectedSeries` |
| `@/components/charts/X` | `@/charts/components/X` |
| `@/components/currency-input/CurrencyInput` | `@/components/shared/CurrencyInput` |
| `@/components/percentage-input/PercentageInput` | `@/components/shared/PercentageInput` |

Also fix relative imports within moved files (e.g. `./generateCompoundGrowthTransactions` in `computeProjectedSeries.ts` becomes `@/transactions/generateCompoundGrowthTransactions` since they're now in different domains).

### Step 4: Delete empty directories
Remove: `src/services/`, `src/models/`, `src/components/accounts/`, `src/components/transactions/`, `src/components/scenarios/`, `src/components/charts/`, `src/components/goals/`, `src/components/currency-input/`, `src/components/percentage-input/`.

### Step 5: Update documentation
- Update `CLAUDE.md` directory structure section
- Delete stale CLAUDE.md files in removed directories (`src/services/CLAUDE.md`, `src/models/CLAUDE.md`, `src/components/CLAUDE.md`)
- Update `MEMORY.md` references

### Step 6: Run `npm run format` to fix import sorting

### Step 7: Run `npm run verify:quiet` to confirm everything passes

### Step 8: Verify dev server with `npm run dev:check`

## Subagent Strategy

Spawn one `general-purpose` subagent per domain to execute steps 2-3 in sequence:
1. **accounts** subagent
2. **transactions** subagent (includes import/ sub-domain)
3. **recurring-transactions** subagent
4. **scenarios** subagent
5. **goals** subagent
6. **charts** subagent
7. **shared-components** subagent
8. **cleanup** subagent (delete dirs, update docs, format, verify)

Domains can run in parallel since each subagent handles its own git mv + import rewrites. The cleanup subagent runs last after all domains are done.
