# Page Object Pattern

## When to Create a Page Object

Create a page object when:

- Multiple tests repeat the same `screen.getBy*`, `user.click`, `user.type`, or `user.clear` sequences
- A component has a form or dialog with several interactive elements
- You find yourself writing the same query logic in more than one test

A page object encapsulates all DOM interaction for a component so that tests read as intent ("open the dialog, fill the amount, submit") rather than mechanics ("click button by role, clear input by label, type string, click submit button").

## Conventions

### Element Getters

Use `get` accessors that call `screen.getBy*`. These throw if the element is not found, which is the correct behavior when a test asserts the element must be present.

```typescript
get submitButton() {
  return screen.getByRole("button", { name: "Submit" });
}
```

### Query Methods

Use regular methods prefixed with `query` that call `screen.queryBy*`. These return `null` if the element is absent, suitable for asserting an element does not exist.

```typescript
queryHeading() {
  return screen.queryByRole("heading", { name: "Add Transaction" });
}
```

### Action Methods

Action methods are `async`, interact with the DOM via `this._user`, and return `this` to enable chaining.

```typescript
async fillAmount(amount: string) {
  await this.clearAndType(this.amountInput, amount);
  return this;
}
```

Chaining example:

```typescript
await page.open().then((p) => p.fillAmount("500")).then((p) => p.submit());
// or with await at each step:
await page.open();
await page.fillAmount("500");
await page.submit();
```

### Static `render()` Factory

Each page object exposes a static `render()` method that sets up `userEvent`, renders the component (with any required providers), and returns a new instance. Tests call `render()` instead of calling `render` from `@testing-library/react` directly.

```typescript
static render() {
  const user = userEvent.setup();
  render(<MyComponent />);
  return new MyPage(user);
}
```

## Base Class

All page objects extend `BasePageObject` from `src/test/page/BasePageObject.ts`, which provides:

| Helper | Description |
|---|---|
| `clearAndType(element, text)` | Clears then types into an input |
| `selectOption(trigger, optionName)` | Clicks a combobox trigger then selects an option by visible name |
| `_user` | Protected `userEvent` instance |

## Template

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BasePageObject } from "@/test/page/BasePageObject";

import { MyComponent } from "./MyComponent";

export class MyComponentPage extends BasePageObject {
  private constructor(user: ReturnType<typeof userEvent.setup>) {
    super(user);
  }

  static render() {
    const user = userEvent.setup();
    render(<MyComponent />);
    return new MyComponentPage(user);
  }

  // --- Element getters (throw if not found) ---

  get submitButton() {
    return screen.getByRole("button", { name: "Submit" });
  }

  // --- Query methods (return null if not found) ---

  queryErrorMessage() {
    return screen.queryByRole("alert");
  }

  // --- Actions (return this for chaining) ---

  async submit() {
    await this._user.click(this.submitButton);
    return this;
  }
}
```

## File Naming

Page object files are co-located with the component they wrap and use the `.page.tsx` extension:

```
src/transactions/components/CreateTransactionDialog.tsx
src/transactions/components/CreateTransactionDialog.page.tsx  <- page object
src/transactions/components/CreateTransactionDialog.test.tsx  <- tests import the page object
```
