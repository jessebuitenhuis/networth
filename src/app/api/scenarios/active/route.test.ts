import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/scenarios/scenarioRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { setActiveScenarioId } = await import("@/scenarios/scenarioRepository");
const { PUT } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("PUT /api/scenarios/active", () => {
  it("sets the active scenario id", async () => {
    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "s-1" }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(setActiveScenarioId).toHaveBeenCalledWith("test-user", "s-1");
  });

  it("updates existing active scenario id", async () => {
    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "s-2" }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);
    expect(setActiveScenarioId).toHaveBeenCalledWith("test-user", "s-2");
  });

  it("returns 400 when scenarioId is missing", async () => {
    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});
