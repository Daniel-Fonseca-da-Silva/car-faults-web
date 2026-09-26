import { render, screen } from "@testing-library/react";

import { requireAdminUser } from "@/lib/admin/require-admin-user";

import AdminLayout, { dynamic } from "./layout";

jest.mock("@/lib/admin/require-admin-user", () => ({
  requireAdminUser: jest.fn(),
}));

const redirect = jest.fn(() => {
  throw new Error("NEXT_REDIRECT");
});
jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirect(url),
}));

const mockRequireAdminUser = requireAdminUser as jest.Mock;
const params = Promise.resolve({ locale: "pt-PT" as const });

describe("AdminLayout", () => {
  beforeEach(() => {
    mockRequireAdminUser.mockReset();
    redirect.mockClear();
  });

  it("forces dynamic rendering to avoid DYNAMIC_SERVER_USAGE on admin routes", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("renders its children for an admin user", async () => {
    mockRequireAdminUser.mockResolvedValue({ id: "1", role: "admin" });

    render(
      <>{await AdminLayout({ children: <p>admin content</p>, params })}</>,
    );

    expect(screen.getByText("admin content")).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects non-admin users to the login page", async () => {
    mockRequireAdminUser.mockResolvedValue(null);

    await expect(
      AdminLayout({ children: <p>admin content</p>, params }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/pt-PT/login");
  });
});
