import { render, screen } from "@testing-library/react";

import type { UserProfile } from "@/types/user";

import { ProfileIdentityCard } from "./profile-identity-card";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "profile.identity.memberSince": "Membro desde {date}",
      "profile.identity.onlineStatus": "Online",
    };
    return (key: string, values?: Record<string, unknown>) => {
      const template = dict[`${namespace}.${key}`] ?? key;
      return values
        ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
        : template;
    };
  },
}));

const baseUser: UserProfile = {
  id: "b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d",
  email: "ana@example.com",
  name: "Ana Silva",
  avatarUrl: null,
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-07-17T10:00:00.000Z",
};

describe("ProfileIdentityCard", () => {
  it("renders the user's name and email", async () => {
    const jsx = await ProfileIdentityCard({ user: baseUser, locale: "pt-PT" });
    render(jsx);

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("renders the member-since date formatted for the given locale", async () => {
    const jsx = await ProfileIdentityCard({ user: baseUser, locale: "pt-PT" });
    render(jsx);

    expect(
      screen.getByText("Membro desde 17 de julho de 2026")
    ).toBeInTheDocument();
  });

  it("falls back to initials when there is no avatar image", async () => {
    const jsx = await ProfileIdentityCard({ user: baseUser, locale: "pt-PT" });
    render(jsx);

    expect(screen.getByText("AS")).toBeInTheDocument();
  });
});
