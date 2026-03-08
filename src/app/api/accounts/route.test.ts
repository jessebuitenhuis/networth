import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/accounts/accountRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getAllAccounts, createAccount } = await import("@/accounts/accountRepository");
const { GET, POST } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("GET /api/accounts", () => {
  it("returns empty array when no accounts exist", async () => {
    vi.mocked(getAllAccounts).mockReturnValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all accounts", async () => {
    vi.mocked(getAllAccounts).mockReturnValue([
      { id: "1", name: "Checking", type: "Asset", expectedReturnRate: null },
      { id: "2", name: "Mortgage", type: "Liability", expectedReturnRate: null },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1", name: "Checking", type: "Asset" }),
        expect.objectContaining({ id: "2", name: "Mortgage", type: "Liability" }),
      ]),
    );
  });

  it("returns accounts with expectedReturnRate", async () => {
    vi.mocked(getAllAccounts).mockReturnValue([
      { id: "1", name: "Stocks", type: "Asset", expectedReturnRate: 0.07 },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0].expectedReturnRate).toBe(0.07);
  });
});

describe("POST /api/accounts", () => {
  it("creates an account and returns it", async () => {
    vi.mocked(createAccount).mockReturnValue({
      id: "new-1",
      name: "Savings",
      type: "Asset",
      expectedReturnRate: null,
    });

    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "new-1", name: "Savings", type: "Asset" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "new-1", name: "Savings", type: "Asset" }),
    );
    expect(createAccount).toHaveBeenCalledWith("test-user", {
      id: "new-1",
      name: "Savings",
      type: "Asset",
      expectedReturnRate: undefined,
    });
  });

  it("creates an account with expectedReturnRate", async () => {
    vi.mocked(createAccount).mockReturnValue({
      id: "new-2",
      name: "Index Fund",
      type: "Asset",
      expectedReturnRate: 0.1,
    });

    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "new-2", name: "Index Fund", type: "Asset", expectedReturnRate: 0.1 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.expectedReturnRate).toBe(0.1);
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
