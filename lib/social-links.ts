import { siFacebook, siInstagram, siTiktok, siYoutube } from "simple-icons";

export type SocialLink = {
  id: "instagram" | "facebook" | "youtube" | "tiktok";
  href: string;
  labelKey: `footer.social.${string}`;
  icon: { title: string; path: string };
};

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "instagram",
    href: "https://www.instagram.com/auto_cronica",
    labelKey: "footer.social.instagram",
    icon: siInstagram,
  },
  {
    id: "facebook",
    href: "https://www.facebook.com/autocronica",
    labelKey: "footer.social.facebook",
    icon: siFacebook,
  },
  {
    id: "youtube",
    href: "https://www.youtube.com/@auto_cronica",
    labelKey: "footer.social.youtube",
    icon: siYoutube,
  },
  {
    id: "tiktok",
    href: "https://www.tiktok.com/@auto_cronica",
    labelKey: "footer.social.tiktok",
    icon: siTiktok,
  },
];
