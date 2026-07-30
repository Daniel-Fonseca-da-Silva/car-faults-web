import { render, screen } from "@testing-library/react";

import { locales } from "@/i18n/locales";
import type { UserProfile } from "@/types/user";
import type { UserStats } from "@/types/user-stats";
import type { UserVehicle } from "@/types/user-vehicle";

import ProfilePage, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: async (arg: string | { namespace: string }) => {
    const namespace = typeof arg === "string" ? arg : arg.namespace;
    return (key: string) => `${namespace}.${key}`;
  },
  setRequestLocale: jest.fn(),
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

describe("ProfilePage", () => {
  it("renders the header, sidebar and dashboard with the mocked profile data", async () => {
    const jsx = await ProfilePage({
      params: Promise.resolve({ locale: "pt-PT" }),
    });
    render(jsx);

    expect(screen.getByText("ProfilePageHeader")).toBeInTheDocument();
    expect(screen.getByText(/ProfileSidebar:/)).toBeInTheDocument();
    expect(screen.getByText(/ProfileDashboard:/)).toBeInTheDocument();
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
