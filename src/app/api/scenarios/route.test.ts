import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/scenarios/scenarioRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const {
  ensureBasePlanExists,
  getAllScenarios,
  getActiveScenarioId,
  createScenario,
} = await import("@/scenarios/scenarioRepository");
const { GET, POST } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("GET /api/scenarios", () => {
  it("auto-creates Base Plan when no scenarios exist", async () => {
    vi.mocked(ensureBasePlanExists).mockReturnValue(undefined);
    vi.mocked(getAllScenarios).mockReturnValue([{ id: "auto-1", name: "Base Plan" }]);
    vi.mocked(getActiveScenarioId).mockReturnValue("auto-1");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenarios).toHaveLength(1);
    expect(body.scenarios[0].name).toBe("Base Plan");
    expect(body.activeScenarioId).toBe(body.scenarios[0].id);
    expect(ensureBasePlanExists).toHaveBeenCalled();
  });

  it("returns existing scenarios with active id", async () => {
    vi.mocked(ensureBasePlanExists).mockReturnValue(undefined);
    vi.mocked(getAllScenarios).mockReturnValue([
      { id: "s-1", name: "Base Plan" },
      { id: "s-2", name: "Optimistic" },
    ]);
    vi.mocked(getActiveScenarioId).mockReturnValue("s-1");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenarios).toHaveLength(2);
    expect(body.activeScenarioId).toBe("s-1");
  });
});

describe("POST /api/scenarios", () => {
  it("creates a scenario", async () => {
    vi.mocked(createScenario).mockReturnValue({ id: "s-new", name: "Pessimistic" });

    const request = new Request("http://localhost/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "s-new", name: "Pessimistic" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expect.objectContaining({ id: "s-new", name: "Pessimistic" }));
    expect(createScenario).toHaveBeenCalledWith("test-user", { id: "s-new", name: "Pessimistic", inflationRate: undefined });
  });

  it("creates a scenario with inflation rate", async () => {
    vi.mocked(createScenario).mockReturnValue({ id: "s-new", name: "High Inflation", inflationRate: 5 });

    const request = new Request("http://localhost/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "s-new", name: "High Inflation", inflationRate: 5 }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.inflationRate).toBe(5);
    expect(createScenario).toHaveBeenCalledWith("test-user", { id: "s-new", name: "High Inflation", inflationRate: 5 });
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});
