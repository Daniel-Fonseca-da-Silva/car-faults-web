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

  it("redirects to the session route handler with the code and locale", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({ code: "xyz123" }),
      })
    ).rejects.toThrow("REDIRECT:/api/auth/session?code=xyz123&locale=pt-PT");
  });

  it("url-encodes the code", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "en-GB" }),
        searchParams: Promise.resolve({ code: "a.b c" }),
      })
    ).rejects.toThrow("REDIRECT:/api/auth/session?code=a.b%20c&locale=en-GB");
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
