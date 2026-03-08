import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/goals/goalRepository");

const { getAllGoals, createGoal } = await import("@/goals/goalRepository");
const { GET, POST } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/goals", () => {
  it("returns empty array when no goals exist", async () => {
    vi.mocked(getAllGoals).mockReturnValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all goals", async () => {
    vi.mocked(getAllGoals).mockReturnValue([
      { id: "g-1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "g-2", name: "House Down Payment", targetAmount: 50000 },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "g-1", targetAmount: 10000 }),
        expect.objectContaining({ id: "g-2", targetAmount: 50000 }),
      ]),
    );
  });
});

describe("POST /api/goals", () => {
  it("creates a goal", async () => {
    vi.mocked(createGoal).mockReturnValue({
      id: "g-new",
      name: "Retirement",
      targetAmount: 1000000,
    });

    const request = new Request("http://localhost/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "g-new", name: "Retirement", targetAmount: 1000000 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "g-new", name: "Retirement", targetAmount: 1000000 }),
    );
    expect(createGoal).toHaveBeenCalledWith({ id: "g-new", name: "Retirement", targetAmount: 1000000 });
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
