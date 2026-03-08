import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/accounts/accountRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getAccountById, updateAccount, deleteAccount } = await import("@/accounts/accountRepository");
const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("PUT /api/accounts/[id]", () => {
  it("updates an existing account", async () => {
    vi.mocked(getAccountById).mockReturnValue({
      id: "acc-1",
      name: "Checking",
      type: "Asset",
      expectedReturnRate: null,
    });
    vi.mocked(updateAccount).mockReturnValue({
      id: "acc-1",
      name: "Updated Checking",
      type: "Asset",
      expectedReturnRate: null,
    });

    const request = new Request("http://localhost/api/accounts/acc-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Checking", type: "Asset" }),
    });

    const response = await PUT(request, makeParams("acc-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Checking");
  });

  it("updates expectedReturnRate", async () => {
    vi.mocked(getAccountById).mockReturnValue({
      id: "acc-1",
      name: "Checking",
      type: "Asset",
      expectedReturnRate: null,
    });
    vi.mocked(updateAccount).mockReturnValue({
      id: "acc-1",
      name: "Checking",
      type: "Asset",
      expectedReturnRate: 0.05,
    });

    const request = new Request("http://localhost/api/accounts/acc-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Checking", type: "Asset", expectedReturnRate: 0.05 }),
    });

    const response = await PUT(request, makeParams("acc-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.expectedReturnRate).toBe(0.05);
  });

  it("returns 404 for non-existent account", async () => {
    vi.mocked(getAccountById).mockReturnValue(undefined);

    const request = new Request("http://localhost/api/accounts/non-existent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost", type: "Asset" }),
    });

    const response = await PUT(request, makeParams("non-existent"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/accounts/[id]", () => {
  it("deletes an existing account", async () => {
    vi.mocked(getAccountById).mockReturnValue({
      id: "acc-1",
      name: "Checking",
      type: "Asset",
      expectedReturnRate: null,
    });

    const response = await DELETE(
      new Request("http://localhost/api/accounts/acc-1", { method: "DELETE" }),
      makeParams("acc-1"),
    );

    expect(response.status).toBe(204);
    expect(deleteAccount).toHaveBeenCalledWith("test-user", "acc-1");
  });

  it("returns 404 for non-existent account", async () => {
    vi.mocked(getAccountById).mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/accounts/non-existent", { method: "DELETE" }),
      makeParams("non-existent"),
    );

    expect(response.status).toBe(404);
  });
});
