/**
 * @jest-environment node
 */
import {
  removeUserVehicleAction,
  removeUserVehicleFromVehiclePageAction,
} from "./remove-user-vehicle";

const deleteCurrentUserVehicleMock = jest.fn();
const revalidatePathMock = jest.fn();
const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("@/lib/api/users", () => ({
  deleteCurrentUserVehicle: (id: string) => deleteCurrentUserVehicleMock(id),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

describe("removeUserVehicleAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deletes the vehicle, revalidates the garage page and redirects to it", async () => {
    deleteCurrentUserVehicleMock.mockResolvedValue(undefined);

    await expect(
      removeUserVehicleAction("pt-PT", "uv-1")
    ).rejects.toThrow("REDIRECT:/pt-PT/garage");

    expect(deleteCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/garage");
  });

  it("does not revalidate or redirect when the delete call fails", async () => {
    deleteCurrentUserVehicleMock.mockRejectedValue(new Error("delete failed"));

    await expect(
      removeUserVehicleAction("pt-PT", "uv-1")
    ).rejects.toThrow("delete failed");

    expect(revalidatePathMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

describe("removeUserVehicleFromVehiclePageAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deletes the vehicle and revalidates only the garage without redirecting", async () => {
    deleteCurrentUserVehicleMock.mockResolvedValue(undefined);

    await removeUserVehicleFromVehiclePageAction(
      "pt-PT",
      "uv-1"
    );

    expect(deleteCurrentUserVehicleMock).toHaveBeenCalledWith("uv-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/garage");
    expect(revalidatePathMock).not.toHaveBeenCalledWith(
      expect.stringContaining("/defects/")
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the delete call fails", async () => {
    deleteCurrentUserVehicleMock.mockRejectedValue(new Error("delete failed"));

    await expect(
      removeUserVehicleFromVehiclePageAction(
        "pt-PT",
        "uv-1"
      )
    ).rejects.toThrow("delete failed");

    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
