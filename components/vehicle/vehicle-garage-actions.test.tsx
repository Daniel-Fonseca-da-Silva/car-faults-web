import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";

import { CurrentUserContext } from "@/components/auth/current-user-provider";
import type { VehicleUserStatus } from "@/lib/vehicle/fetch-vehicle-user-status";
import type { UserProfile } from "@/types/user";

import { VehicleGarageActions } from "./vehicle-garage-actions";

const fetchVehicleUserStatusMock = jest.fn();

jest.mock("@/lib/vehicle/fetch-vehicle-user-status", () => ({
  fetchVehicleUserStatus: (...args: unknown[]) =>
    fetchVehicleUserStatusMock(...args),
}));

const addUserVehicleActionMock = jest.fn();
const removeUserVehicleFromVehiclePageActionMock = jest.fn();
const favoriteVehicleActionMock = jest.fn();
const unfavoriteVehicleActionMock = jest.fn();

jest.mock("@/lib/garage/add-user-vehicle", () => ({
  addUserVehicleAction: (...args: unknown[]) =>
    addUserVehicleActionMock(...args),
}));

jest.mock("@/lib/garage/remove-user-vehicle", () => ({
  removeUserVehicleFromVehiclePageAction: (...args: unknown[]) =>
    removeUserVehicleFromVehiclePageActionMock(...args),
}));

jest.mock("@/lib/favorites/toggle-vehicle-favorite", () => ({
  favoriteVehicleAction: (...args: unknown[]) =>
    favoriteVehicleActionMock(...args),
  unfavoriteVehicleAction: (...args: unknown[]) =>
    unfavoriteVehicleActionMock(...args),
}));

const dict: Record<string, string> = {
  addToGarage: "Adicionar à garagem",
  removeFromGarage: "Remover da garagem",
  addToGarageAriaLabel: "Adicionar {vehicle} à garagem",
  removeFromGarageAriaLabel: "Remover {vehicle} da garagem",
  favorite: "Favoritar",
  unfavorite: "Remover dos favoritos",
  favoriteAriaLabel: "Favoritar {vehicle}",
  unfavoriteAriaLabel: "Remover {vehicle} dos favoritos",
  guestHint: "Entra para guardar este veículo",
  guestCta: "Entrar",
  garageConflictError: "Este veículo já está na tua garagem",
  garageGenericError: "Não foi possível adicionar à garagem. Tenta novamente.",
  favoriteGenericError:
    "Não foi possível atualizar os favoritos. Tenta novamente.",
};

