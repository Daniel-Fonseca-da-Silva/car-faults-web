/**
 * @jest-environment node
 */
import { renderToString } from "react-dom/server";

import { SsrInlineScript } from "./ssr-inline-script";

describe("SsrInlineScript (server)", () => {
  it("renders the inline script in the server HTML", () => {
    const html = renderToString(
      <SsrInlineScript id="consent-default" html="window.foo = 1;" />,
    );

    expect(html).toBe('<script id="consent-default">window.foo = 1;</script>');
  });
});
