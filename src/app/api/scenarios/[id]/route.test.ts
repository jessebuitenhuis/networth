import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/scenarios/scenarioRepository");

const { scenarioRepo } = await import("@/scenarios/scenarioRepository");
const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("PUT /api/scenarios/[id]", () => {
  it("updates an existing scenario", async () => {
    vi.mocked(scenarioRepo.getById).mockReturnValue({ id: "s-1", name: "Base Plan" });
    vi.mocked(scenarioRepo.updateScenario).mockReturnValue({ id: "s-1", name: "Updated Plan" });

    const request = new Request("http://localhost/api/scenarios/s-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Plan" }),
    });

    const response = await PUT(request, makeParams("s-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Plan");
  });

  it("updates scenario with inflation rate", async () => {
    vi.mocked(scenarioRepo.getById).mockReturnValue({ id: "s-1", name: "Base Plan", inflationRate: null });
    vi.mocked(scenarioRepo.updateScenario).mockReturnValue({ id: "s-1", name: "Base Plan", inflationRate: 3 });

    const request = new Request("http://localhost/api/scenarios/s-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Base Plan", inflationRate: 3 }),
    });

    const response = await PUT(request, makeParams("s-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.inflationRate).toBe(3);
    expect(scenarioRepo.updateScenario).toHaveBeenCalledWith("s-1", { name: "Base Plan", inflationRate: 3 });
  });

  it("returns 404 for non-existent scenario", async () => {
    vi.mocked(scenarioRepo.getById).mockReturnValue(undefined);

    const request = new Request("http://localhost/api/scenarios/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost" }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/scenarios/[id]", () => {
  it("deletes an existing scenario", async () => {
    vi.mocked(scenarioRepo.getById).mockReturnValue({ id: "s-1", name: "Base Plan" });

    const response = await DELETE(
      new Request("http://localhost/api/scenarios/s-1", { method: "DELETE" }),
      makeParams("s-1"),
    );

    expect(response.status).toBe(204);
    expect(scenarioRepo.delete).toHaveBeenCalledWith("s-1");
  });

  it("returns 404 for non-existent scenario", async () => {
    vi.mocked(scenarioRepo.getById).mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/scenarios/missing", { method: "DELETE" }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});
