/**
 * @jest-environment node
 */
import { uploadCommentImage, uploadVehicleImage } from "./storage";

const serverApiFetchMock = jest.fn();

jest.mock("./server-client", () => ({
  serverApiFetch: (...args: unknown[]) => serverApiFetchMock(...args),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("uploadCommentImage", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("uploads the file as multipart form data and returns the url", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ url: "https://cdn.example.com/comments/user-1/uuid.jpg" })
    );
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    const result = await uploadCommentImage(file);

    expect(result).toEqual({
      url: "https://cdn.example.com/comments/user-1/uuid.jpg",
    });
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/storage/comment-images",
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = serverApiFetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBe(file);
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 413 }));
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    await expect(uploadCommentImage(file)).rejects.toThrow(
      "Failed to upload image: 413"
    );
  });
});

describe("uploadVehicleImage", () => {
  afterEach(() => {
    serverApiFetchMock.mockReset();
  });

  it("uploads the file as multipart form data and returns the url", async () => {
    serverApiFetchMock.mockResolvedValue(
      jsonResponse({ url: "https://cdn.example.com/vehicles/uuid.jpg" })
    );
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    const result = await uploadVehicleImage(file);

    expect(result).toEqual({
      url: "https://cdn.example.com/vehicles/uuid.jpg",
    });
    expect(serverApiFetchMock).toHaveBeenCalledWith(
      "/v1/storage/vehicle-images",
      expect.objectContaining({ method: "POST" })
    );
    const [, init] = serverApiFetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("file")).toBe(file);
  });

  it("throws on an error response", async () => {
    serverApiFetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });

    await expect(uploadVehicleImage(file)).rejects.toThrow(
      "Failed to upload vehicle image: 403"
    );
  });
});
