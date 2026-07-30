import { render, screen } from "@testing-library/react";

import { ProfilePageHeader } from "./profile-page-header";

jest.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict: Record<string, string> = {
      "profile.eyebrow": "Conta",
    };
    return (key: string) => dict[`${namespace}.${key}`] ?? key;
  },
}));

describe("ProfilePageHeader", () => {
  it("renders the account eyebrow", async () => {
    const jsx = await ProfilePageHeader();
    render(jsx);

    expect(screen.getByText("Conta")).toBeInTheDocument();
  });
});
