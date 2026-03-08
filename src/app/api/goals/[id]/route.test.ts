import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/goals/goalRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getGoalById, updateGoal, deleteGoal } = await import("@/goals/goalRepository");
const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("PUT /api/goals/[id]", () => {
  it("updates an existing goal", async () => {
    vi.mocked(getGoalById).mockReturnValue({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 });
    vi.mocked(updateGoal).mockReturnValue({ id: "g-1", name: "Updated Fund", targetAmount: 15000 });

    const request = new Request("http://localhost/api/goals/g-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Fund", targetAmount: 15000 }),
    });

    const response = await PUT(request, makeParams("g-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Fund");
    expect(body.targetAmount).toBe(15000);
  });

  it("returns 404 for non-existent goal", async () => {
    vi.mocked(getGoalById).mockReturnValue(undefined);

    const request = new Request("http://localhost/api/goals/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost", targetAmount: 999 }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/goals/[id]", () => {
  it("deletes an existing goal", async () => {
    vi.mocked(getGoalById).mockReturnValue({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 });

    const response = await DELETE(
      new Request("http://localhost/api/goals/g-1", { method: "DELETE" }),
      makeParams("g-1"),
    );

    expect(response.status).toBe(204);
    expect(deleteGoal).toHaveBeenCalledWith("test-user", "g-1");
  });

  it("returns 404 for non-existent goal", async () => {
    vi.mocked(getGoalById).mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/goals/missing", { method: "DELETE" }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});
