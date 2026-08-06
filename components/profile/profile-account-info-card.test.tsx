import { render, screen } from "@testing-library/react";

import type { UserProfile } from "@/types/user";

import { ProfileAccountInfoCard } from "./profile-account-info-card";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "profile.account.title": "Informações da conta",
      "profile.account.email": "E-mail",
      "profile.account.createdAt": "Criado em",
      "profile.account.updatedAt": "Atualizado em",
      "profile.account.id": "ID da conta",
      "profile.account.copyId": "Copiar ID da conta",
      "profile.account.copied": "ID copiado",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

const user: UserProfile = {
  id: "b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-07-17T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

describe("ProfileAccountInfoCard", () => {
  it("renders the account email and formatted dates", async () => {
    const jsx = await ProfileAccountInfoCard({ user, locale: "pt-PT" });
    render(jsx);

    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
    expect(screen.getByText("17 de julho de 2026")).toBeInTheDocument();
    expect(screen.getByText("1 de agosto de 2026")).toBeInTheDocument();
  });

  it("renders the account id with a copy button", async () => {
    const jsx = await ProfileAccountInfoCard({ user, locale: "pt-PT" });
    render(jsx);

    expect(
      screen.getByText("b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copiar ID da conta" })
    ).toBeInTheDocument();
  });
});
