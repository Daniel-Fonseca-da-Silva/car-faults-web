import { render, screen } from "@testing-library/react";

import { InfiniteScrollSentinel } from "./infinite-scroll-sentinel";

const observe = jest.fn();
const disconnect = jest.fn();
let observerCallback: IntersectionObserverCallback | null = null;

beforeEach(() => {
  observe.mockReset();
  disconnect.mockReset();
  observerCallback = null;
  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }
    observe = observe;
    disconnect = disconnect;
    unobserve = jest.fn();
    takeRecords = () => [];
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
});

describe("InfiniteScrollSentinel", () => {
  it("does not render when there is no next page", () => {
    const { container } = render(
      <InfiniteScrollSentinel
        hasMore={false}
        isLoading={false}
        onIntersect={jest.fn()}
        loadingLabel="A carregar mais…"
      />
    );

    expect(container).toBeEmptyDOMElement();
    expect(observe).not.toHaveBeenCalled();
  });

  it("calls onIntersect when the sentinel enters the viewport", () => {
    const onIntersect = jest.fn();
    render(
      <InfiniteScrollSentinel
        hasMore
        isLoading={false}
        onIntersect={onIntersect}
        loadingLabel="A carregar mais…"
      />
    );

    expect(observe).toHaveBeenCalled();
    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it("shows the loading label while a page is being fetched", () => {
    render(
      <InfiniteScrollSentinel
        hasMore
        isLoading
        onIntersect={jest.fn()}
        loadingLabel="A carregar mais…"
      />
    );

    expect(screen.getByText("A carregar mais…")).toBeInTheDocument();
  });
});
