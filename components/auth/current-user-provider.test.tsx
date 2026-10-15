import { act, render, screen } from "@testing-library/react";

import type { UserProfile } from "@/types/user";

import { CurrentUserProvider, useCurrentUser } from "./current-user-provider";

const fetchCurrentUserMock = jest.fn();

jest.mock("@/lib/auth/fetch-current-user", () => ({
  fetchCurrentUser: () => fetchCurrentUserMock(),
}));

const user: UserProfile = {
  id: "u1",
  email: "ana@example.com",
  name: "Ana Silva",
  role: "user",
  avatarUrl: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function Probe() {
  const { user: currentUser, isLoading, setUser } = useCurrentUser();
  return (
    <div>
      <p data-testid="state">
        {isLoading ? "loading" : (currentUser?.name ?? "guest")}
      </p>
      <button type="button" onClick={() => setUser(null)}>
        sign out
      </button>
    </div>
  );
}

describe("CurrentUserProvider", () => {
  afterEach(() => {
    fetchCurrentUserMock.mockReset();
  });

  it("is loading until the signed-in user is fetched", async () => {
    let resolveUser: (value: UserProfile | null) => void = () => {};
    fetchCurrentUserMock.mockReturnValue(
      new Promise((resolve) => {
        resolveUser = resolve;
      })
    );

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    expect(screen.getByTestId("state")).toHaveTextContent("loading");

    await act(async () => resolveUser(user));

    expect(screen.getByTestId("state")).toHaveTextContent("Ana Silva");
    expect(fetchCurrentUserMock).toHaveBeenCalledTimes(1);
  });

  it("exposes a signed-out visitor as null", async () => {
    fetchCurrentUserMock.mockResolvedValue(null);

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );

    expect(await screen.findByText("guest")).toBeInTheDocument();
  });

  it("lets consumers clear the user, e.g. after logout", async () => {
    fetchCurrentUserMock.mockResolvedValue(user);

    render(
      <CurrentUserProvider>
        <Probe />
      </CurrentUserProvider>
    );
    await screen.findByText("Ana Silva");

    await act(async () => screen.getByRole("button").click());

    expect(screen.getByTestId("state")).toHaveTextContent("guest");
  });

  it("treats consumers outside a provider as signed out", () => {
    render(<Probe />);

    expect(screen.getByTestId("state")).toHaveTextContent("guest");
  });
});
