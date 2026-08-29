import { act, renderHook } from "@testing-library/react";

import { useCursorList } from "./use-cursor-list";

describe("useCursorList", () => {
  it("appends the next page and clears the cursor when the second fetch returns null", async () => {
    const fetchMore = jest
      .fn()
      .mockResolvedValueOnce({ items: ["b"], nextCursor: null });

    const { result } = renderHook(() =>
      useCursorList({
        initialItems: ["a"],
        initialCursor: "c2",
        fetchMore,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchMore).toHaveBeenCalledWith("c2");
    expect(result.current.items).toEqual(["a", "b"]);
    expect(result.current.nextCursor).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("ignores a second loadMore while the first page is still in flight", async () => {
    let resolvePage: (value: { items: string[]; nextCursor: string | null }) => void =
      () => {};
    const fetchMore = jest.fn().mockReturnValue(
      new Promise<{ items: string[]; nextCursor: string | null }>((resolve) => {
        resolvePage = resolve;
      })
    );

    const { result } = renderHook(() =>
      useCursorList({
        initialItems: ["a"],
        initialCursor: "c2",
        fetchMore,
      })
    );

    act(() => {
      void result.current.loadMore();
      void result.current.loadMore();
    });

    expect(fetchMore).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolvePage({ items: ["b"], nextCursor: null });
    });
  });

  it("does not fetch when nextCursor is null", async () => {
    const fetchMore = jest.fn();
    const { result } = renderHook(() =>
      useCursorList({
        initialItems: ["a"],
        initialCursor: null,
        fetchMore,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetchMore).not.toHaveBeenCalled();
  });

  it("sets hasError when the next page fails", async () => {
    const fetchMore = jest.fn().mockRejectedValue(new Error("network"));
    const { result } = renderHook(() =>
      useCursorList({
        initialItems: ["a"],
        initialCursor: "c2",
        fetchMore,
      })
    );

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.items).toEqual(["a"]);
    expect(result.current.nextCursor).toBe("c2");
  });
});
