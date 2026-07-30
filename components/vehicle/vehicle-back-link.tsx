import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function VehicleBackLink() {
  const t = await getTranslations("faults.vehicle");

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {t("newSearch")}
    </Link>
  );
}
