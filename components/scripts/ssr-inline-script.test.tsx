import { render } from "@testing-library/react";

import { SsrInlineScript } from "./ssr-inline-script";

declare global {
  interface Window {
    __ssrInlineScriptRuns?: number;
  }
}

const HTML = "window.__ssrInlineScriptRuns = (window.__ssrInlineScriptRuns || 0) + 1;";

describe("SsrInlineScript", () => {
  beforeEach(() => {
    delete window.__ssrInlineScriptRuns;
    document.head.innerHTML = "";
  });

  it("injects and runs the code itself when the tree is client-rendered", () => {
    const { container, rerender } = render(
      <SsrInlineScript id="consent-default" html={HTML} />,
    );
    rerender(<SsrInlineScript id="consent-default" html={HTML} />);

    expect(container).toBeEmptyDOMElement();
    expect(window.__ssrInlineScriptRuns).toBe(1);
    expect(document.getElementById("consent-default")).toBeNull();
  });

  it("keeps the server-rendered tag and does not run the code again", () => {
    const serverScript = document.createElement("script");
    serverScript.id = "consent-default";
    document.head.appendChild(serverScript);

    const { container } = render(
      <SsrInlineScript id="consent-default" html={HTML} />,
    );

    expect(container.querySelector("script#consent-default")).not.toBeNull();
    expect(window.__ssrInlineScriptRuns).toBeUndefined();
  });
});
