import { describe, expect, it } from "vitest";

import { getCurrentUserId } from "./getCurrentUserId";

describe("getCurrentUserId", () => {
  it("returns the hardcoded placeholder user id", () => {
    expect(getCurrentUserId()).toBe("placeholder-user-id");
  });
});
