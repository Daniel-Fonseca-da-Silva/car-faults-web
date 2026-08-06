import type { UserProfile } from "@/types/user";

import { requireAdminUser } from "./require-admin-user";

const getCurrentUserMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

const adminUser: UserProfile = {
  id: "u1",
  email: "admin@example.com",
  name: "Admin Ana",
  role: "admin",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("requireAdminUser", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("returns the user when authenticated as admin", async () => {
    getCurrentUserMock.mockResolvedValue(adminUser);

    await expect(requireAdminUser()).resolves.toEqual(adminUser);
  });

  it("returns null when there is no authenticated user", async () => {
    getCurrentUserMock.mockResolvedValue(null);

    await expect(requireAdminUser()).resolves.toBeNull();
  });

  it("returns null when the authenticated user is not an admin", async () => {
    getCurrentUserMock.mockResolvedValue({ ...adminUser, role: "user" });

    await expect(requireAdminUser()).resolves.toBeNull();
  });
});
