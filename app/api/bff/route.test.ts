/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

const serverApiFetchMock = jest.fn();

jest.mock("@/lib/api/server-client", () => ({
  serverApiFetch: (...args: unknown[]) =>
    (serverApiFetchMock as (...a: unknown[]) => unknown)(...args),
}));

import { GET } from "./route";

function buildRequest(path: string | null): NextRequest {
  const url = new URL("https://web.example.com/api/bff");
  if (path !== null) {
    url.searchParams.set("path", path);
  }
  return new NextRequest(url);
}

describe("GET /api/bff", () => {
  beforeEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("forwards the decoded path to serverApiFetch and relays the response", async () => {
    serverApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ items: [], nextCursor: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const response = await GET(
      buildRequest("/v1/admin/vehicle-models?cursor=abc&limit=20")
    );

    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/admin/vehicle-models?cursor=abc&limit=20"
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ items: [], nextCursor: null });
  });

  it("relays a 401 from the API instead of masking it", async () => {
    serverApiFetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      })
    );

    const response = await GET(buildRequest("/v1/admin/vehicle-models"));

    expect(response.status).toBe(401);
  });

  it("rejects a missing path without calling the API", async () => {
    const response = await GET(buildRequest(null));

    expect(response.status).toBe(400);
    expect(serverApiFetchMock).not.toHaveBeenCalled();
  });

  it("rejects a path outside the /v1 API surface", async () => {
    const response = await GET(buildRequest("/admin/secret"));

    expect(response.status).toBe(400);
    expect(serverApiFetchMock).not.toHaveBeenCalled();
  });
});
