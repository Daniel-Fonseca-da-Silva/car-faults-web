import { notFound, permanentRedirect } from "next/navigation";

import VehicleRedirectPage from "./page";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  permanentRedirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

describe("VehicleRedirectPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("301-redirects to the canonical path-based URL when the legacy query carries the full lookup identity", async () => {
    await expect(
      VehicleRedirectPage({
        params: Promise.resolve({ locale: "pt-PT", year: "2018" }),
        searchParams: Promise.resolve({
          brand: "Volkswagen",
          model: "Golf",
          engine: "2.0 TDI",
          fuelType: "diesel",
        }),
      })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(permanentRedirect).toHaveBeenCalledWith(
      "/pt-PT/defects/volkswagen/golf/2018/diesel/2-0-tdi"
    );
    expect(notFound).not.toHaveBeenCalled();
  });

  it("includes doors in the redirect target when present", async () => {
    await expect(
      VehicleRedirectPage({
        params: Promise.resolve({ locale: "pt-PT", year: "2018" }),
        searchParams: Promise.resolve({
          brand: "Volkswagen",
          model: "Golf",
          engine: "2.0 TDI",
          fuelType: "diesel",
          doors: "5",
        }),
      })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(permanentRedirect).toHaveBeenCalledWith(
      "/pt-PT/defects/volkswagen/golf/2018/diesel/2-0-tdi?doors=5"
    );
  });

  it("404s when the legacy query is missing the lookup identity", async () => {
    await expect(
      VehicleRedirectPage({
        params: Promise.resolve({ locale: "pt-PT", year: "2018" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("404s when only some of the identity fields are present", async () => {
    await expect(
      VehicleRedirectPage({
        params: Promise.resolve({ locale: "pt-PT", year: "2018" }),
        searchParams: Promise.resolve({ brand: "Volkswagen", model: "Golf" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});
