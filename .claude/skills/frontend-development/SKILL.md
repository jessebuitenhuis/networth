---
name: frontend-development
description: Best practices for frontend code. Use this when writing, analyszing or reviewing frontend code
---

- Use constructor shorthand for parameter declaration when possible (`constructor(private _someVar: string) {}`)
- Initialize class fields inline when possible (`private _map = new Map()` instead of in constructor)
- Import sorting enforced via `eslint-plugin-simple-import-sort`; run `npm run format` to auto-fix
