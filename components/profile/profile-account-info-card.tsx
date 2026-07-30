import { Calendar, Clock, Mail, User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { CopyAccountIdButton } from "@/components/profile/copy-account-id-button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatLongDate } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

interface ProfileAccountInfoCardProps {
  user: UserProfile;
  locale: string;
}

export async function ProfileAccountInfoCard({
  user,
  locale,
}: ProfileAccountInfoCardProps) {
  const t = await getTranslations("profile.account");

  return (
    <Card className="p-5">
      <p className="text-xs font-semibold tracking-widest text-primary uppercase">
        {t("title")}
      </p>

      <dl className="mt-4 space-y-4 text-sm">
        <div>
          <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
            <Mail aria-hidden="true" className="size-3.5" />
            {t("email")}
          </dt>
          <dd className="mt-1 font-medium text-foreground">{user.email}</dd>
        </div>

        <div>
          <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
            <Calendar aria-hidden="true" className="size-3.5" />
            {t("createdAt")}
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatLongDate(user.createdAt, locale)}
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
            <Clock aria-hidden="true" className="size-3.5" />
            {t("updatedAt")}
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {formatLongDate(user.updatedAt, locale)}
          </dd>
        </div>
      </dl>

      <Separator className="my-4" />

      <div>
        <p className="flex items-center gap-1.5 text-xs tracking-wide text-muted-foreground uppercase">
          <User aria-hidden="true" className="size-3.5" />
          {t("id")}
        </p>
        <div className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2">
          <span className="truncate font-mono text-xs text-foreground">
            {user.id}
          </span>
          <CopyAccountIdButton
            accountId={user.id}
            label={t("copyId")}
            copiedLabel={t("copied")}
          />
        </div>
      </div>
    </Card>
  );
}
