import { act, render } from "@testing-library/react";

import { TurnstileWidget } from "./turnstile-widget";

let scriptOnLoad: (() => void) | undefined;

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ onLoad }: { onLoad?: () => void }) => {
    scriptOnLoad = onLoad;
    return null;
  },
}));

jest.mock("@/lib/api/config", () => ({
  getTurnstileSiteKey: () => "test-site-key",
}));

describe("TurnstileWidget", () => {
  let renderMock: jest.Mock;
  let removeMock: jest.Mock;
  let resetMock: jest.Mock;

  beforeEach(() => {
    renderMock = jest.fn().mockReturnValue("widget-1");
    removeMock = jest.fn();
    resetMock = jest.fn();
    window.turnstile = {
      render: renderMock,
      remove: removeMock,
      reset: resetMock,
    };
    scriptOnLoad = undefined;
  });

  afterEach(() => {
    delete window.turnstile;
  });

  it("does not render the Turnstile widget before the script has loaded", () => {
    render(<TurnstileWidget onSuccess={jest.fn()} />);

    expect(renderMock).not.toHaveBeenCalled();
  });

  it("renders the widget with the configured sitekey once the script loads", () => {
    render(<TurnstileWidget onSuccess={jest.fn()} />);

    act(() => {
      scriptOnLoad?.();
    });

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-site-key" })
    );
  });

  it("forwards the token to onSuccess when the callback fires", () => {
    const onSuccess = jest.fn();
    render(<TurnstileWidget onSuccess={onSuccess} />);
    act(() => {
      scriptOnLoad?.();
    });

    const options = renderMock.mock.calls[0][1];
    options.callback("token-abc");

    expect(onSuccess).toHaveBeenCalledWith("token-abc");
  });

  it("calls onExpire and onError when those callbacks fire", () => {
    const onExpire = jest.fn();
    const onError = jest.fn();
    render(
      <TurnstileWidget
        onSuccess={jest.fn()}
        onExpire={onExpire}
        onError={onError}
      />
    );
    act(() => {
      scriptOnLoad?.();
    });

    const options = renderMock.mock.calls[0][1];
    options["expired-callback"]();
    options["error-callback"]();

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("removes the widget on unmount", () => {
    const { unmount } = render(<TurnstileWidget onSuccess={jest.fn()} />);
    act(() => {
      scriptOnLoad?.();
    });

    unmount();

    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });

  it("resets the widget when resetSignal changes", () => {
    const { rerender } = render(
      <TurnstileWidget onSuccess={jest.fn()} resetSignal={0} />
    );
    act(() => {
      scriptOnLoad?.();
    });

    rerender(<TurnstileWidget onSuccess={jest.fn()} resetSignal={1} />);

    expect(resetMock).toHaveBeenCalledWith("widget-1");
  });

  it("does not reset when resetSignal is not provided", () => {
    const { rerender } = render(<TurnstileWidget onSuccess={jest.fn()} />);
    act(() => {
      scriptOnLoad?.();
    });

    rerender(<TurnstileWidget onSuccess={jest.fn()} />);

    expect(resetMock).not.toHaveBeenCalled();
  });
});
