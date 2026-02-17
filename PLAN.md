# Plan: Unit Test Repositories + Decouple Route Tests

## Context

The previous commit extracted a repository layer from API route handlers, but:
1. The repositories have no unit tests
2. The route tests still mock `@/db/connection` (an implementation detail of the repositories) and use `createTestDb()` to set up/verify DB state directly

This creates tight coupling — route tests break if the repository changes its storage mechanism. The fix: add repository unit tests (with real DB via `createTestDb`), then refactor route tests to mock the repository module instead.

## Part 1: Add Repository Unit Tests (5 new files)

Each repository gets a co-located test file using the existing `createTestDb()` pattern. These are the only tests that should know about the database.

### Files to create

| File | Functions to test |
|---|---|
| `src/accounts/accountRepository.test.ts` | `getAllAccounts`, `getAccountById`, `createAccount`, `updateAccount`, `deleteAccount` |
| `src/transactions/transactionRepository.test.ts` | `getAllTransactions`, `getTransactionById`, `createTransaction`, `createTransactions`, `updateTransaction`, `deleteTransaction`, `deleteTransactionsByAccountId`, `deleteTransactionsByScenarioId` |
| `src/recurring-transactions/recurringTransactionRepository.test.ts` | `getAllRecurringTransactions`, `getRecurringTransactionById`, `createRecurringTransaction`, `updateRecurringTransaction`, `deleteRecurringTransaction`, `deleteRecurringTransactionsByScenarioId` |
| `src/scenarios/scenarioRepository.test.ts` | `getAllScenarios`, `getScenarioById`, `createScenario`, `updateScenario`, `deleteScenario`, `getActiveScenarioId`, `setActiveScenarioId`, `ensureBasePlanExists` |
| `src/goals/goalRepository.test.ts` | `getAllGoals`, `getGoalById`, `createGoal`, `updateGoal`, `deleteGoal` |

### Test structure (same pattern for all)

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

// Dynamic import AFTER mock
const { getAllAccounts, getAccountById, createAccount, ... } =
  await import("./accountRepository");

beforeEach(() => {
  testDb.delete(accounts).run();
});
```

### What each test covers

- **getAll**: returns `[]` when empty, returns all rows when populated
- **getById**: returns the matching row, returns `undefined` for non-existent id
- **create**: inserts and returns the created row with all fields (including optional fields normalized to `null`)
- **update**: modifies and returns the updated row
- **delete**: removes the row (verify via `getAll` returning fewer items)
- **Bulk deletes** (transactions/recurring): only deletes matching rows, leaves others
- **Scenario-specific**: `getActiveScenarioId` returns `null` when unset / returns the value; `setActiveScenarioId` inserts and upserts; `ensureBasePlanExists` creates "Base Plan" when empty, no-ops when scenarios exist (mock `generateId` via `vi.mock("@/lib/generateId")`)

## Part 2: Refactor Route Tests to Mock Repositories (11 files)

### Pattern change

**Before** (mocks DB, tests through entire stack):
```typescript
import { accounts } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

beforeEach(() => {
  testDb.delete(accounts).run();
  testDb.insert(accounts).values({...}).run();
});

// Assertions verify DB state directly:
const rows = testDb.select().from(accounts).all();
```

**After** (mocks repository, tests route logic only):
```typescript
vi.mock("@/accounts/accountRepository");

const { getAllAccounts, createAccount, ... } =
  await import("@/accounts/accountRepository");
const { GET, POST } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
});

// Setup via mock return values:
vi.mocked(getAllAccounts).mockReturnValue([
  { id: "1", name: "Checking", type: "Asset", expectedReturnRate: null },
]);

// Assertions verify repository was called correctly:
expect(createAccount).toHaveBeenCalledWith({ id: "new-1", name: "Savings", type: "Asset" });
```

### Files to refactor

| Route test file | Repository mock |
|---|---|
| `src/app/api/accounts/route.test.ts` | `@/accounts/accountRepository` |
| `src/app/api/accounts/[id]/route.test.ts` | `@/accounts/accountRepository` |
| `src/app/api/transactions/route.test.ts` | `@/transactions/transactionRepository` |
| `src/app/api/transactions/[id]/route.test.ts` | `@/transactions/transactionRepository` |
| `src/app/api/recurring-transactions/route.test.ts` | `@/recurring-transactions/recurringTransactionRepository` |
| `src/app/api/recurring-transactions/[id]/route.test.ts` | `@/recurring-transactions/recurringTransactionRepository` |
| `src/app/api/goals/route.test.ts` | `@/goals/goalRepository` |
| `src/app/api/goals/[id]/route.test.ts` | `@/goals/goalRepository` |
| `src/app/api/scenarios/route.test.ts` | `@/scenarios/scenarioRepository` |
| `src/app/api/scenarios/[id]/route.test.ts` | `@/scenarios/scenarioRepository` |
| `src/app/api/scenarios/active/route.test.ts` | `@/scenarios/scenarioRepository` |

### Key changes per test

- **Remove**: `createTestDb`, `@/db/schema` imports, `testDb` variable, all `testDb.insert/delete/select` calls
- **Add**: `vi.mock("@/{domain}/{repo}")`, import repo functions, `vi.mocked()` for setup
- **beforeEach**: `vi.resetAllMocks()` instead of DB cleanup
- **Setup**: `vi.mocked(fn).mockReturnValue(data)` instead of DB inserts
- **Assertions**: `expect(fn).toHaveBeenCalledWith(args)` instead of DB queries
- **GET tests**: Mock the getAll/getById to return test data, assert response body matches
- **POST tests**: Mock the create function to return the created object, assert it was called with correct args
- **PUT tests**: Mock getById (for existence check) + update function
- **DELETE tests**: Mock getById (for existence check) + delete function
- **404 tests**: Mock getById to return `undefined`

### Scenarios route special cases

- `GET /api/scenarios`: mock `ensureBasePlanExists`, `getAllScenarios`, `getActiveScenarioId`
- `PUT /api/scenarios/active`: mock `setActiveScenarioId`

## Execution order

1. Write all 5 repository test files first (Part 1)
2. Run tests to confirm they pass
3. Refactor all 11 route test files (Part 2)
4. Run full verify

## Verification

```bash
npm run verify
```

This runs lint + build + tests with 95% coverage threshold. All existing test behaviors should be preserved — same test names, same assertions on HTTP status codes and response bodies. The only change is what layer is mocked.
