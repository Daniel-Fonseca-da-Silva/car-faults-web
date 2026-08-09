import { getTranslations } from "next-intl/server";

import { SOCIAL_LINKS } from "@/lib/social-links";

export async function SocialLinks() {
  const t = await getTranslations("common");
  const links = SOCIAL_LINKS.filter(({ href }) => href !== "#");

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {links.map(({ id, href, labelKey, icon }) => (
        <a
          key={id}
          href={href}
          aria-label={t(labelKey)}
          className="text-muted-foreground transition-colors hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-4"
            aria-hidden="true"
          >
            <path d={icon.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}
