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

  it("redirects to the session route handler with the token and locale", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({ token: "jwt-token" }),
      })
    ).rejects.toThrow(
      "REDIRECT:/api/auth/session?token=jwt-token&locale=pt-PT"
    );
  });

  it("url-encodes the token", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "en-GB" }),
        searchParams: Promise.resolve({ token: "a.b c" }),
      })
    ).rejects.toThrow(
      "REDIRECT:/api/auth/session?token=a.b%20c&locale=en-GB"
    );
  });

  it("redirects to login when there is no token", async () => {
    await expect(
      AuthCallbackPage({
        params: Promise.resolve({ locale: "pt-PT" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });
});
