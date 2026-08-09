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
    href: "#",
    labelKey: "footer.social.instagram",
    icon: siInstagram,
  },
  {
    id: "facebook",
    href: "#",
    labelKey: "footer.social.facebook",
    icon: siFacebook,
  },
  {
    id: "youtube",
    href: "#",
    labelKey: "footer.social.youtube",
    icon: siYoutube,
  },
  {
    id: "tiktok",
    href: "#",
    labelKey: "footer.social.tiktok",
    icon: siTiktok,
  },
];
