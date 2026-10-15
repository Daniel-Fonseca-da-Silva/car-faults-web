const buildVehiclePageMetadataMock = jest.fn();
const vehiclePageViewMock = jest.fn();

jest.mock("../../vehicle-page", () => ({
  buildVehiclePageMetadata: (...args: unknown[]) =>
    buildVehiclePageMetadataMock(...args),
  VehiclePageView: (props: unknown) => {
    vehiclePageViewMock(props);
    return null;
  },
}));

import VehicleDoorsPage, {
  generateMetadata,
  generateStaticParams,
  revalidate,
} from "./page";

const vehicleParams = {
  locale: "pt-PT" as const,
  make: "volkswagen",
  model: "polo",
  year: "1996",
  fuelType: "gasoline",
  engine: "1-0",
};

describe("VehicleDoorsPage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("is cached like the vehicle page", () => {
    expect(generateStaticParams()).toEqual([]);
    expect(revalidate).toBe(3 * 60 * 60);
  });

  it("renders the vehicle page for the requested doors variant", async () => {
    const jsx = await VehicleDoorsPage({
      params: Promise.resolve({ ...vehicleParams, doors: "3" }),
    });

    expect(jsx.props).toEqual({ params: vehicleParams, doors: 3 });
  });

  it("builds the vehicle page metadata for the doors variant", async () => {
    buildVehiclePageMetadataMock.mockResolvedValue({ title: "Polo" });

    await expect(
      generateMetadata({
        params: Promise.resolve({ ...vehicleParams, doors: "5" }),
      })
    ).resolves.toEqual({ title: "Polo" });
    expect(buildVehiclePageMetadataMock).toHaveBeenCalledWith(vehicleParams, 5);
  });

  it.each(["abc", "3a", "123", ""])(
    "triggers a not-found response for doors=%p",
    async (doors) => {
      await expect(
        VehicleDoorsPage({
          params: Promise.resolve({ ...vehicleParams, doors }),
        })
      ).rejects.toThrow();
      await expect(
        generateMetadata({
          params: Promise.resolve({ ...vehicleParams, doors }),
        })
      ).resolves.toEqual({});
      expect(buildVehiclePageMetadataMock).not.toHaveBeenCalled();
    }
  );
});
