/**
 * @jest-environment node
 */
import { deleteCurrentUserAccount } from "./account";

const apiFetchMock = jest.fn();

jest.mock("./client", () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe("deleteCurrentUserAccount", () => {
  afterEach(() => {
    apiFetchMock.mockReset();
  });

  it("deletes the current user account", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteCurrentUserAccount();

    expect(apiFetchMock).toHaveBeenCalledWith("/v1/users/me", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    apiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(deleteCurrentUserAccount()).rejects.toThrow(
      "Failed to delete current user account: 500"
    );
  });
});
