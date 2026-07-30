import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LocaleSwitcher } from "./locale-switcher";

const replace = jest.fn();

jest.mock("next-intl", () => ({
  useLocale: () => "pt-PT",
  useTranslations: () => (key: string) => {
    const dict: Record<string, string> = {
      language: "Idioma",
      "locales.pt-PT": "Português (PT)",
      "locales.en-GB": "English (UK)",
      "locales.es-ES": "Español (ES)",
    };
    return dict[key] ?? key;
  },
}));

jest.mock("@/i18n/navigation", () => ({
  usePathname: () => "/defects",
  useRouter: () => ({ replace }),
}));

describe("LocaleSwitcher", () => {
  it("lists every supported locale with the current one selected", () => {
    render(<LocaleSwitcher />);

    const select = screen.getByLabelText("Idioma");
    expect(select).toHaveValue("pt-PT");
    expect(
      screen.getByRole("option", { name: "English (UK)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Español (ES)" })
    ).toBeInTheDocument();
  });

  it("navigates to the same path in the newly selected locale", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher />);

    const select = screen.getByLabelText("Idioma");
    await user.selectOptions(select, "en-GB");

    expect(replace).toHaveBeenCalledWith("/defects", { locale: "en-GB" });
  });
});
