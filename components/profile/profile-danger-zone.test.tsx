import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileDangerZone } from "./profile-danger-zone";

const dict: Record<string, string> = {
  title: "Zona de risco",
  deleteAccount: "Excluir conta",
  deleteAccountDescription:
    "Desativa a sua conta (eliminação lógica). Voltar a iniciar sessão com a mesma conta Google pode restaurar o acesso.",
  confirmTitle: "Tem a certeza?",
  confirmDescription:
    "A sua conta será desativada de imediato. Voltar a iniciar sessão com a mesma conta Google pode restaurar o acesso.",
  confirmCancel: "Cancelar",
  confirmDelete: "Sim, excluir conta",
  deleteError: "Não foi possível excluir a conta. Tente novamente.",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => dict[key] ?? key,
}));

const pushMock = jest.fn();

jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const deleteCurrentUserAccountMock = jest.fn();

jest.mock("@/lib/api/account", () => ({
  deleteCurrentUserAccount: (...args: unknown[]) =>
    deleteCurrentUserAccountMock(...args),
}));

const logoutMock = jest.fn();

jest.mock("@/lib/auth/logout", () => ({
  logout: (...args: unknown[]) => logoutMock(...args),
}));

describe("ProfileDangerZone", () => {
  beforeEach(() => {
    pushMock.mockClear();
    deleteCurrentUserAccountMock.mockReset();
    logoutMock.mockReset();
    logoutMock.mockResolvedValue(undefined);
  });

  it("renders the delete account row", () => {
    render(<ProfileDangerZone />);

    expect(screen.getByText("Zona de risco")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Desativa a sua conta (eliminação lógica). Voltar a iniciar sessão com a mesma conta Google pode restaurar o acesso."
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

  it("deletes the account, logs out and redirects to login when confirmed", async () => {
    deleteCurrentUserAccountMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ProfileDangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Excluir conta" })
    );
    await user.click(
      screen.getByRole("button", { name: "Sim, excluir conta" })
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });

    expect(deleteCurrentUserAccountMock).toHaveBeenCalled();
    expect(logoutMock).toHaveBeenCalled();
  });

  it("shows an inline error and keeps the dialog usable when deletion fails", async () => {
    deleteCurrentUserAccountMock.mockRejectedValue(new Error("boom"));
    const user = userEvent.setup();
    render(<ProfileDangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Excluir conta" })
    );
    await user.click(
      screen.getByRole("button", { name: "Sim, excluir conta" })
    );

    expect(
      await screen.findByText("Não foi possível excluir a conta. Tente novamente.")
    ).toBeInTheDocument();
    expect(logoutMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Sim, excluir conta" })
    ).not.toBeDisabled();
  });
});
