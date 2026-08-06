import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

import ProfilePage, { generateMetadata, generateStaticParams } from "./page";

const getProfilePageDataMock = jest.fn();
const redirectMock = jest.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

jest.mock("@/lib/profile/get-profile-page-data", () => ({
  getProfilePageData: () => getProfilePageDataMock(),
}));

jest.mock("@/components/profile/profile-page-header", () => ({
  ProfilePageHeader: () => <div>ProfilePageHeader</div>,
}));

jest.mock("@/components/profile/profile-sidebar", () => ({
  ProfileSidebar: ({ user }: { user: UserProfile }) => (
    <div>ProfileSidebar:{user.name}</div>
  ),
}));

jest.mock("@/components/profile/profile-dashboard", () => ({
  ProfileDashboard: ({
    stats,
    vehicles,
  }: {
    stats: UserStats;
    vehicles: UserVehicle[];
  }) => (
    <div>
      ProfileDashboard:{stats.searchesCount}:{vehicles.length}
    </div>
  ),
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

const stats: UserStats = {
  searchesCount: 47,
  defectsConsultedCount: 128,
  savedVehiclesCount: 3,
  votesCount: 23,
  dislikesCount: 4,
  favoritedVehiclesCount: 2,
};

describe("ProfilePage", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the header, sidebar and dashboard with the fetched profile data", async () => {
    getProfilePageDataMock.mockResolvedValue({ user, stats, vehicles: [] });

    const jsx = await ProfilePage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByText("ProfilePageHeader")).toBeInTheDocument();
    expect(screen.getByText("ProfileSidebar:Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("ProfileDashboard:47:0")).toBeInTheDocument();
  });

  it("redirects to login when there is no authenticated user", async () => {
    getProfilePageDataMock.mockResolvedValue(null);

    await expect(
      ProfilePage({ params: Promise.resolve({ locale: "pt-PT" }) })
    ).rejects.toThrow("REDIRECT:/pt-PT/login");
  });
});

describe("generateMetadata", () => {
  it("builds a localized title and description, and opts the page out of indexing", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "pt-PT" }),
    });

    expect(metadata.title).toBe("seo.profile.title");
    expect(metadata.description).toBe("seo.profile.description");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

describe("generateStaticParams", () => {
  it("returns a param entry for every supported locale", () => {
    expect(generateStaticParams()).toEqual(
      locales.map((locale) => ({ locale }))
    );
  });
});