jest.mock("next-intl", () => ({
  useLocale: () => "pt-PT",
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const template = dict[key] ?? key;
    return values
      ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
      : template;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const currentUser: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const baseProps = {
  vehicleModelId: "vm-1",
  vehicleLabel: "Volkswagen Polo",
  year: 1996,
};

const notSaved: VehicleUserStatus = {
  garageVehicleId: null,
  isFavorited: false,
};

function renderActions(
  user: UserProfile | null,
  { isLoading = false }: { isLoading?: boolean } = {}
) {
  return render(
    <CurrentUserContext value={{ user, isLoading, setUser: jest.fn() }}>
      <VehicleGarageActions {...baseProps} />
    </CurrentUserContext>
  );
}

/** Signed in, with the buttons enabled once the user's status has loaded. */
async function renderSignedIn(status: VehicleUserStatus) {
  fetchVehicleUserStatusMock.mockResolvedValue(status);
  renderActions(currentUser);

  await waitFor(() => {
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeEnabled();
    }
  });
}

describe("VehicleGarageActions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders outline buttons linking to login for guests", () => {
    renderActions(null);

    expect(
      screen.getByRole("button", { name: "Adicionar à garagem" })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByRole("button", { name: "Favoritar" })
    ).toHaveAttribute("href", "/login");
    expect(
      screen.getByText("Entra para guardar este veículo")
    ).toBeInTheDocument();
    expect(fetchVehicleUserStatusMock).not.toHaveBeenCalled();
  });

  it("shows disabled buttons, not the guest links, while the user is loading", () => {
    renderActions(null, { isLoading: true });

    expect(
      screen.queryByText("Entra para guardar este veículo")
    ).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("loads the signed-in user's garage and favorite status for this vehicle", async () => {
    await renderSignedIn({ garageVehicleId: "uv-1", isFavorited: true });

    expect(fetchVehicleUserStatusMock).toHaveBeenCalledWith("vm-1", 1996);
    expect(
      screen.getByRole("button", { name: "Remover Volkswagen Polo da garagem" })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Remover Volkswagen Polo dos favoritos" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("adds the vehicle to the garage and then offers to remove it", async () => {
    const user = userEvent.setup();
    addUserVehicleActionMock.mockResolvedValue({
      ok: true,
      userVehicleId: "uv-9",
    });
    removeUserVehicleFromVehiclePageActionMock.mockResolvedValue(undefined);
    await renderSignedIn(notSaved);

    await user.click(
      screen.getByRole("button", { name: "Adicionar Volkswagen Polo à garagem" })
    );

    expect(addUserVehicleActionMock).toHaveBeenCalledWith("pt-PT", {
      vehicleModelId: "vm-1",
      year: 1996,
    });

    await user.click(
      await screen.findByRole("button", {
        name: "Remover Volkswagen Polo da garagem",
      })
    );

    await waitFor(() => {
      expect(removeUserVehicleFromVehiclePageActionMock).toHaveBeenCalledWith(
        "pt-PT",
        "uv-9"
      );
    });
  });

  it("shows a friendly conflict message when the vehicle is already in the garage", async () => {
    const user = userEvent.setup();
    addUserVehicleActionMock.mockResolvedValue({
      ok: false,
      error: "conflict",
    });
    await renderSignedIn(notSaved);

    await user.click(
      screen.getByRole("button", { name: "Adicionar Volkswagen Polo à garagem" })
    );

    expect(
      await screen.findByText("Este veículo já está na tua garagem")
    ).toBeInTheDocument();
  });

  it("removes the vehicle from the garage when already saved", async () => {
    const user = userEvent.setup();
    removeUserVehicleFromVehiclePageActionMock.mockResolvedValue(undefined);
    await renderSignedIn({ garageVehicleId: "uv-1", isFavorited: false });

    await user.click(
      screen.getByRole("button", { name: "Remover Volkswagen Polo da garagem" })
    );

    await waitFor(() => {
      expect(removeUserVehicleFromVehiclePageActionMock).toHaveBeenCalledWith(
        "pt-PT",
        "uv-1"
      );
    });
    expect(
      await screen.findByRole("button", {
        name: "Adicionar Volkswagen Polo à garagem",
      })
    ).toBeInTheDocument();
  });

  it("favorites the vehicle when not yet favorited", async () => {
    const user = userEvent.setup();
    favoriteVehicleActionMock.mockResolvedValue(undefined);
    await renderSignedIn(notSaved);

    await user.click(
      screen.getByRole("button", { name: "Favoritar Volkswagen Polo" })
    );

    await waitFor(() => {
      expect(favoriteVehicleActionMock).toHaveBeenCalledWith(
        "pt-PT",
        "vm-1",
        1996
      );
    });
    expect(
      await screen.findByRole("button", {
        name: "Remover Volkswagen Polo dos favoritos",
      })
    ).toBeInTheDocument();
  });

  it("unfavorites the vehicle when already favorited", async () => {
    const user = userEvent.setup();
    unfavoriteVehicleActionMock.mockResolvedValue(undefined);
    await renderSignedIn({ garageVehicleId: null, isFavorited: true });

    await user.click(
      screen.getByRole("button", { name: "Remover Volkswagen Polo dos favoritos" })
    );

    await waitFor(() => {
      expect(unfavoriteVehicleActionMock).toHaveBeenCalledWith(
        "pt-PT",
        "vm-1",
        1996
      );
    });
  });

  it("shows an inline error when favoriting fails", async () => {
    const user = userEvent.setup();
    favoriteVehicleActionMock.mockRejectedValue(new Error("network error"));
    await renderSignedIn(notSaved);

    await user.click(
      screen.getByRole("button", { name: "Favoritar Volkswagen Polo" })
    );

    expect(
      await screen.findByText(
        "Não foi possível atualizar os favoritos. Tenta novamente."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Favoritar Volkswagen Polo" })
    ).toHaveAttribute("aria-pressed", "false");
  });
});
