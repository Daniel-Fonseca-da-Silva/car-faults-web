import { act, render } from "@testing-library/react";

import { TurnstileWidget } from "./turnstile-widget";

let scriptOnReady: (() => void) | undefined;

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({ onReady }: { onReady?: () => void }) => {
    scriptOnReady = onReady;
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

  function installTurnstileGlobal() {
    window.turnstile = {
      render: renderMock,
      remove: removeMock,
      reset: resetMock,
    };
  }

  beforeEach(() => {
    renderMock = jest.fn().mockReturnValue("widget-1");
    removeMock = jest.fn();
    resetMock = jest.fn();
    delete window.turnstile;
    scriptOnReady = undefined;
  });

  afterEach(() => {
    delete window.turnstile;
  });

  it("does not render the Turnstile widget before the script is ready", () => {
    render(<TurnstileWidget onSuccess={jest.fn()} />);

    expect(renderMock).not.toHaveBeenCalled();
  });

  it("renders the widget with the configured sitekey once next/script reports ready", () => {
    render(<TurnstileWidget onSuccess={jest.fn()} />);
    installTurnstileGlobal();

    act(() => {
      scriptOnReady?.();
    });

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-site-key", retry: "auto" })
    );
  });

  it("renders the widget immediately when the Turnstile script is already loaded on mount", () => {
    // Simulates the script being cached from a previous page, where
    // next/script's onReady never fires for this mount.
    installTurnstileGlobal();

    render(<TurnstileWidget onSuccess={jest.fn()} />);

    expect(renderMock).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-site-key" })
    );
  });

  it("forwards the token to onSuccess when the callback fires", () => {
    installTurnstileGlobal();
    const onSuccess = jest.fn();
    render(<TurnstileWidget onSuccess={onSuccess} />);

    const options = renderMock.mock.calls[0][1];
    options.callback("token-abc");

    expect(onSuccess).toHaveBeenCalledWith("token-abc");
  });

  it("uses the latest callbacks even after the parent re-renders with new function props", () => {
    installTurnstileGlobal();
    const onSuccess1 = jest.fn();
    const onSuccess2 = jest.fn();
    const { rerender } = render(<TurnstileWidget onSuccess={onSuccess1} />);

    rerender(<TurnstileWidget onSuccess={onSuccess2} />);

    const options = renderMock.mock.calls[0][1];
    options.callback("token-abc");

    expect(onSuccess1).not.toHaveBeenCalled();
    expect(onSuccess2).toHaveBeenCalledWith("token-abc");
  });

  it("calls onExpire and onError when those callbacks fire", () => {
    installTurnstileGlobal();
    const onExpire = jest.fn();
    const onError = jest.fn();
    render(
      <TurnstileWidget
        onSuccess={jest.fn()}
        onExpire={onExpire}
        onError={onError}
      />
    );

    const options = renderMock.mock.calls[0][1];
    options["expired-callback"]();
    options["error-callback"]();

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("removes the widget on unmount", () => {
    installTurnstileGlobal();
    const { unmount } = render(<TurnstileWidget onSuccess={jest.fn()} />);

    unmount();

    expect(removeMock).toHaveBeenCalledWith("widget-1");
  });

  it("resets the widget when resetSignal changes", () => {
    installTurnstileGlobal();
    const { rerender } = render(
      <TurnstileWidget onSuccess={jest.fn()} resetSignal={0} />
    );

    rerender(<TurnstileWidget onSuccess={jest.fn()} resetSignal={1} />);

    expect(resetMock).toHaveBeenCalledWith("widget-1");
  });

  it("does not reset when resetSignal is not provided", () => {
    installTurnstileGlobal();
    const { rerender } = render(<TurnstileWidget onSuccess={jest.fn()} />);

    rerender(<TurnstileWidget onSuccess={jest.fn()} />);

    expect(resetMock).not.toHaveBeenCalled();
  });
});
