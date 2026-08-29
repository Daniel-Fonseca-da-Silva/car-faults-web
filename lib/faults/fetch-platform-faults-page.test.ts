/**
 * @jest-environment node
 */
import { fetchPlatformFaultsPage } from "./fetch-platform-faults-page";

const apiFetchMock = jest.fn();

jest.mock("@/lib/api/client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("fetchPlatformFaultsPage", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("maps the cursor page of platform faults", async () => {
    apiFetchMock.mockResolvedValue(
      jsonResponse({
        items: [
          {
            id: "ki-1",
            faultTitle: "Timing chain",
            severity: "high",
            reportCount: 10,
            vehicle: {
              brand: "Volkswagen",
              model: "Golf",
              yearFrom: 2015,
              engine: "1.6 TDI",
              fuelType: "diesel",
            },
          },
        ],
        nextCursor: null,
      })
    );

    await expect(
      fetchPlatformFaultsPage({ locale: "pt-PT", cursor: "c2", limit: 9 })
    ).resolves.toEqual({
      items: [
        {
          id: "ki-1",
          faultTitle: "Timing chain",
          severity: "high",
          reportCount: 10,
          vehicle: {
            make: "Volkswagen",
            model: "Golf",
            year: 2015,
            engine: "1.6 TDI",
            fuelType: "diesel",
            doors: undefined,
          },
        },
      ],
      nextCursor: null,
    });
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/v1/platform/faults?locale=pt-PT&limit=9&cursor=c2"
    );
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(
      fetchPlatformFaultsPage({ locale: "en-GB" })
    ).rejects.toThrow("Failed to load platform faults: 500");
  });
});
