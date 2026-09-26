const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

import AuthCallbackPage from "./page";

describe("AuthCallbackPage", () => {
  afterEach(() => {
    redirectMock.mockClear();
  });

  it("redirects to the session route handler with the code, state and locale", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({ code: "xyz123", state: "pt-PT.nonce" }),
      })
    ).rejects.toThrow(
      "REDIRECT:/api/auth/session?code=xyz123&state=pt-PT.nonce&locale=pt-PT"
    );
  });

  it("url-encodes the code and state", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "en-GB" }),
        searchParams: Promise.resolve({ code: "a.b c", state: "en-GB.n&x" }),
      })
    ).rejects.toThrow(
      "REDIRECT:/api/auth/session?code=a.b%20c&state=en-GB.n%26x&locale=en-GB"
    );
  });

  it("redirects to login when there is no state", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({ code: "xyz123" }),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });

  it("redirects to login when there is no code", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });
});
