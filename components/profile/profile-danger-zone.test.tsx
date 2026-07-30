import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileDangerZone } from "./profile-danger-zone";

const dict: Record<string, string> = {
  title: "Zona de risco",
  deleteAccount: "Excluir conta",
  deleteAccountDescription:
    "Apaga permanentemente todos os seus dados. Esta ação não pode ser desfeita.",
  confirmTitle: "Tem a certeza?",
  confirmDescription:
    "A sua conta e todos os dados associados serão eliminados permanentemente.",
  confirmCancel: "Cancelar",
  confirmDelete: "Sim, excluir conta",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

describe("ProfileDangerZone", () => {
  it("renders the delete account row", () => {
    render(<ProfileDangerZone />);

    expect(screen.getByText("Zona de risco")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Apaga permanentemente todos os seus dados. Esta ação não pode ser desfeita."
      )
    ).toBeInTheDocument();
  });

  it("opens a confirmation dialog before deleting the account", async () => {
    const user = userEvent.setup();
    render(<ProfileDangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Excluir conta" })
    );

    expect(screen.getByText("Tem a certeza?")).toBeInTheDocument();
  });

  it("closes the confirmation dialog when cancelled", async () => {
    const user = userEvent.setup();
    render(<ProfileDangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Excluir conta" })
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Tem a certeza?")).not.toBeInTheDocument();
  });

  it("closes the dialog after confirming the deletion", async () => {
    const user = userEvent.setup();
    render(<ProfileDangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Excluir conta" })
    );
    await user.click(
      screen.getByRole("button", { name: "Sim, excluir conta" })
    );

    expect(screen.queryByText("Tem a certeza?")).not.toBeInTheDocument();
  });
});
