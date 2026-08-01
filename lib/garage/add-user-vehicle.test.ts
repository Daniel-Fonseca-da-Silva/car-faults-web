/**
 * @jest-environment node
 */
import { UserVehicleConflictError } from "@/lib/api/users";

import { addUserVehicleAction } from "./add-user-vehicle";

const createCurrentUserVehicleMock = jest.fn();
const revalidatePathMock = jest.fn();

jest.mock("@/lib/api/users", () => ({
  ...jest.requireActual("@/lib/api/users"),
  createCurrentUserVehicle: (input: unknown) =>
    createCurrentUserVehicleMock(input),
}));

jest.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

describe("addUserVehicleAction", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("creates the vehicle and revalidates the garage and current pages", async () => {
    createCurrentUserVehicleMock.mockResolvedValue({ id: "uv-1" });

    const result = await addUserVehicleAction(
      "pt-PT",
      "/pt-PT/defects/vw/polo/1996",
      { vehicleModelId: "vm-1", year: 1996 }
    );

    expect(result).toEqual({ ok: true });
    expect(createCurrentUserVehicleMock).toHaveBeenCalledWith({
      vehicleModelId: "vm-1",
      year: 1996,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/pt-PT/garage");
    expect(revalidatePathMock).toHaveBeenCalledWith(
      "/pt-PT/defects/vw/polo/1996"
    );
  });

  it("returns a conflict error without revalidating when the vehicle is already in the garage", async () => {
    createCurrentUserVehicleMock.mockRejectedValue(
      new UserVehicleConflictError()
    );

    const result = await addUserVehicleAction(
      "pt-PT",
      "/pt-PT/defects/vw/polo/1996",
      { vehicleModelId: "vm-1", year: 1996 }
    );

    expect(result).toEqual({ ok: false, error: "conflict" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns an unknown error without revalidating on unexpected failures", async () => {
    createCurrentUserVehicleMock.mockRejectedValue(new Error("network down"));

    const result = await addUserVehicleAction(
      "pt-PT",
      "/pt-PT/defects/vw/polo/1996",
      { vehicleModelId: "vm-1", year: 1996 }
    );

    expect(result).toEqual({ ok: false, error: "unknown" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
