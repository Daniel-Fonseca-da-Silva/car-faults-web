import { render, screen } from "@testing-library/react";

import type { UserProfile } from "@/types/user";

import { ProfileSidebar } from "./profile-sidebar";

jest.mock("@/components/profile/profile-identity-card", () => ({
  ProfileIdentityCard: ({ user }: { user: UserProfile }) => (
    <div data-testid="identity-card">{user.name}</div>
  ),
}));

jest.mock("@/components/profile/profile-account-info-card", () => ({
  ProfileAccountInfoCard: ({ user }: { user: UserProfile }) => (
    <div data-testid="account-info-card">{user.email}</div>
  ),
}));

const user: UserProfile = {
  id: "b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: null,
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-07-17T10:00:00.000Z",
};

describe("ProfileSidebar", () => {
  it("renders the identity card and account info card", () => {
    render(<ProfileSidebar user={user} locale="pt-PT" />);

    expect(screen.getByTestId("identity-card")).toHaveTextContent("Ana Silva");
    expect(screen.getByTestId("account-info-card")).toHaveTextContent(
      "ana@example.com"
    );
  });
});
