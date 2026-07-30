import { BadgeCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatLongDate, getInitials } from "@/lib/utils";
import type { UserProfile } from "@/types/user";

interface ProfileIdentityCardProps {
  user: UserProfile;
  locale: string;
}

export async function ProfileIdentityCard({
  user,
  locale,
}: ProfileIdentityCardProps) {
  const t = await getTranslations("profile");

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-grid-pattern relative h-24 bg-gradient-to-br from-primary/30 via-card to-background">
        <div className="absolute -bottom-8 left-5">
          <Avatar size="lg" className="size-16 ring-4 ring-card">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
            <AvatarFallback className="text-base">
              {getInitials(user.name)}
            </AvatarFallback>
            <AvatarBadge role="status" aria-label={t("identity.onlineStatus")} />
          </Avatar>
        </div>
      </div>

      <div className="px-5 pt-10 pb-5">
        <p className="text-lg font-bold text-foreground">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>

        <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          <BadgeCheck aria-hidden="true" className="size-4 text-primary" />
          {t("identity.memberSince", {
            date: formatLongDate(user.createdAt, locale),
          })}
        </div>
      </div>
    </Card>
  );
}
