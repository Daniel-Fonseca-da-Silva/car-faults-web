import { render, screen } from "@testing-library/react";

import { SOCIAL_LINKS } from "@/lib/social-links";

import { SocialLinks } from "./social-links";

const socialDict: Record<string, string> = {
  "footer.social.instagram": "Auto Crónica no Instagram",
  "footer.social.facebook": "Auto Crónica no Facebook",
  "footer.social.youtube": "Auto Crónica no YouTube",
  "footer.social.tiktok": "Auto Crónica no TikTok",
};

jest.mock("next-intl/server", () => ({
  getTranslations: async () => {
    return (key: string) => socialDict[key] ?? key;
  },
}));

describe("SocialLinks", () => {
  it("renders one link per configured social network with the real href", async () => {
    const jsx = await SocialLinks();
    render(jsx);

    for (const { href, labelKey } of SOCIAL_LINKS) {
      const link = screen.getByRole("link", { name: socialDict[labelKey] });
      expect(link).toHaveAttribute("href", href);
    }
  });

  it("opens links in a new tab with a safe rel attribute", async () => {
    const jsx = await SocialLinks();
    render(jsx);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(SOCIAL_LINKS.length);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("sets an accessible label on every link", async () => {
    const jsx = await SocialLinks();
    render(jsx);

    for (const { labelKey } of SOCIAL_LINKS) {
      expect(
        screen.getByRole("link", { name: socialDict[labelKey] })
      ).toBeInTheDocument();
    }
  });

  it("renders each icon as a decorative, aria-hidden svg", async () => {
    const jsx = await SocialLinks();
    const { container } = render(jsx);

    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(SOCIAL_LINKS.length);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });
});
