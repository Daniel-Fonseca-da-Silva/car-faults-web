/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import proxy from "./proxy";

jest.mock("next-intl/middleware", () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn()),
}));

const intlMiddlewareMock = (
  createMiddleware as unknown as jest.Mock
).mock.results[0].value as jest.Mock;

describe("proxy", () => {
  afterEach(() => {
    intlMiddlewareMock.mockClear();
  });

  it("redirects unauthenticated requests to a protected profile route to login", () => {
    const request = new NextRequest("https://web.example.com/en-GB/profile");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/en-GB/login"
    );
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated requests to nested protected profile routes", () => {
    const request = new NextRequest(
      "https://web.example.com/pt-PT/profile/settings"
    );

    const response = proxy(request);

    expect(response.headers.get("location")).toBe(
      "https://web.example.com/pt-PT/login"
    );
  });

  it("redirects unauthenticated requests to a protected garage route to login", () => {
    const request = new NextRequest("https://web.example.com/en-GB/garage");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/en-GB/login"
    );
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated requests to a protected favorites route to login", () => {
    const request = new NextRequest("https://web.example.com/en-GB/favorites");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/en-GB/login"
    );
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated requests to a protected admin route to login", () => {
    const request = new NextRequest("https://web.example.com/en-GB/admin");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://web.example.com/en-GB/login"
    );
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("delegates to the intl middleware when the session cookie is present", () => {
    const request = new NextRequest("https://web.example.com/en-GB/profile");
    request.cookies.set("access_token", "jwt-token");

    proxy(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
  });

  it("delegates to the intl middleware for non-protected routes", () => {
    const request = new NextRequest("https://web.example.com/en-GB/defects");

    proxy(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
  });

  it("rewrites a vehicle page with ?doors= to its cacheable doors variant", () => {
    const request = new NextRequest(
      "https://web.example.com/pt-PT/defects/volkswagen/golf/2015/diesel/2-0-tdi?doors=3"
    );

    const response = proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://web.example.com/pt-PT/defects/volkswagen/golf/2015/diesel/2-0-tdi/doors/3"
    );
    expect(intlMiddlewareMock).not.toHaveBeenCalled();
  });

  it("keeps other query params when rewriting the doors variant", () => {
    const request = new NextRequest(
      "https://web.example.com/en-GB/defects/fiat/uno/2007/gasoline/1-0/?doors=5&utm_source=x"
    );

    const response = proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://web.example.com/en-GB/defects/fiat/uno/2007/gasoline/1-0/doors/5?utm_source=x"
    );
  });

  it.each([
    "https://web.example.com/pt-PT/defects/volkswagen/golf/2015/diesel/2-0-tdi",
    "https://web.example.com/pt-PT/defects/volkswagen/golf/2015/diesel/2-0-tdi?doors=abc",
    "https://web.example.com/pt-PT/defects/volkswagen/golf/2015?doors=3",
    "https://web.example.com/pt-PT/defects?doors=3",
    "https://web.example.com/xx-XX/defects/volkswagen/golf/2015/diesel/2-0-tdi?doors=3",
  ])("does not rewrite %s", (url) => {
    const request = new NextRequest(url);

    proxy(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
  });
});
