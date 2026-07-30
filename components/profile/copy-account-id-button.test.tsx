import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CopyAccountIdButton } from "./copy-account-id-button";

describe("CopyAccountIdButton", () => {
  it("copies the account id to the clipboard and shows the copied state", async () => {
    const user = userEvent.setup();
    render(
      <CopyAccountIdButton
        accountId="b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d"
        label="Copiar ID da conta"
        copiedLabel="ID copiado"
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Copiar ID da conta" })
    );

    expect(await navigator.clipboard.readText()).toBe(
      "b3a5c1d2-4e6f-4a8b-9c0d-1e2f3a4b5c6d"
    );
    expect(screen.getByRole("button", { name: "ID copiado" })).toBeInTheDocument();
  });
});
