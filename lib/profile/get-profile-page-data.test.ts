import { profileStats, profileUser, profileVehicles } from "@/lib/mocks/profile";

import { getProfilePageData } from "./get-profile-page-data";

describe("getProfilePageData", () => {
  it("returns the user, stats and vehicles mocks unchanged", () => {
    expect(getProfilePageData()).toEqual({
      user: profileUser,
      stats: profileStats,
      vehicles: profileVehicles,
    });
  });
});
