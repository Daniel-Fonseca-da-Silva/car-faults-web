/**
 * @jest-environment node
 */
import { deleteCurrentUserAccount } from "./account";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

describe("deleteCurrentUserAccount", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("deletes the current user account", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await deleteCurrentUserAccount();

    expect(serverApiFetchMock).toHaveBeenCalledWith("/v1/users/me", {
      method: "DELETE",
    });
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(deleteCurrentUserAccount()).rejects.toThrow(
      "Failed to delete current user account: 500"
    );
  });
});
