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

  it("delegates to the intl middleware when the session cookie is present", () => {
    const request = new NextRequest("https://web.example.com/en-GB/profile");
    request.cookies.set("access_token", "jwt-token");

    proxy(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
  });

  it("delegates to the intl middleware for non-protected routes", () => {
    const request = new NextRequest("https://web.example.com/en-GB/recalls");

    proxy(request);

    expect(intlMiddlewareMock).toHaveBeenCalledWith(request);
  });
});
