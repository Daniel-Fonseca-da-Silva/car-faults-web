import { getTranslations } from "next-intl/server";

export async function ProfilePageHeader() {
  const t = await getTranslations("profile");

  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="h-px w-6 bg-primary" />
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        {t("eyebrow")}
      </p>
    </div>
  );
}
