import { profileStats, profileUser, profileVehicles } from "./profile";

describe("profile mock data", () => {
  it("exposes a user profile with a non-empty id, email and name", () => {
    expect(profileUser.id).toBeTruthy();
    expect(profileUser.email).toContain("@");
    expect(profileUser.name).toBeTruthy();
  });

  it("keeps savedVehiclesCount in sync with the saved vehicles mock", () => {
    expect(profileStats.savedVehiclesCount).toBe(profileVehicles.length);
  });

  it("gives every saved vehicle a brand, model and single year", () => {
    for (const vehicle of profileVehicles) {
      expect(vehicle.brand).toBeTruthy();
      expect(vehicle.model).toBeTruthy();
      expect(typeof vehicle.year).toBe("number");
    }
  });

  it("has at least one saved vehicle without a linked vehicle model", () => {
    expect(
      profileVehicles.some((vehicle) => vehicle.vehicleModelId === null)
    ).toBe(true);
  });
});
