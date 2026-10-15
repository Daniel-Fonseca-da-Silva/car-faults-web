import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import {
  BACK_HOME_LINK_CLASS_NAME,
  NotFoundContent,
} from "@/components/layout/not-found-content";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <NotFoundContent
      title={t("title")}
      description={t("description")}
      imageAlt={t("imageAlt")}
      homeLink={
        <Link
          href="/"
          className={buttonVariants({
            size: "lg",
            className: BACK_HOME_LINK_CLASS_NAME,
          })}
        >
          {t("backHome")}
        </Link>
      }
    />
  );
}
