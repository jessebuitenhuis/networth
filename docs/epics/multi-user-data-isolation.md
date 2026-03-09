# Multi-User Data Isolation — Detail

Every user's financial data is completely private. Isolation is enforced at the repository layer so application code cannot accidentally query across users. This epic adds the `user_id` column to all tables and scopes every repository query. Auth is handled by a separate epic — this epic uses a hardcoded placeholder user ID.

*Predicts: BO1 (500 paying subscribers) — prerequisite for any multi-user deployment.*

## Dependencies

- None — ships independently of auth and database migration epics.
- **Auth epic** replaces the placeholder `getCurrentUserId()` with real identity resolution.
- **Database epic** (Supabase migration) adds Postgres RLS policies as a second layer of enforcement. — done

## Design Decisions

### Defense in depth

User isolation is enforced at two layers (once both epics land):

1. **Application layer** (this epic) — repositories always filter by `user_id`. It is structurally impossible to run an unscoped query through the repository API.
2. **Database layer** (database epic) — Supabase RLS policies reject any query missing a valid `user_id` claim, even if application code is bypassed.

### Scoping lives at the repository boundary

Repositories are the only code that touches the database. Scoping is enforced here — not in API routes, not in services, not in components. A developer writing a new feature doesn't need to remember to pass `user_id`; the repository handles it.

### Placeholder identity

A single `getCurrentUserId()` function returns a hardcoded user ID. Every repository call resolves the current user through this function. When the auth epic lands, only this function changes.

## Schema Changes

Add `user_id TEXT NOT NULL` to every user-scoped table:

| Table | Status |
| --- | --- |
| accounts | done |
| transactions | done |
| recurring_transactions | done |
| categories | done |
| scenarios | done |
| goals | done |
| settings | done |

## Repository Changes

Every repository is scoped to the current user. No repository function can return or modify another user's data.

| Detail | Status |
| --- | --- |
| `getCurrentUserId()` returns a hardcoded placeholder user ID | done |
| All `SELECT` queries include `WHERE user_id = ?` | done |
| All `INSERT` statements include `user_id` from `getCurrentUserId()` | done |
| All `UPDATE` and `DELETE` statements include `WHERE user_id = ?` | done |
| Raw `db` export cannot be used to bypass user scoping (either removed, wrapped, or linted against) | done |

## Seed Script

| Detail | Status |
| --- | --- |
| Seed data is scoped to the placeholder user ID | done |
| Seed script works correctly with the new schema | done |

## Testing

| Detail | Status |
| --- | --- |
| Repository tests verify that queries only return data for the current user | done |
| Repository tests verify that a user cannot read, update, or delete another user's data | done |
| Existing tests pass with the new user-scoped schema | done |
