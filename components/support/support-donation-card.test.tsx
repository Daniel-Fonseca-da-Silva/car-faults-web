import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PIX_KEY, WISE_PAY_LINK } from "@/lib/support-constants";

import { SupportDonationCard } from "./support-donation-card";

jest.mock("next-intl", () => ({
  useLocale: () => "en-GB",
  useTranslations: () => (key: string) => key,
}));

const wiseQrSvg = "<svg data-testid=\"wise-qr\"></svg>";
const pixQrSvg = "<svg data-testid=\"pix-qr\"></svg>";
const pixBrCode = "00020126580014br.gov.bcb.pix...6304ABCD";

function renderCard() {
  return render(
    <SupportDonationCard
      wiseQrSvg={wiseQrSvg}
      pixQrSvg={pixQrSvg}
      pixBrCode={pixBrCode}
    />
  );
}

describe("SupportDonationCard", () => {
  it("shows the MBWay number, the Wise payment link, the Pix key and the suggested amount tiers in euros", () => {
    renderCard();

    expect(screen.getByText("+351 913 619 053")).toBeInTheDocument();
    expect(screen.getByText(WISE_PAY_LINK)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /wiseButtonLabel/ })
    ).toHaveAttribute("href", WISE_PAY_LINK);
    expect(screen.getByText(PIX_KEY)).toBeInTheDocument();
    expect(screen.getByText("€2")).toBeInTheDocument();
    expect(screen.getByText("€5")).toBeInTheDocument();
    expect(screen.getByText("€10")).toBeInTheDocument();
  });

  it("copies the MBWay number to the clipboard and shows the copied state", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "copyNumber" }));

    expect(await navigator.clipboard.readText()).toBe("+351 913 619 053");
    expect(screen.getAllByRole("button", { name: "copied" }).length).toBe(1);
  });

  it("copies the Wise payment link to the clipboard and shows the copied state", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "copyLink" }));

    expect(await navigator.clipboard.readText()).toBe(WISE_PAY_LINK);
  });

  it("copies the Pix BR Code to the clipboard and shows the copied state", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "copyPixCode" }));

    expect(await navigator.clipboard.readText()).toBe(pixBrCode);
  });

  it("copies the Pix key to the clipboard and shows the copied state", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "copyPixKey" }));

    expect(await navigator.clipboard.readText()).toBe(PIX_KEY);
  });
});
