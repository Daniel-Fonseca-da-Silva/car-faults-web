/**
 * @jest-environment node
 */
import {
  createAdminVehicleModel,
  deleteAdminVehicleModel,
  updateAdminVehicleModel,
} from "./admin-vehicles";
import {
  getAdminVehicleModel,
  getAdminVehicleModels,
} from "./admin-vehicles.server";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("getAdminVehicleModels", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("builds the query string from the given filters", async () => {
    const list = { items: [], total: 0, page: 1, limit: 20 };
    serverApiFetchMock.mockResolvedValue(jsonResponse(list));

    await expect(
      getAdminVehicleModels({ page: 2, limit: 10, brand: "VW", model: "Polo" })
    ).resolves.toEqual(list);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/vehicle-models?page=2&limit=10&brand=VW&model=Polo"
    );
  });

  it("omits query params when no filters are given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ items: [], total: 0, page: 1, limit: 20 })
    );

    await getAdminVehicleModels();

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/vehicle-models");
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 403 }));

    await expect(getAdminVehicleModels()).rejects.toThrow(
      "Failed to load vehicle models: 403"
    );
  });
});

describe("getAdminVehicleModel", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("returns the vehicle model detail", async () => {
    const detail = { vehicle: { id: "vm-1" }, knownIssues: [] };
    serverApiFetchMock.mockResolvedValue(jsonResponse(detail));

    await expect(getAdminVehicleModel("vm-1")).resolves.toEqual(detail);
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/vehicle-models/vm-1"
    );
  });

  it("appends the locale query param when given", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ vehicle: { id: "vm-1" }, knownIssues: [] })
    );

    await getAdminVehicleModel("vm-1", "pt-PT");

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/vehicle-models/vm-1?locale=pt-PT"
    );
  });

  it("returns null on a 404 response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(getAdminVehicleModel("missing")).resolves.toBeNull();
  });

  it("throws on other error responses", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(getAdminVehicleModel("vm-1")).rejects.toThrow(
      "Failed to load vehicle model: 500"
    );
  });
});

describe("createAdminVehicleModel", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("posts the input and returns the created vehicle model", async () => {
    const input = {
      brand: "Volkswagen",
      model: "Polo",
      yearFrom: 2001,
      engine: "1.0",
    };
    const created = { id: "vm-1", ...input };
    serverApiFetchMock.mockResolvedValue(jsonResponse(created));

    await expect(createAdminVehicleModel(input)).resolves.toEqual(created);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/vehicle-models", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(
      createAdminVehicleModel({
        brand: "Volkswagen",
        model: "Polo",
        yearFrom: 2001,
        engine: "1.0",
      })
    ).rejects.toThrow("Failed to create vehicle model: 400");
  });
});

describe("updateAdminVehicleModel", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("patches the vehicle model and returns it", async () => {
    const updated = { id: "vm-1", brand: "Škoda" };
    serverApiFetchMock.mockResolvedValue(jsonResponse(updated));

    await expect(
      updateAdminVehicleModel("vm-1", { brand: "Škoda" })
    ).resolves.toEqual(updated);
    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/vehicle-models/vm-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand: "Škoda" }),
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(
      updateAdminVehicleModel("missing", { brand: "x" })
    ).rejects.toThrow("Failed to update vehicle model: 404");
  });
});

describe("deleteAdminVehicleModel", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("deletes the vehicle model", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteAdminVehicleModel("vm-1");

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/admin/vehicle-models/vm-1", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 404 }));

    await expect(deleteAdminVehicleModel("missing")).rejects.toThrow(
      "Failed to delete vehicle model: 404"
    );
  });
});
