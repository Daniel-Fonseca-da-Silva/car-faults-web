import { render } from "@testing-library/react";

import { LocaleFlag } from "./locale-flag";

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

describe("LocaleFlag", () => {
  it("renders the Portuguese flag for pt-PT", () => {
    const { getByTestId } = render(<LocaleFlag locale="pt-PT" />);

    expect(getByTestId("flag-PT")).toBeInTheDocument();
  });

  it("renders the British flag for en-GB", () => {
    const { getByTestId } = render(<LocaleFlag locale="en-GB" />);

    expect(getByTestId("flag-GB")).toBeInTheDocument();
  });

  it("renders the Spanish flag for es-ES", () => {
    const { getByTestId } = render(<LocaleFlag locale="es-ES" />);

    expect(getByTestId("flag-ES")).toBeInTheDocument();
  });
});
