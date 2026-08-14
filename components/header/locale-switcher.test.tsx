import { render, screen, within } from "@testing-library/react";
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

jest.mock("country-flag-icons/react/3x2/PT", () => ({
  __esModule: true,
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="flag-PT" {...props} />
  ),
}));

jest.mock("country-flag-icons/react/3x2/GB", () => ({
  __esModule: true,
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="flag-GB" {...props} />
  ),
}));

jest.mock("country-flag-icons/react/3x2/ES", () => ({
  __esModule: true,
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="flag-ES" {...props} />
  ),
}));

const TRIGGER_RECT = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  bottom: 32,
  right: 120,
  width: 120,
  height: 32,
  toJSON() {
    return {};
  },
};

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }

  // jsdom reports 0×0 boxes, so Base UI treats the trigger as hidden and never opens.
  HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return TRIGGER_RECT;
  };
});

function createUser() {
  return userEvent.setup({ pointerEventsCheck: 0 });
}

async function openLocaleMenu() {
  const user = createUser();
  const trigger = screen.getByRole("combobox", { name: "Idioma" });
  await user.click(trigger);
  await user.keyboard("{ArrowDown}");
  await screen.findByRole("option", { name: "Português (PT)" });
  return user;
}

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("shows the current locale with its flag on the trigger", () => {
    render(<LocaleSwitcher />);

    const trigger = screen.getByRole("combobox", { name: "Idioma" });
    expect(within(trigger).getByTestId("flag-PT")).toBeInTheDocument();
    expect(within(trigger).getByText("Português (PT)")).toBeInTheDocument();
  });

  it("lists every supported locale with its flag when opened", async () => {
    render(<LocaleSwitcher />);

    await openLocaleMenu();

    const ptOption = screen.getByRole("option", { name: "Português (PT)" });
    const enOption = screen.getByRole("option", { name: "English (UK)" });
    const esOption = screen.getByRole("option", { name: "Español (ES)" });

    expect(within(ptOption).getByTestId("flag-PT")).toBeInTheDocument();
    expect(within(enOption).getByTestId("flag-GB")).toBeInTheDocument();
    expect(within(esOption).getByTestId("flag-ES")).toBeInTheDocument();
  });

  it("navigates to the same path in the newly selected locale", async () => {
    render(<LocaleSwitcher />);

    const user = await openLocaleMenu();
    await user.click(screen.getByRole("option", { name: "English (UK)" }));

    expect(replace).toHaveBeenCalledWith("/defects", { locale: "en-GB" });
  });
});
