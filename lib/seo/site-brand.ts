export function getSiteName(): string {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;

  if (!siteName) {
    throw new Error("NEXT_PUBLIC_SITE_NAME is not set");
  }

  return siteName;
}

export function getSiteContactEmail(): string {
  const contactEmail = process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL;

  if (!contactEmail) {
    throw new Error("NEXT_PUBLIC_SITE_CONTACT_EMAIL is not set");
  }

  return contactEmail;
}
