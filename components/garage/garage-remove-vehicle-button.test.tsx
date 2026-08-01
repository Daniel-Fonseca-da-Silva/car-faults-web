import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GarageRemoveVehicleButton } from "./garage-remove-vehicle-button";

const dict: Record<string, string> = {
  remove: "Remover da garagem",
  removeAriaLabel: "Remover {vehicle} da garagem",
  removeConfirmTitle: "Remover veículo?",
  removeConfirmDescription:
    "Tens a certeza que queres remover {vehicle} da tua garagem?",
  removeCancel: "Cancelar",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    const template = dict[key] ?? key;
    return values
      ? template.replace(/\{(\w+)\}/g, (_, token) => String(values[token]))
      : template;
  },
}));

const removeUserVehicleActionMock = jest.fn();

jest.mock("@/lib/garage/remove-user-vehicle", () => ({
  removeUserVehicleAction: (...args: unknown[]) =>
    removeUserVehicleActionMock(...args),
}));

describe("GarageRemoveVehicleButton", () => {
  beforeEach(() => {
    removeUserVehicleActionMock.mockReset();
    removeUserVehicleActionMock.mockResolvedValue(undefined);
  });

  it("opens a confirmation dialog before removing the vehicle", async () => {
    const user = userEvent.setup();
    render(
      <GarageRemoveVehicleButton
        locale="pt-PT"
        vehicleId="uv-1"
        vehicleLabel="Volkswagen Polo"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Remover Volkswagen Polo da garagem",
      })
    );

    expect(screen.getByText("Remover veículo?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Tens a certeza que queres remover Volkswagen Polo da tua garagem?"
      )
    ).toBeInTheDocument();
  });

  it("closes the dialog when cancelled without calling the server action", async () => {
    const user = userEvent.setup();
    render(
      <GarageRemoveVehicleButton
        locale="pt-PT"
        vehicleId="uv-1"
        vehicleLabel="Volkswagen Polo"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Remover Volkswagen Polo da garagem",
      })
    );
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("Remover veículo?")).not.toBeInTheDocument();
    expect(removeUserVehicleActionMock).not.toHaveBeenCalled();
  });

  it("calls the server action with the locale and vehicle id when confirmed", async () => {
    const user = userEvent.setup();
    render(
      <GarageRemoveVehicleButton
        locale="pt-PT"
        vehicleId="uv-1"
        vehicleLabel="Volkswagen Polo"
      />
    );

    await user.click(
      screen.getByRole("button", {
        name: "Remover Volkswagen Polo da garagem",
      })
    );
    await user.click(
      screen.getByRole("button", { name: "Remover da garagem" })
    );

    expect(removeUserVehicleActionMock).toHaveBeenCalledWith(
      "pt-PT",
      "uv-1"
    );
  });
});
